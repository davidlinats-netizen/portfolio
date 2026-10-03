# DAVIID portfolio

An interactive video editing portfolio built with Next.js, React, and TypeScript.

Features include categorized video samples, an infinite video marquee, an animated particle background with a rocket, draggable comets, and an editing timeline, light/dark themes, creative-tool logos, WhatsApp contact, and an optional Groq-powered portfolio assistant with a futuristic glass interface.

## Run locally

Requires Node.js 20.9 or later and npm.

```sh
npm install
npm run dev
```

Open http://localhost:3000.

## Optional AI assistant

Copy `.env.example` to `.env.local` and set your server-side `GROQ_API_KEY`. The portfolio works without it; the assistant shows contact options when unavailable. Never commit `.env.local` or API keys.

## Check and build

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

## Hosting

Use a host that supports Next.js server routes. Import this GitHub repository, use the default Next.js build settings, and configure the optional environment variables from `.env.example` in the host's settings.

Set `NEXT_PUBLIC_WHATSAPP_URL` to your WhatsApp contact URL before building to enable the WhatsApp button. Without it, the contact button offers a Calendly project call. The phone number is not stored in this repository.

The AI assistant uses process-memory request limits. For multi-instance public hosting, use a shared rate limiter and spending controls.

## Assets and motion

The repository includes the thumbnails, tool logos, and licensed local fonts used by the site. Font license files are included alongside the fonts. Original source footage, unused background videos, and unused character artwork are excluded.

Reduced-motion settings keep decorative animation static and make marquee items manually scrollable. Keyboard focus pauses marquees, and video dialogs support Escape and restore focus when closed.
