import { createGroq } from "@ai-sdk/groq";
import { APICallError, generateText, Output } from "ai";
import { assistantPrompt } from "@/lib/assistant-prompt";
import { chatRequestSchema, chatOutputSchema, readLimitedJson } from "@/lib/chat-validation";
import { validVideoIds, videos } from "@/lib/videos";
import { nextSamples } from "@/lib/sample-suggestions";
import { checkRateLimit, acquireRequest, releaseRequest, boundedLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
function configured() { const key = process.env.GROQ_API_KEY?.trim(); const provider = process.env.AI_PROVIDER?.trim().toLowerCase(); return (!provider || provider === "groq") && Boolean(key && !key.startsWith("replace_") && key.trim().length > 10); }
function json(data: unknown, status = 200, extraHeaders = {}) { return Response.json(data, { status, headers: { ...headers, ...extraHeaders } }); }
export async function GET() { return json({ available: configured(), provider: "Groq" }); }

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site" || (origin && origin !== new URL(request.url).origin)) return json({ error: "This request must come from the portfolio website." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "Send a JSON message." }, 415);
  let body: unknown;
  try { body = await readLimitedJson(request); } catch { return json({ error: "The message is too large or could not be read. Please send a shorter message." }, 400); }
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Please keep messages under 1,000 characters and start a new conversation if this one is long." }, 400);
  const limit = checkRateLimit(Date.now(), boundedLimit(process.env.CHAT_REQUESTS_PER_MINUTE, 10, 30), boundedLimit(process.env.CHAT_REQUESTS_PER_DAY, 100, 1000));
  if (!limit.allowed) return json({ error: "The assistant has reached its message limit. Please try later, or contact DAVIID directly." }, 429, { "Retry-After": String(limit.retryAfter) });
  if (!configured()) return json({ error: "The AI assistant isn’t connected yet. You can still explore the work or contact DAVIID directly." }, 503);
  if (!acquireRequest()) return json({ error: "The assistant is busy. Please try again in a moment." }, 429, { "Retry-After": "10" });
  try {
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY?.trim() });
    const selectedModel = process.env.GROQ_MODEL?.trim();
    const model = selectedModel && !selectedModel.startsWith("replace_") ? selectedModel : "openai/gpt-oss-20b";
    const { output } = await generateText({
      model: groq(model),
      system: assistantPrompt,
      messages: parsed.data.messages,
      output: Output.object({ schema: chatOutputSchema }),
      maxOutputTokens: 1200,
      maxRetries: 0,
      abortSignal: AbortSignal.any([request.signal, AbortSignal.timeout(20_000)]),
      providerOptions: { groq: { reasoningEffort: "low" } },
    });
    if (!output.answer.trim()) throw new Error("EMPTY_RESPONSE");
    if (output.samplesRequested) {
      const samples = nextSamples(parsed.data.shownVideoIds, output.sampleCategory);
      const answer = samples.length
        ? `Here ${samples.length === 1 ? "is another sample" : `are ${samples.length} samples`} from DAVIID’s portfolio:\n\n${samples.map(video => `- **${video.title}** (${video.category})`).join("\n")}\n\nSelect a sample below to watch it.`
        : output.sampleCategory
          ? "You’ve seen all the samples in this category. Want to explore another category?"
          : "You’ve seen all 16 portfolio samples in this conversation. You can replay any of them using the earlier sample buttons.";
      return json({ answer, videoIds: samples.map(video => video.id), offerContact: false });
    }
    // Keep playback references out of visible copy even if the model echoes one.
    const answer = videos.reduce((text, video) => text.replaceAll(video.id, video.title), output.answer);
    return json({ answer: answer.slice(0, 2000), videoIds: validVideoIds(output.videoIds).filter(id => !parsed.data.shownVideoIds.includes(id)), offerContact: output.offerContact });
  } catch (error) {
    // Never log provider errors: they may contain request bodies or credentials.
    if (APICallError.isInstance(error) && error.statusCode === 401) return json({ error: "The assistant’s API key was rejected. DAVIID needs to update the local Groq configuration. Please use WhatsApp for now.", code: "PROVIDER_AUTH" }, 503);
    if (APICallError.isInstance(error) && [400, 404].includes(error.statusCode ?? 0)) return json({ error: "The assistant’s model configuration needs updating. Please contact DAVIID directly for now.", code: "PROVIDER_MODEL" }, 503);
    if (APICallError.isInstance(error) && error.statusCode === 429) return json({ error: "The AI provider is busy or its usage limit has been reached. Please try later or contact DAVIID directly." }, 429, { "Retry-After": "60" });
    return json({ error: "The assistant couldn?t reply right now. Please try again, or continue with DAVIID on WhatsApp or Calendly." }, 503);
  } finally { releaseRequest(); }
}
