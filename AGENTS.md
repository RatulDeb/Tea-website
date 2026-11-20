# Leaf & Kettle — agent notes

Demo tea shop ("Leaf & Kettle", 20 teas) built with Vite + React 19 + TypeScript, React Router, plain CSS. Prices in BDT (৳).

## Links & accounts
- Live: https://teaghor.vercel.app — Vercel project `ratul-deb/teaghor`, account `debratul369-4574`.
- Repo: https://github.com/RatulDeb/Tea-website (branch `main`). Pushes auto-deploy in ~70s.
- Git identity: `RatulDeb` / `debratul369@gmail.com`.

## Workflow
The user edits in VS Code, then says "deploy". On deploy:
1. `npm run lint`
2. `npm run build`
3. `npm run test` (17 Playwright tests; must build first)
4. `git add` the intended files, commit with a concise message, `git push origin main`
5. Wait ~70s, check `npx --yes vercel ls`, then verify the live site with Playwright.

Only commit/push when asked. Do not add code comments.

## Commands
- `npm run dev` — local dev server
- `npm run lint` — oxlint
- `npm run build` — tsc + vite build
- `npm run test` — Playwright (runs against `dist` via `vite preview`)
- `npm run preview -- --host 127.0.0.1 --port 4186` — preview the build

## Features
- Sticky compact header/hero; product grid with search, category filter, sort; product modal.
- Whole tea card is clickable and opens details; "Add to Cart" and "View Details" stay independently clickable.
- Pack sizes in the modal: 250 g (default), 500 g, 1 kg, 2 kg, 3 kg, 4 kg, 5 kg. `BASE_GRAMS = 250`; product prices are per 250 g and other sizes scale linearly.
- Cart/checkout/order confirmation track `{ productId, grams, quantity }`; different sizes are separate lines.
- Checkout collects name, email, phone, and delivery address, saves the order to Supabase, and triggers a Telegram alert.
- Demo checkout: test-mode card (`4242 4242 4242 4242`, any future expiry/CVC) or pay on delivery; no real payments.
- Contact details only in the footer: Gmail compose (`ratuldeb014@gmail.com`), phone `tel:` links (+880 1606-958058, +880 1741-394978), address opens Google Maps (R tech Computer, Marwan Complex, Habiganj Road, Sreemangal, Moulvibazar, Sylhet), hours Monday–Thursday 10:00 AM – 8:00 PM.

## Control panel
- `/admin` — owner-only order desk: list, search, status/payment filters, expand for address/phone/items, update order/payment status, delete, CSV export, Telegram retry.
- Auth is Supabase email/password (`sb-…-auth-token` in localStorage); only members of `public.admin_users` can read/update/delete orders, and signups should be disabled.
- `supabase/schema.sql` creates `public.orders` and `public.admin_users`, indexes, RLS (anon insert only; `admin_users` members select/update/delete orders), update trigger, and Realtime publication.
- `src/lib/orders.ts` — order types, `placeOrder`, `fetchOrders`, `updateOrder`, `deleteOrder`, Telegram trigger.
- `api/notify-order.js` — Vercel function using the service role key to read the order and send a Telegram message, then set `notified_at`.
- `vercel.json` excludes `/api/` from the SPA rewrite.
- Env (see `.env.example`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (public); `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (server only). Setup guide: `ADMIN_SETUP.md`.
- If `.env.local` has Supabase keys, `npm run build`/`npm run test` can create one real test order; delete it from `/admin`.

## Key files
- `src/data/site.ts` — brand, `currency: 'BDT'`, shipping thresholds, contact
- `src/data/products.ts` — 20 products, `packSizes`, `BASE_GRAMS`, `getPackPriceCents`
- `src/lib/cart.ts` — cart lines/items/totals, `normalizeGrams`
- `src/lib/contact.ts` — Gmail/Tel/Google Maps URL helpers
- `src/lib/money.ts` — `Intl.NumberFormat` BDT with `narrowSymbol`
- `src/components/ProductModal.tsx`, `ProductCard.tsx`, `Footer.tsx`
- `src/pages/ShopPage.tsx`, `CartPage.tsx`, `CheckoutPage.tsx`, `AdminPage.tsx`
- `src/components/admin/AdminLogin.tsx`, `AdminSetup.tsx`, `AdminDashboard.tsx`, `AdminOrderCard.tsx`
- `api/notify-order.js`, `supabase/schema.sql`, `ADMIN_SETUP.md`

## Critical gotchas
- `package.json` and `index.html` must be UTF-8 **without BOM**; the write tool re-adds BOM, which breaks Vercel JSON parsing. Use:
  `[IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding($false)))`
- Tests serve `dist`: always `npm run build` before `npm run test` after CSS/TS changes, or tests hit stale assets.
- `visual-review/` is gitignored — use it for screenshots and throwaway Playwright scripts.
- Cart localStorage key is `leaf-kettle-cart-v1`; entries are `{ productId, grams, quantity }` (old entries without `grams` migrate to 250 g).
- SPA deep links rely on `vercel.json` rewrite to `/index.html`; the rewrite excludes `/api/`.
- Never put `SUPABASE_SERVICE_ROLE_KEY` or `TELEGRAM_BOT_TOKEN` behind a `VITE_` prefix.
