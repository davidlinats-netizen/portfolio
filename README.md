# DAVIID portfolio

A local Next.js App Router and TypeScript portfolio for DAVIID, with 16 categorized video samples, light/dark themes, accessible video dialogs, creative-tool and video marquees, and a Groq AI portfolio assistant.

## Preview on this Windows workspace

Dependencies are installed. Run `./start-preview.cmd` in PowerShell (or double-click the file), then open **http://localhost:3000**. The server binds to the local computer only. Stop it with Ctrl+C.

A portable Node.js and npm installation is available in `.tools/`. If `npm` is not on your PATH, use `./npm.cmd` instead, for example `./npm.cmd run build`. Keep `.tools/` for these Windows shortcuts.

## Standard setup

Requires Node.js 20.9 or later and npm.

1. `npm install`
2. Copy `.env.example` to `.env.local` **only if `.env.local` does not already exist**. This workspace already includes a private placeholder file.
3. Replace `GROQ_API_KEY` in `.env.local` with your new Groq API key locally. Never paste the key into chat, source code, screenshots, or browser settings.
4. `npm run dev`
5. Open http://localhost:3000.
6. `npm run build` checks a production build. `npm start` serves that build locally.

## AI configuration

Provider: **Groq**. Recommended model: **`openai/gpt-oss-20b`**. The model is configurable through `GROQ_MODEL`; a blank or placeholder value uses this default. `AI_PROVIDER=groq` is the supported integration. No Vercel account or AI Gateway is needed.

The local environment file uses placeholders. Replace only the key to get started; changing the model is optional. Restart the development server after updating environment variables. Missing or placeholder credentials leave the entire portfolio usable and the chat panel displays a friendly unavailable state with WhatsApp and Calendly links.

Requests travel from the browser to `/api/chat`, then from the server to Groq. The key stays on the server and is never sent to browser code, returned by the status endpoint, or printed in application logs. `.gitignore` excludes `.env.local` and all other environment files except `.env.example`. No repository was initialized.

The site stores no chat transcripts in localStorage, files, or a database. Conversation history exists only in the current page's memory and is sent to Groq with each request for context. Closing the panel retains the conversation for that page visit; the reset button or reloading clears it. Groq's own processing and retention policies apply. Do not enter confidential information.

Limits: 1,000 characters per visitor message, 12 messages / 8,000 characters of history per request, 16 KiB request body, 1,200 output tokens, 20-second provider timeout, no automatic retries, and two concurrent requests. Defaults are **10 requests/minute and 100/day across this local server**. Counts are process-memory only and reset when the server restarts. Failed valid requests also count. Environment limits are capped at 30/minute and 1,000/day. This global limiter is appropriate for the requested single-process local preview; it does not identify or store visitor IPs.

API usage can incur charges according to the Groq account and model. Configure account spend limits separately; the app's request counters are not a billing cap. Review the current [Groq models](https://console.groq.com/docs/models), [usage limits](https://console.groq.com/docs/rate-limits), and [data policy](https://console.groq.com/docs/your-data).

The assistant receives only approved portfolio information. It has no action tools, cannot send messages or book calls, and cannot change files. Generated sample IDs are checked against `lib/videos.ts`; links are created from trusted local configuration. Answers are rendered as escaped plain text. Prompt instructions reduce hallucination risk but cannot guarantee every model answer is correct; unknown prices, schedules, and other facts should be checked with DAVIID.

## Editing content

- `lib/site-config.ts`: DAVIID branding, introduction, six services, supplied tools, WhatsApp, Calendly.
- `lib/videos.ts`: all 16 original titles, YouTube IDs, and five categories (including five Real Estate samples).
- `lib/portfolio-knowledge.ts` and `lib/assistant-prompt.ts`: approved facts and AI behavior.
- `app/globals.css`: themes, responsive composition, and motion.
- `components/`: individual sections, shared video modal, theme provider, animation helpers, and chat panel.

The latest conversation brief supersedes older proposals in `portfolio.md`: both themes are implemented; the headline is â€œYour ideas Worth watchingâ€; contact details and AI assistant are included. The original Markdown files are preserved unchanged.

## Media

`Assets/hero.mp4` and `Assets/Video background.mp4` have identical SHA-256 hashes. They contain the same 8-second, 1280Ã—720 illustrated desk scene in a golden landscape. One optimized, audio-free copy is used for the hero, behind theme-specific contrast overlays. A WebP poster was extracted from the supplied video. The original files remain unchanged.

Supplied logos are copied to `public/assets/logos/`. Only provided creative-tool logos appear in the tools strip; WhatsApp is used in contact controls. Video thumbnails downloaded from the 16 supplied YouTube IDs are served locally from `public/assets/posters/`. Fonts are self-hosted using `next/font/local`. No generated imagery stands in for portfolio work.

YouTube iframes are created only after a sample is requested, using `youtube-nocookie.com`; opening one connects the visitor to YouTube. Closing immediately removes the iframe before the exit animation. A direct YouTube link remains available if embedding is blocked or unavailable.

## Accessibility and interaction

Dark mode is the first-visit default. An early inline script applies the saved preference before paint. Theme transitions respect reduced motion. Native dialogs provide focus containment and Escape behavior; video dialogs restore focus after closing. All major controls have visible focus styles.

Both marquees pause on hover/focus. Visible pause/play controls have been removed as requested. Video arrows move through the samples. Reduced motion removes duplicate tracks and provides manually scrollable originals. Duplicate items are hidden from assistive technology and excluded from keyboard tab order. Reveal effects never hide base content, so the page remains readable without JavaScript; video links then go directly to YouTube.

## Checks

If chat is unavailable, confirm the key is saved locally in `.env.local`, restart the preview, and use **Try connection again** in the assistant. The server needs outbound HTTPS access to Groq; a preview started in a network-restricted environment can display the site while chat requests fail. Start the preview from your normal local terminal in that case. Never paste your key into chat or commit it.

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

The tests cover category integrity, rejection of invented video IDs, request validation, byte limits, and rate-limit boundaries. Browser verification results and remaining limitations are recorded in `VERIFICATION.md`.

## Future deployment (not performed)

This workspace is configured for local use. Nothing has been pushed or deployed. If you later authorize a public deployment, configure server-side `GROQ_API_KEY`, `GROQ_MODEL`, and `AI_PROVIDER` in the hosting platform's environment settings. Never use a `NEXT_PUBLIC_` prefix for secrets. Before enabling public chat on Vercel or another multi-instance host, replace the local memory limiter with a shared atomic service (for example Redis), add a global spending budget, and verify trusted proxy/origin handling. Do not upload `.env.local`.

## Design guides

The supplied `taste skill.md` guided composition, `frontend design skill.md` guided implementation, and `impeccable.md` guides the final bounded review. The Impeccable launcher and referenced supporting documents were not supplied; no checks from those missing files are claimed.

