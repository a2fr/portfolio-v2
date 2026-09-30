# Alan Fresco — Portfolio v2

A personal portfolio designed as a music library / discography: projects are releases, professional
experiences are eras, skills are genres and instruments, case studies are tracklists.

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Structure

```
src/
  app/                    routes: / · /albums · /albums/[slug] · /about
  components/
    layout/               shell: sidebar, top bar + search, Now Playing (panel + mobile sheet), nav
    hero/                 home hero
    albums/               covers, cards, featured release, tracklist, library grid
    profile/              artist profile header
    motion/               MotionConfig (reduced motion) + reveal helpers
  data/
    albums.ts             the discography — all project content lives here
    profile.ts            profile, links, genres
  types/album.ts          Album model
```

## Editing content

- Add or edit a release in `src/data/albums.ts`; its page is generated at `/albums/<slug>`.
- Covers are generative placeholders (`cover.variant` + colours). To use final artwork, set
  `cover.image` to an image path (e.g. `/covers/piloteat.jpg` in `public/`).
- Resume and email are `null` in `src/data/profile.ts` and render as "coming soon" until set.
