# virtual-dj-station — an AI-hosted online radio (prototype)

No live demo. Built over a week in May and June 2025 as an early prototype, and not finished.

## What it is

"Radio IA": the idea is a 24/7 online radio that mixes free music from public APIs with tracks uploaded by
independent artists, presented by a virtual AI host. The project was scaffolded with Lovable (a Vite, React and
shadcn/ui starter) and extended by hand.

## What works and what does not

Implemented in the code:

- Audio player with a mixed queue, crossfade and a visualizer (`src/components/radio/`, `useAdvancedRadio`).
- Music source manager that pulls Creative Commons tracks from the Jamendo API (`src/services/MusicSourceManager.ts`).
- Email sign-up and login with Supabase Auth, and a protected dashboard route.
- A plans page with subscription tiers, showing Stripe price identifiers; no checkout flow is wired.
- AI host components and a Supabase Edge Function (`generate-dj-voice`) that turns a host script into speech with
  the ElevenLabs API.

Not implemented: artist uploads and moderation, the user dashboard beyond a stub, and real payments.

## Built with

React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui and Radix, React Router, TanStack Query, Supabase (auth,
database, Edge Functions on Deno).

## Run it locally

```bash
npm install
npm run dev        # Vite dev server
npm run build      # production build
npm run lint
```

The Supabase client in `src/integrations/supabase/client.ts` points at the original project. To use your own,
replace the URL and publishable key there and set `ELEVENLABS_API_KEY` as a secret for the Edge Function.

## Layout

```
src/pages/        index, login, register, dashboard, plans
src/components/   radio player, AI host, auth, layout, ui
src/hooks/        radio, DJ and subscription hooks
src/services/     music source manager
supabase/         Edge Function
```

---

Versión en español: prototipo (mayo-junio 2025) de una radio online 24/7 con locutor virtual de IA, reproductor con
cola mixta y crossfade, música libre de Jamendo y login con Supabase. La subida de artistas y los pagos no están
implementados.
