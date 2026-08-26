# Lanes

Arcade cook demo: run a recipe through timed Guitar Hero–style lanes — but at cook pace.

## Play

```bash
npm install
npm run dev
```

Open `/` — hit **Start Cook**, then do each step in real life and tap Board / Pot / Finish when you're done.

- Keys: `A` Board · `S` Pot · `D` Finish · `Space` open step
- Tap lanes on tablet (landscape works best)
- Sound is muted by default (`MUTE` / `SND` in the HUD)
- Each note stays hittable for about as long as that cook step takes

## Demo recipe

Hardcoded **weeknight lentil curry** (~14 min of play): dice, bloom, simmer, coconut, plate. Windows are cook-duration, not twitch taps.

## Stack

Next.js App Router · TypeScript · Tailwind · ready for Vercel (`npm run build`).
