# KAUVEX — Ecommerce Homepage

A premium ecommerce homepage built with Next.js 15, TypeScript, and Tailwind CSS,
featuring the KAUVEX brand identity (red/orange palette, Poppins + Inter type,
signature diagonal "ribbon" badges on sale tags and banners).

## Design notes

This build implements the full feature set you asked for — sticky header,
mega menu, hero slider with a "Today's Deals" widget, promo strip, Deal of
the Day with a live countdown, tabbed Top Products, five category blocks
(Beauty, Electronics, Fashion, Furniture, Appliances) each pairing a banner
with a product row, a large promo banner grid, circular category icons,
an auto-scrolling brand strip, vendor showcase, mini-cart dropdown,
newsletter band, and a full multi-column footer.

It is an **original layout and visual design** for KAUVEX — not a
recreation of any specific existing theme's exact composition. Section
order, spacing, card styling, and banner treatments were designed fresh
for this brief so the site is genuinely yours rather than a reskin of
someone else's commercial template.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Structure

```
app/
  layout.tsx        Root layout, fonts, metadata
  page.tsx           Assembles all homepage sections
  globals.css         Tailwind + design tokens (ribbon badge, divider)
components/
  TopBar.tsx
  Header.tsx          Sticky header, search, mini cart drawer
  MegaMenu.tsx         Vertical category mega menu + nav
  HeroSection.tsx      Slider + Today's Deals widget
  PromoStrip.tsx
  CountdownTimer.tsx
  DealOfDay.tsx
  TopProducts.tsx      Tabbed product grid
  CategoryBlock.tsx    Reusable banner + product row
  PromoBanners.tsx
  CategoryIcons.tsx
  BrandSlider.tsx
  VendorShowcase.tsx
  Newsletter.tsx
  Footer.tsx
  ProductCard.tsx      Shared product card (badge, rating, hover actions)
lib/
  types.ts
  data.ts             Mock product/category/brand data (Unsplash images)
```

## Notes on placeholder images

Product and banner images use `source.unsplash.com` keyword URLs so every
section is populated with realistic, relevant photography out of the box.
Swap these for your real product photography by replacing the `image`
fields in `lib/data.ts`.

## Next steps you may want

- Wire `Header`'s search input and category dropdown to real search/filter logic
- Connect the cart/wishlist state to a global store (Context or Zustand) instead of local component state
- Add a product detail page and quick-view modal
- Add Framer Motion scroll-reveal on section entry if you want more motion
