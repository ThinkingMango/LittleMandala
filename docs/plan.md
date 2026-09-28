# Little Mandala — App Plan (tablet-first, ages 3–7, plus a grown-up pack)

Current state: a working coloring app with **real parent accounts on Supabase**, **one-time pack pricing** and **working Stripe checkout in test mode**. Parents can buy packs, bundles and the Standard unlock with Stripe Embedded Checkout. Pictures unlock only from rights rows in the database, which only the server writes after Stripe confirms payment. Stack: Next.js 16 App Router, Tailwind v4, shadcn on Base UI, lucide icons, Supabase (`@supabase/ssr`), Stripe (`stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`).

## Changes from the original plan

| Area | Original plan | Now |
|---|---|---|
| Billing platform | **Paddle Billing** (Paddle.js overlay, Paddle webhook, Paddle price ids) | **Stripe.** Embedded Checkout in a dialog on the Pricing page, a signed webhook at `/api/stripe/webhook`, and prices sent inline from our own price table, so there are no Stripe price ids to keep in step. All Paddle code, tables and the "Paddle not connected" badge are gone. Running on **test keys**. |
| Pricing model | Free vs **Family plan** (subscription), plus packs sold on their own | **No subscription.** Every pack is **$4.99 one time, however many pages it has**. Bundles: any 3 for $12.99, any 5 for $19.99. Standard's 6 locked pages: **$1.99 one time**. Everything bought is kept for good. |
| Family plan | The main way to unlock everything | **Removed.** A `membership` row opens nothing, and paid pages use `tier: 'paid'`. |
| Pricing page | Plan cards | Offer cards, a pack picker with a live order summary, the cheapest mix of bundles, a "add N more to reach a bundle" nudge, and a **Buy** button that opens Stripe checkout. |
| Parent overview | Account, plan status, a grid of every picture, setup status, settings | One column: **Picture packs** (one line per pack: Open / "4 of 10 free" / Locked, plus "Get more packs" only if something is locked), Account, Cloud saving, This device. |
| Packs | 5 packs, 74 pages, all for children | **10 published packs (154 pages)**: the original 5, second volumes of Ocean Friends, Safari Garden and Christmas Garden, **Flowers Garden** and **Surprise Garden**. One draft: **Zen Mandalas** (grown-ups, 8 detailed pages). |
| Saved pictures | One draft per page that came back on every visit | **My garden**: finished pictures live on their own page. Every visit to a page from its pack starts white. A garden picture can be opened again and updated (see My garden). |
| Audience | Children only | Packs have an `audience`: `children` (default) or `grown-ups`. It changes the art rules, line weight and palette. |
| Palette | 12 colors for every page | Children: the same 12. Grown-up pages: **24 colors**. |
| Art rules | 10–24 areas, nothing thinner than 40 units | Unchanged for children. Grown-ups: 40–640 areas, as thin as 10 units, fine outline. |
| Pipeline | `pnpm trace-pack` plus hand steps | Each pack is one `art/<pack>/` folder, run step by step with `pnpm packs <command>` (see `art/README.md`). |
| Tests | 80 | 162 in 12 files, all passing. |

## Pricing

All prices are in `lib/billing/pricing.ts`, in US cents. Nothing there depends on how many pages a pack has.

| Offer | Price | Per pack |
|---|---|---|
| One pack (`single`) | $4.99 | $4.99 |
| Any three packs (`bundle-3`) | $12.99 | $4.33 |
| Any five packs (`bundle-5`) | $19.99 | $4.00 |
| Finish the Standard pack (6 pages) | $1.99 | — |

- `quotePacks(n)` works out the cheapest mix of offers for exactly `n` chosen packs. For example 4 packs = a three-pack bundle plus one single, $17.98.
- `bundleNudge(selected, available)` suggests adding packs only when that many unowned packs remain and the bundle beats buying them one by one.
- Packs already owned show "Yours to keep" and can't be chosen again.
- Only **published** packs are for sale (`SOLD_PACKS`). Drafts like Zen Mandalas aren't sold yet.
- A bundle isn't an entitlement of its own. After payment, each chosen pack gets its own `scope = 'pack'` row.

## Payments (Stripe)

**Checkout** (`app/actions/checkout.ts`, `components/parent/pricing/checkout-dialog.tsx`):
1. The parent picks packs on `/parent/billing` and taps Buy. The browser sends only pack ids, the Standard flag and a random attempt id.
2. `startPackCheckout` (server action) checks the signed-in parent, loads the packs they already own, and rebuilds the order on the server with `buildOrder` (`lib/billing/order.ts`). It rejects unknown, draft or already-owned packs, empty orders and more than 40 packs, then prices the order from `lib/billing/pricing.ts`. Nothing the browser sends sets a price.
3. It creates a Stripe Checkout Session: `mode: 'payment'`, `ui_mode: 'embedded_page'`, inline `price_data` in USD per line, `client_reference_id` and `metadata.parent_id` set to the parent, `metadata.pack_ids` set to the packs being granted. It reuses the parent's Stripe customer or creates one from their email. The idempotency key `pack-checkout:<parent>:<attemptId>` means a double tap or retry never makes a second session.
4. The dialog shows Stripe's embedded form. Card details go straight to Stripe and never reach our server.

**Opening packs right away:**
- When the embedded form completes, `confirmPackCheckout(sessionId)` fetches the session from Stripe and grants the packs at once. It only works for the parent who started that checkout, so the parent doesn't wait on the webhook.
- Payment methods that leave the page come back to `/parent/billing?session_id=…`, and `purchase-notice.tsx` does the same confirm step.
- Rights rows accept a `starts_at` up to 5 minutes ahead of the device's clock, so a pack bought a moment ago opens without a reload on devices whose clock runs slightly behind.

**Webhook** (`app/api/stripe/webhook/route.ts`):
- The Stripe signature is checked with `STRIPE_WEBHOOK_SECRET`. Unsigned or badly signed requests get a 400.
- Every event is logged in `webhook_events` with its attempt count and last error. It's handled at most once, and a failed attempt returns 500 so Stripe retries it.
- `checkout.session.completed` and `checkout.session.async_payment_succeeded` fulfil the order. `checkout.session.async_payment_failed` is handled so nothing is granted. `charge.refunded` for a full refund marks the transaction `refunded` and revokes the packs it opened.

**Fulfilment** (`lib/billing/fulfil.ts` → SQL function `fulfil_checkout_session`): records the customer, one `transactions` row per paid session, and one `pack` entitlement per granted pack, all or nothing. It's safe to run twice because the confirm step and the webhook both call it, and Stripe retries.

**Keys** (project env vars): `STRIPE_SECRET_KEY` (server, currently `sk_test_…`), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (embedded form) and `STRIPE_WEBHOOK_SECRET`. The Stripe client is created lazily in `lib/stripe.ts`.

## Routes

| Route | Audience | Purpose |
|---|---|---|
| `/` | Kid | Home: the pack shelf, a **My garden** card (three newest pictures and a count, shown after the first save), and a small parent entry in the top corner. |
| `/packs/[id]` | Kid | One pack's pictures. Locked ones show a lock and an "Ask a grown-up" bubble, never a link to pricing. |
| `/color/[id]` | Kid | Coloring screen: white canvas, palette plus eraser, Undo, Start over, Done. `?art=<artworkId>` opens a garden picture with its colors. |
| `/garden` | Kid | My garden: every finished picture, newest first. Tap to keep coloring it, X to take it out (asks first). |
| `/parent` | Parent | **Parent gate** (hold a button for 3 seconds, or answer a simple sum). On pass it sets `sessionStorage["lm:gate"]` and goes to `/parent/home`. |
| `/parent/sign-in` | Parent | One-time email link through Supabase Auth. |
| `/auth/callback`, `/auth/confirm` | Server | Finish the email-link sign-in (branded email templates). |
| `/parent/home` | Parent | Overview: Picture packs, Account, Cloud saving, This device (settings, "Clear saved coloring", sign out). |
| `/parent/billing` | Parent | Pricing: offers, the pack picker and order summary, the Standard unlock, and **Buy** with Stripe Embedded Checkout. It also confirms returning checkouts (`?session_id=`). |
| `/parent/grown-ups`, `/parent/color/[id]` | Parent | Grown-up shelf and coloring behind the parent gate. Returns 404 while `GROWN_UPS_OFFERED` is `false`. |
| `/parent/cloud-saving` | Parent | Opt in to copying finished pictures to the account (needs recorded consent). |
| `/parent/delete-account` | Parent | Deletes the account. Payment records are kept as the law requires. |
| `/api/account` | Server | Account actions that need the service role (for example deletion). |
| `/api/stripe/webhook` | Server | Verified Stripe events: fulfilment and refunds. |

Layouts:
- `app/(kid)/layout.tsx`: full-bleed white. No text navigation, no links out, no purchase prompts.
- `app/parent/layout.tsx`: calmer adult UI with a header and "Back to coloring". Every parent route except `/parent` checks the gate flag.

## Data

Supabase tables (5 migrations in `supabase/migrations/`, the last is `20260928120000_billing_on_stripe.sql`), all with owner-only RLS:
- `profiles`, `consent_notices`, `consent_records`: parent accounts and the consent notice they agreed to.
- `artworks`, `artwork_deletions`: cloud copies of pictures, only after cloud-saving consent (`has_cloud_consent()`).
- `billing_customers` (`parent_id` → `stripe_customer_id`), `transactions` (one row per paid Checkout Session: session id, payment intent id, pack ids, amount, currency, `paid`/`refunded`), `webhook_events`: written only by the server with the service role. Parents can read their own rows. `subscriptions` uses Stripe ids but is unused, and kept in case a subscription comes back.
- `entitlements`: what a parent can open. `scope = 'pack'` with a `pack_id` opens one pack for good. For a Stripe purchase, `source_id` is the Checkout Session id. Membership rows are ignored. A row counts only while `revoked_at` is null, `starts_at` has passed (5 minutes of clock skew allowed) and `ends_at` hasn't.
- Deleting a parent sets `transactions.stripe_customer_id` to null instead of deleting the payment record.

Access check: `lib/entitlements.ts` loads only the parent's `pack` rows, and `canColor(page)` decides each page. Free pages are always open. A pack row opens only its own pack. A `standard` row opens Standard's 6 locked pages. No row opens everything.

On-device storage: artwork is saved on the device and stays there unless the parent turns on cloud saving. No child data goes to the server without that consent.

## My garden and saving rules

Logic is in `startSession` and `saveSession` in `lib/artwork/library.ts`, used through `hooks/use-coloring.ts`:
- **From a pack:** a page always opens white. Coloring that wasn't saved is thrown away when the child leaves or reloads.
- **"I'm done":** the picture is added to My garden, and the pack page is white on the next visit.
- **From My garden** (`/color/<id>?art=<artworkId>`): the page opens with the saved colors. Leaving without saving changes nothing. Saving updates that picture in its spot in the garden. It gets a new id, and the old id is marked removed so cloud sync replaces the cloud copy instead of keeping both. Back and "More pictures" return to My garden.
- A garden id for a different page is ignored, and the page opens white.
- The home page shows only the garden card (`components/kid/garden-cover.tsx`). The full grid is on `/garden` (`components/kid/my-garden.tsx`), so 20–30 pictures never crowd the home page.

## Palette

- **Children: 12 colors** in six pairs of a bold color and its softer partner: Red/Pink, Orange/Peach, Yellow/Lime, Green/Sky blue, Blue/Purple, Brown/Gray (`PALETTE`). A 2-row grid in portrait and a 2-column grid in landscape, with the eraser set apart. Swatches are 64px on tablets and 44px on phones.
- **Grown-ups: 24 colors**: six families of four shades, pale to deep (`GROWN_UP_FAMILIES`, `components/coloring/tonal-palette.tsx`): Rose, Sun, Leaf, Sea, Violet, Earth. Families are columns in portrait and rows in landscape. Chips are 56px on tablets and 40px on phones. Default color: Rose.
- The coloring screen picks the palette from the page's pack `audience`. Both palettes share the radio keyboard logic (`use-palette-radios.ts`).
- Color keys never change once shipped, because saved artwork stores them. `ALL_COLORS` holds all 36 keys. Tokens are `--swatch-*` in `app/globals.css`, and downloaded pictures use matching hex values (`lib/cloud-sync/artwork-svg.ts`).

## Picture packs

| Pack | Audience | Status | Pages | How it unlocks |
|---|---|---|---|---|
| Standard | Children | Published | 10 (4 free, 6 locked) | Locked pages: the $1.99 Standard unlock |
| Ocean Friends | Children | Published | 16 | $4.99, or part of a bundle |
| Safari Garden | Children | Published | 16 | $4.99, or part of a bundle |
| Easter Garden | Children | Published | 16 | $4.99, or part of a bundle |
| Christmas Garden | Children | Published | 16 | $4.99, or part of a bundle |
| Ocean Friends 2 (`ocean-friends-two`) | Children | Published | 16 | $4.99, or part of a bundle |
| Safari Garden 2 (`safari-garden-two`) | Children | Published | 16 | $4.99, or part of a bundle |
| Christmas Garden 2 (`christmas-garden-two`) | Children | Published | 16 | $4.99, or part of a bundle |
| Flowers Garden | Children | Published | 16 | $4.99, or part of a bundle |
| Surprise Garden | Children | Published | 16 | $4.99, or part of a bundle |
| Zen Mandalas | Grown-ups | **Draft** | 8 | Not sold until published. Then $4.99 like any pack. |

- 154 published pages, 162 with the draft. Nine packs are sold separately.
- Flowers Garden has 292 named areas and Surprise Garden 226 (peek-a-boo scenes such as Mushroom House and Treasure Chest).
- Pack ids can't contain digits, so second volumes use `-two` ids but show "2" in their names.
- Draft packs appear only in development and the v0 preview (`SHOW_DRAFT_PACKS`).
- Each pack's name, description, icon, status, audience and page list live in `art/<pack>/pages.json`. `pnpm packs sync` generates `lib/templates/registry.generated.ts`, and `lib/packs.ts` builds `PACKS`, `PACK_BY_ID` and `SOLD_PACKS`.
- Known quirks: Christmas `fox-lantern` is named "Snowy Fox". Safari Garden 2's first page shipped as `bear-cub`. Flowers Garden's Pot Trio and Frog Lily are a little loose but meet the rules.

### Art rules (`AUDIENCE_RULES` in `scripts/trace-pack/segment.ts`)

| Rule | Children | Grown-ups |
|---|---|---|
| Areas per page | 10–24 | 40–640 |
| Thinnest area | 40 units | 10 units |
| Smallest area | 0.4% of the page | 0.025% of the page |
| Outline | Bold | Fine, and the drawing's own lines stay visible inside merged areas |
| Thin slivers | Fail the page | Merged into their neighbor |

Every page is square with a pure white background and one uniform black outline, and every shape is closed. There's no shading, text or frame. On children's pages, eyes and smiles are small ink details, and shapes are soft and friendly.

### Pipeline (`pnpm packs <command>`, full guide in `art/README.md`)

1. **Plan:** `pnpm packs new` creates `art/<pack>/pages.json` as a draft.
2. **Draw:** `pnpm packs prompts` prints the style prompt and a line per page. Art is saved in `art/<pack>/source/<id>.png`.
3. **Trace:** `pnpm packs trace <pack>` writes `lib/templates/<pack>/<id>.json` under the audience rules. `pnpm packs sheet` makes review sheets in `.pack-review/`. Failed pages are redrawn, not patched.
4. **Name:** `pnpm packs labels` gives every area a spoken name (`--by-position` for grown-up pages).
5. **Publish:** `pnpm packs status`, then `pnpm packs publish`.

## UI and accessibility

- Canvas is pure white with soft charcoal outlines (bold for children, fine for grown-ups).
- Landscape tablet (default): palette on one side, tools on the other, canvas centered. Portrait: palette along the bottom, tools along the top.
- Controls have an icon, an `aria-label` and a visible focus ring, at least 44px on phones and 64px on tablets. The exceptions are grown-up chips (40px on phones) and grown-up areas.
- Start over and taking a picture out of My garden both ask with a big Yes/No dialog.
- A small bounce on fill and a gentle sparkle on Done, both off under `prefers-reduced-motion`.
- Nunito via `next/font`. Light mode only.

## Tests

`pnpm test`: 162 tests in 12 files, all passing.
- Pack manifests match traced files, every page meets its audience's rules, and page ids are unique. `SOLD_PACKS` is exactly the published packs sold separately.
- Pricing: offer table, cheapest quote for any count, bundle nudge, flat $4.99.
- **Checkout orders** (`lib/billing/order.test.ts`): server-side order building, rejecting unknown, draft or owned packs, empty orders and oversized orders.
- Palettes, unlock rules (guests, pack owners, Standard unlock, membership rows, expired or future rows), pack tools, tracer, coloring screen, cloud consent, cloud-sync engine.
- **Saving rules:** pages start white, unsaved work is dropped, a save goes to the garden, garden pictures reopen with colors, and a save updates them in place and marks the old id for cloud removal.
- Live Supabase tests (`.v0-live/`) cover cloud sync and isolation between two accounts. They run separately.

## Test account

`lawrence.law@hotmail.com` now holds only rights from **real Stripe test-mode checkouts**. The old hand-made rows and the membership row are gone.
- $4.99 single: Ocean Friends.
- $12.99 three-pack bundle: Christmas Garden, Easter Garden, Safari Garden.

It can't open Standard's 6 locked pages, Ocean Friends 2, Safari Garden 2, Christmas Garden 2, Flowers Garden or Surprise Garden. Those are good for testing another purchase. Use Stripe's test card `4242 4242 4242 4242`, any future date and any CVC.

## Open gaps

1. **Stripe is in test mode.** No real money can be taken yet. Going live needs live keys and a live webhook endpoint (next steps 1–2).
2. **Partial refunds don't revoke anything.** Only a full refund (`charge.refunded` with `refunded: true`) closes the packs. That's deliberate for now, since a partial refund can't say which pack it covers. Handle partial refunds by hand in the Stripe dashboard.
3. **Grown-up packs are hidden.** The grown-ups shelf behind the parent gate exists, but `GROWN_UPS_OFFERED = false` and Zen Mandalas is still a draft.
4. **`components/parent/not-connected-badge.tsx` is unused** since Stripe went in, and can be deleted.

## Next steps

1. **Go live with Stripe:** claim or activate the Stripe account, then set the live `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` for Production only, keeping test keys in Preview and Development.
2. **Register the production webhook** at `https://mandala.smartmango.ai/api/stripe/webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `charge.refunded`. Put its signing secret in Production's `STRIPE_WEBHOOK_SECRET`.
3. **Make one small live purchase** (the $1.99 Standard unlock) and refund it, to check fulfilment, the webhook log and refund revocation end to end.
4. **Delete the unused `NotConnectedBadge`.**
5. **Publish Zen Mandalas:** check the remaining review sheets, publish the pack and set `GROWN_UPS_OFFERED = true`.

## Verification

- Click through every route at tablet landscape (1180×820), portrait (820×1180) and phone (390×844).
- Buy a pack with the Stripe test card. It should open straight after payment without a reload, and appear once in `transactions` and once per pack in `entitlements`. Replay the webhook in the Stripe dashboard and check nothing is duplicated.
- Refund that payment in full. The pack should lock again.
- Locked tiles never link to pricing. The order summary always shows the cheapest total, and the charged amount matches it.
- My garden: a pack page starts white, "I'm done" adds to the garden, and a garden picture reopens with colors and updates in place.
- `pnpm exec tsc --noEmit` and `pnpm test` both pass.
