# Leaf & Kettle

A complete, responsive demo tea shop built with React, TypeScript, Vite, React Router, and lucide-react.

The store includes 20 loose-leaf teas and herbal infusions, a 20% demo discount, search/filter/sort, product detail dialogs, a persistent cart, shipping progress, a validated demo checkout, and a confirmation screen. All copy and sample business details are editable.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

Do not open `index.html` directly or use VS Code Live Server. The app is built from TypeScript/JSX source files, which require the Vite development server; Live Server only serves raw files and will show a blank page.

## Build

```bash
npm run build
npm run preview
```

The production output is written to `dist/`.

## Test

```bash
npm run lint
npm run build
npx playwright install chromium
npm run test
```

Use `npm run test:e2e` for the functional flow only or `npm run test:a11y` for the accessibility audit only.

The end-to-end suite covers the 20-product catalog, discount and image checks, search, filters, sorting, the product dialog, cart persistence and quantities, shipping thresholds, checkout validation, order confirmation, and mobile navigation. The axe-core audit checks every page plus the product dialog, checkout validation state, and mobile menu for serious or critical WCAG A/AA issues.

## Demo behavior

- Every pack is displayed at 20% off, from a 250 g pouch up to 5 kg. The sale price is stored in the cart as the only charged price; the original price and savings are shown for context.
- Shipping is a flat `৳4.95`, free at `৳35.00` and above. No tax or extra charges are added.
- The cart is saved in localStorage under `leaf-kettle-cart-v1` and stays available after a refresh.
- Checkout is a demonstration only. It collects a shipping address plus test-mode card fields (or "pay on delivery"), shows a sample order number, but never charges money, stores card details, or sends email. Use test card `4242 4242 4242 4242` with any future expiry and any CVC.
- Placing a demo order clears the cart.

## Customize

- Catalog, prices, tasting notes, and brewing guides: `src/data/products.ts`
- Brand, currency, shipping rule, contact details, and demo notes: `src/data/site.ts`
- Category guide, brewing table, choosing steps, and service copy: `src/data/content.ts`
- Image attribution: `src/data/credits.ts`
- Page styling and responsive layout: `src/styles.css`
- Product and hero images: `public/images/`

Service wording, product origins, prices, and package details are sample content. Business and contact details live in `src/data/site.ts`.

## Deployment

Deploy `dist/` to any static host. Because the app uses client-side routing, configure the host to rewrite unknown paths to `index.html` (SPA fallback). For a subpath deployment, set Vite's `base` option and update image paths accordingly.

## Image credits

Photographs are illustrative images from Wikimedia Commons. They remain under the licenses listed in `public/images/CREDITS.md`; replacing them with original packshots is recommended before launch.
