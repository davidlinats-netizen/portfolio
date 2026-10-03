import { z } from "zod";
import { categories, videos } from "./videos";

export const chatRequestSchema = z.object({
  shownVideoIds: z.array(z.enum(videos.map(video => video.id) as [string, ...string[]])).max(videos.length).optional().default([]),
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(2000),
  }).strict()).min(1).max(12),
}).strict().superRefine(({ messages }, context) => {
  if (messages[0]?.role !== "user" || messages.at(-1)?.role !== "user") context.addIssue({ code: "custom", message: "Conversation must start and end with a visitor message." });
  if (messages.reduce((count, message) => count + message.content.length, 0) > 8000) context.addIssue({ code: "custom", message: "Conversation is too long." });
  if (messages.some((message, index) => index > 0 && message.role === messages[index - 1].role)) context.addIssue({ code: "custom", message: "Messages must alternate." });
  if (messages.some(message => message.role === "user" && message.content.length > 1000)) context.addIssue({ code: "custom", message: "Visitor messages are limited to 1000 characters." });
});

// Keep provider JSON schema simple. Enforce lengths again before returning to the browser.
export const chatOutputSchema = z.object({ answer: z.string(), videoIds: z.array(z.string()), offerContact: z.boolean(), samplesRequested: z.boolean(), sampleCategory: z.enum(categories).nullable() });

export async function readLimitedJson(request: Request, maxBytes = 16384) {
  if (Number(request.headers.get("content-length") || 0) > maxBytes) throw new Error("BODY_TOO_LARGE");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("EMPTY_BODY");
  const chunks: Uint8Array[] = [];
  let size = 0;
  const timer = setTimeout(() => { void reader.cancel(); }, 5000);
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new Error("BODY_TOO_LARGE"); }
      chunks.push(value);
    }
    const buffer = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder().decode(buffer));
  } finally { clearTimeout(timer); reader.releaseLock(); }
}
