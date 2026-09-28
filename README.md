# LittleMandala

A calm, tablet-first coloring app for young children. Kids pick a flower mandala, tap petals to fill them with color, and keep finished pictures in their own garden. A separate, gated area lets grown-ups manage the account, plan, and device settings.


## Features

### For kids

- **Flower picker** — 10 flower mandalas, 4 of them free. Locked flowers point to a grown-up instead of a paywall.
- **Tap-to-fill coloring** — twelve colors plus an eraser that turns a single petal white again.
- **Undo and Redo** — up to 50 steps per flower, covering fills, erases, and Start over. History is saved on the device, so it survives leaving the flower or reloading the page.
- **Start over** — clears the flower after a confirmation, and can itself be undone.
- **My Garden** — finished pictures are saved here. Garden pictures are never modified: continuing to color a finished flower creates a new copy.

### For grown-ups (`/parent`)

- **Parent gate** — a grown-up check guards every parent page for the current browser session.
- **Sign in** — email and password or magic link (currently mocked).
- **Pricing** — picture packs bought once and kept, with bundles and a Standard unlock. There's no subscription. Payments run through Stripe Embedded Checkout; `/api/stripe/webhook` records each paid order and opens its packs. Production (`VERCEL_ENV=production`) takes real payments with `STRIPE_LIVE_SECRET_KEY`, `STRIPE_LIVE_PUBLISHABLE_KEY` and `STRIPE_LIVE_WEBHOOK_SECRET`; previews and local development use the test keys `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_WEBHOOK_SECRET`, and never fall back to live keys.
- **Device settings** — motion and haptics toggles.
- **Integration status** — shows which backend services are connected.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) and React 19
- [Tailwind CSS v4](https://tailwindcss.com) with [shadcn/ui](https://ui.shadcn.com) and Base UI primitives
- [lucide-react](https://lucide.dev) icons
- [Vitest](https://vitest.dev) and Testing Library with jsdom
- [Vercel Analytics](https://vercel.com/analytics) (production only)

## Getting started

This project uses **pnpm** (see `packageManager` in `package.json`).

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script           | What it does                                                   |
| ---------------- | -------------------------------------------------------------- |
| `pnpm dev`       | Start the development server                                   |
| `pnpm build`     | Create a production build                                      |
| `pnpm start`     | Serve the production build                                     |
| `pnpm test`      | Run the test suite once                                        |
| `pnpm typecheck` | Type-check the project without emit                            |
| `pnpm packs`     | Add a picture pack step by step (see [art/README.md](art/README.md)) |

## Adding a picture pack

Every pack lives in its own folder in `art/`, holding the page list, the pictures and the area names. The app picks packs up from there, so you never edit app code to add one. Follow the five steps in [art/README.md](art/README.md), or run `pnpm packs status` to see where each pack stands.

No environment variables are needed to run the app today; auth and billing run on local mocks.

## Routes

| Route             | Purpose                                  |
| ----------------- | ---------------------------------------- |
| `/`               | Flower picker and My Garden              |
| `/color/[id]`     | Coloring screen for one flower           |
| `/parent`         | Grown-up gate                            |
| `/parent/sign-in` | Parent sign-in                           |
| `/parent/home`    | Overview: plan, account, device settings |
| `/parent/billing` | Plans and checkout                       |

## Project structure

```
art/                One folder per picture pack: pages, pictures, area names
app/
  (kid)/            Kid-facing routes: picker and coloring screen
  parent/           Gated grown-up routes
components/
  coloring/         Coloring screen, palette, tool buttons, dialogs
  kid/              Picker grid, tiles, My Garden
  parent/           Gate, sign-in, plan and settings cards
  ui/               shadcn/ui primitives
hooks/              useColoring, useArtworkLibrary
lib/
  artwork/          Artwork library: drafts, gallery, undo/redo history
  auth/             Auth client interface and mock implementation
  billing/          Billing client interface, plans, mock implementation
  mandalas.ts       Versioned flower template definitions
  packs.ts          The pack catalog, built from art/
  templates/        Traced pack pages and the generated pack registry
  entitlements.ts   Which flowers a plan unlocks
  local-store.ts    Typed localStorage/sessionStorage store
scripts/            pnpm packs and the tracer
test/               Vitest setup
```

## How artwork is stored

All artwork lives in the browser's `localStorage`, so it stays on the device and needs no account:

| Key               | Contents                                   |
| ----------------- | ------------------------------------------ |
| `lm:v2:artworks`  | Every artwork's fills, keyed by artwork id |
| `lm:v2:drafts`    | The in-progress artwork for each flower    |
| `lm:v2:gallery`   | Ordered ids of garden pictures             |
| `lm:v2:history`   | Undo and redo steps for each flower        |

Rules the library enforces (see `lib/artwork/library.ts`):

- **Templates are append-only.** Each artwork is pinned to the template version it was started on, so published versions in `lib/mandalas.ts` must never be edited. Add a new version instead.
- **Garden pictures are immutable.** Any edit to a saved picture forks a new draft.
- **Stored data is validated on read.** Unknown regions, colors, and malformed history steps are dropped.
- Art saved before versioning is migrated once, and the old key is then removed.

Settings (`lm:settings`) also live in `localStorage`. The parent gate (`lm:gate`) uses `sessionStorage`.

## Auth and billing

- `lib/auth/client.ts` — parent sign-in with Supabase Auth (`useAuthState()`, `useParentUser()`).
- `lib/entitlements.ts` — `useEntitlements()` reads the parent's `pack` rows from the `entitlements` table. Only the billing server writes them, so nothing on the device can unlock a picture.

Each purchase is a `pack` row. The table also accepts `membership` rows so a subscription could come back later, but the app ignores them today.

## Testing

```bash
pnpm test
```

Tests cover the artwork library (persistence, migration, tamper scrubbing, undo/redo, garden protection) and the coloring screen's user flows.

## Deployment

This repository is linked to a [v0](https://v0.app) project and deploys on [Vercel](https://vercel.com). Changes made in v0 are pushed to this repo, and every merge to `main` deploys automatically.
