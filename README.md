# DAURA & CO. — Clothing Store Website (Static Demo)

A responsive clothing storefront built with plain **HTML, CSS, and JavaScript**, styled with **Bootstrap 5**. It is a **static front-end demo** intended for design presentations, learning, and as a starting point for a real store. There is no build step and no backend.

> **Design direction:** editorial minimalism with sharp corners and generous whitespace, clear navigation, bold uppercase labels, product-first grids, and one clear call to action per section.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Pages](#pages)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [How It Works](#how-it-works)
6. [Customization](#customization)
7. [URL Parameters](#url-parameters)
8. [Tech Stack](#tech-stack)
9. [Code Organization](#code-organization)
10. [Accessibility and Performance](#accessibility-and-performance)
11. [Limitations](#limitations)
12. [Next Steps to Production](#next-steps-to-production)
13. [License](#license)

---

## Quick Start

No install, package manager, or build tool is required.

**Option 1 — Open directly**

Double-click `index.html`.

> Some browser features (especially `localStorage`) behave more reliably when the site is served over HTTP, so Option 2 is recommended.

**Option 2 — Local server (recommended)**

```bash
# Python 3
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

You can also use the **Live Server** extension in VS Code: right-click `index.html` and choose **Open with Live Server**.

---

## Pages

| Page | File | Description | Rendered by |
|---|---|---|---|
| Home | `index.html` | Hero slider, category tiles, featured products, editorial banner, New Arrivals carousel, value props, testimonials, Instagram grid, newsletter | `renderHomePage()`, `setupProductCarousel()` |
| Shop | `shop.html` | Editorial hero, filter sidebar, sorting, active filter tags, product grid, empty state | `renderShopPage()` |
| Product detail | `product.html` | Gallery, colour and size pickers, quantity, add to bag, metadata, FAQ accordion, related products | `renderProductPage()` |
| Cart | `cart.html` | Full shopping bag with editable quantities, remove, order summary | `renderCartPage()` |
| Checkout | `checkout.html` | Three-step demo form (contact, shipping, payment) with live order summary | `renderCheckoutPage()` |
| About | `about.html` | Brand story, mission, stats, values, team | Static HTML |
| Contact | `contact.html` | Contact cards, demo form, FAQ accordion | Static HTML + `setupDemoForms()` |
| Login | `login.html` | Split-layout sign-in form (demo only) | Static HTML + `setupDemoForms()` |
| Register | `register.html` | Split-layout account creation form (demo only) | Static HTML + `setupDemoForms()` |
| Journal | `blog.html` | Featured story and article grid | Static HTML |
| Journal article | `blog-single.html` | Full article layout with related stories | Static HTML |
| 404 | `error.html` | Custom not-found page with helpful links | Static HTML |

All pages share the same announcement bar, navigation, slide-out cart drawer, and footer. The newsletter section appears on the home, shop, product, cart, contact, and journal pages.

---

## Features

### Storefront

| Feature | Details |
|---|---|
| Hero slider | Bootstrap carousel with fade transitions and animated text |
| Category tiles | Women, Men, and Accessories with live product counts |
| Featured products | First 8 products rendered as a responsive grid |
| New Arrivals carousel | Horizontal product carousel with circular looping, autoplay, arrows, and pause-on-interaction |
| Product catalog | 16 demo products across men, women, and accessories |
| Shop filters | Category, product type, size, colour, and maximum price, plus sorting |
| Active filter tags | Removable tags and a clear-all action |
| Mobile filters | Slide-in offcanvas filter drawer below 992px |
| Product page | Gallery thumbnails, colour/size selection, quantity, related products |
| Slide-out cart | Offcanvas drawer available on every page |
| Full cart page | Editable quantities, remove, subtotal, shipping, and total |
| Checkout demo | Live order summary and a simulated place-order flow |
| Auth pages | Login and register forms with a split image layout (demo only) |
| Journal | Blog landing page, featured story, article grid, and single-post layout |
| Persistent cart | Saved in `localStorage` under the key `daura_cart` |
| Toasts | "Added to bag" and demo form confirmations |
| Back to top | Floating button that appears after scrolling |
| Auto footer year | Copyright year is filled by JavaScript |

### Design and UX

| Feature | Details |
|---|---|
| Design tokens | Colours, fonts, navigation height, radius, transitions, and shadows are CSS variables |
| Responsive layout | Mobile navigation, fluid grids, touch-friendly down to 320px |
| Scroll reveal | Sections fade or slide in using `IntersectionObserver` |
| Reduced motion | `prefers-reduced-motion` disables animations and carousel autoplay |
| Accessible controls | ARIA labels, keyboard-friendly buttons, visible focus states |
| Lazy product images | Product card images use `loading="lazy"` |

---

## Project Structure

```text
cloth-store/
├── index.html              Home page
├── shop.html               Shop page with filters and sorting
├── product.html            Product detail page (reads ?id= from the URL)
├── cart.html               Full shopping bag
├── checkout.html           Demo checkout flow
├── about.html              Brand story, stats, values, team
├── contact.html            Contact form, info cards, FAQ
├── login.html              Sign-in page (demo)
├── register.html           Account creation page (demo)
├── blog.html               Journal landing page
├── blog-single.html        Journal article page
├── error.html              Custom 404 page
├── CODE-GUIDE.md           Guided code walkthrough and study exercises
├── assets/
│   ├── css/
│   │   └── style.css       Entire design system and page styles
│   ├── js/
│   │   └── main.js         Product data, cart, filters, renderers, behaviours
│   ├── fonts/              Reserved for self-hosted font files
│   └── images/
│       ├── about/          Reserved for local about-page images
│       ├── banner/         Reserved for local banner images
│       ├── blog/           Reserved for local blog images
│       ├── category/       Reserved for local category images
│       ├── icons/          Reserved for local icons
│       ├── logo/           Reserved for local logo files
│       ├── product/        Reserved for local product images
│       ├── shop/           Reserved for local shop images
│       ├── favicon.ico
│       ├── favicon.png
│       └── favicon.svg
└── README.md
```

The `assets/images/*` folders currently contain `.gitkeep` placeholders. All demo photography is loaded from **Unsplash** URLs directly in the HTML and JavaScript.

---

## How It Works

### Product data

Every product lives in the `PRODUCTS` array at the top of `assets/js/main.js`. Each product has this shape:

```js
{
  id: 1,                    // Used in product.html?id=1
  name: "Midnight Oversized Tee",
  category: "men",          // "men" | "women" | "accessories"
  type: "T-Shirts",         // Product type used by shop filters
  price: 49,                // Current price in dollars
  oldPrice: null,           // Original price, or null when not on sale
  badge: "new",             // "new" | "sale" | null
  rating: 5,                // 1–5
  colors: ["#14100e"],      // CSS colour values
  sizes: ["S", "M", "L"],   // Available sizes
  image: "...",             // Main card image
  imageHover: "...",        // Image shown on card hover
  gallery: ["...", "..."],  // Product detail gallery
  description: "..."        // Short product story
}
```

The same array powers the home page, shop page, product page, related products, category counts, and cart data.

### Cart and persistence

The `Cart` object in `main.js` handles all bag behaviour:

- `read()` / `save(items)` read and write `localStorage`.
- `add(product, size, color, qty)` merges matching product/size/colour lines.
- `changeQty(index, delta)` and `remove(index)` update individual lines.
- `clear()` empties the bag after a demo order.
- `count()`, `subtotal()`, and `shippingCost()` calculate totals.
- `updateBadge()` updates the number on the cart icon.
- `renderDrawer()` rebuilds the slide-out drawer.

`setupCartDrawer()` injects the offcanvas drawer into every page, so the bag is available from any page.

**Shipping rules** are defined in one place:

```js
const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_RATE = 9.99;
```

### Shop filters

`renderShopPage()` builds the filter sidebar and product grid. Filter options are generated from the current product data, so they never show irrelevant choices:

- **Category:** All, Women, Men, Accessories
- **Product type:** only types present in the selected category
- **Size:** only sizes present in the selected category, excluding `One Size`
- **Colour:** only colours present in the selected category
- **Price:** maximum-price range slider
- **Sorting:** Featured, Price low to high, Price high to low, Name

Filters update the grid, result count, and active filter tags immediately. Selecting a category also clears any type, size, or colour that no longer applies. On screens below 992px, the sidebar becomes an offcanvas drawer using Bootstrap's `offcanvas-lg` behaviour.

### New Arrivals carousel

The home page carousel renders each "new" product three times and starts in the middle copy:

```text
[ copy 1 ] [ copy 2 ] [ copy 3 ]
              ^ start here
```

When scrolling reaches the third copy, the track jumps back by one copy width. Because the copies are identical, the jump is invisible and the carousel loops in both directions.

Settings at the top of `main.js`:

```js
const CAROUSEL_AUTOPLAY_MS = 5000; // time between automatic slides
const CAROUSEL_COPIES = 3;         // copies used for a seamless loop
```

Behaviour:

- Advances automatically every 5 seconds.
- Arrows move one card at a time.
- Autoplay pauses on hover, focus, touch, and when the browser tab is hidden.
- Arrows are hidden when the products fit on one screen.
- `prefers-reduced-motion` disables autoplay and smooth scrolling.

### Forms

All forms are front-end demos and do not send data anywhere:

| Form | Selector | Behaviour |
|---|---|---|
| Newsletter | `.js-newsletter` | Shows a success toast and resets |
| Contact | `#contactForm` | Shows a success toast and resets |
| Login | `#loginForm` | Shows a toast, then redirects to `index.html` |
| Register | `#registerForm` | Shows a toast, then redirects to `index.html` |
| Checkout | `#checkoutForm` | Validates that the bag is not empty, clears the cart, shows a toast, then redirects to `index.html` |

### Navigation and animations

- On the home page, the navbar starts transparent over the hero and becomes solid after 60px of scrolling.
- Inner pages use the solid navbar from the start.
- The transparent navbar is offset below the announcement bar using a CSS variable calculated by JavaScript.
- Sections with `.reveal` or `.reveal-stagger` animate in once when they enter the viewport.
- The back-to-top button appears after 500px of scrolling.
- The footer copyright year is filled automatically.

---

## Customization

### Change colours and fonts

Open `assets/css/style.css` and edit the `:root` block at the top:

```css
:root {
  --ink: #14100e;          /* main text and buttons */
  --ink-soft: #2a2320;     /* slightly lighter ink for hover */
  --cream: #f7f3ed;        /* page background */
  --paper: #ffffff;        /* card surfaces */
  --sand: #e9e1d6;         /* alternate section background */
  --line: #ddd4c8;         /* hairline borders */
  --muted: #6e655c;        /* secondary text */
  --clay: #b5563c;         /* accent colour for CTAs and sale */
  --clay-dark: #9c4630;    /* accent hover */
  --sale: #a93226;         /* sale price red */
  --success: #2e7d5b;      /* success green */

  --font-display: "Playfair Display", Georgia, serif;
  --font-body: "Inter", -apple-system, sans-serif;

  --nav-height: 72px;
  --radius: 0px;           /* sharp corners */
  --transition: 0.35s cubic-bezier(0.25, 0.6, 0.3, 1);
  --shadow-soft: 0 18px 40px rgba(20, 16, 14, 0.08);
}
```

Changing a variable updates every page that uses it. Fonts are loaded from Google Fonts in each HTML `<head>`. To self-host fonts, add the files to `assets/fonts/` and update the `@font-face` rules and font links.

### Edit products and prices

Edit the `PRODUCTS` array in `assets/js/main.js`. Keep `id` values unique. The product page uses `product.html?id=<id>`, and the cart stores product IDs.

To add a product:

1. Add a new object to `PRODUCTS`.
2. Give it a unique `id`.
3. Use one of the existing categories: `men`, `women`, or `accessories`.
4. Add images, sizes, colours, and a description.
5. Set `badge` to `"new"` to include it in New Arrivals, or `"sale"` to show a sale badge.

### Change shipping rules

Edit the constants near the top of `main.js`:

```js
const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_RATE = 9.99;
```

These values are used by the cart drawer, cart page, and checkout summary.

### Change carousel timing

```js
const CAROUSEL_AUTOPLAY_MS = 5000;
const CAROUSEL_COPIES = 3;
```

Keep `CAROUSEL_COPIES` at 3 or more. The loop logic assumes multiple identical copies.

### Replace demo images

The demo uses Unsplash URLs in:

- `index.html` — hero slides, category tiles, editorial image, testimonial avatars, Instagram grid
- `about.html`, `contact.html`, `blog.html`, `blog-single.html`, `login.html`, `register.html`
- `assets/js/main.js` — product images and galleries

Replace those URLs with local paths such as:

```text
assets/images/product/midnight-tee-1.jpg
assets/images/product/midnight-tee-2.jpg
```

The reserved image folders are already in place. Favicons are available in `assets/images/` as `.ico`, `.png`, and `.svg`.

---

## URL Parameters

The shop and product pages read values from the query string:

| URL | Result |
|---|---|
| `shop.html?category=women` | Opens the shop filtered to Women |
| `shop.html?category=men` | Opens the shop filtered to Men |
| `shop.html?category=accessories` | Opens the shop filtered to Accessories |
| `shop.html?type=T-Shirts` | Opens the shop filtered to a product type |
| `product.html?id=3` | Opens the product with ID 3 |

Invalid category values fall back to **All Products**. Invalid product IDs fall back to the first product.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | Semantic HTML5 |
| Styling | CSS3: custom properties, grid, flexbox, animations |
| Behaviour | Vanilla JavaScript (ES6), no framework |
| UI components | Bootstrap 5.3 via CDN: grid, navbar, carousel, offcanvas, accordion, toasts |
| Icons | Bootstrap Icons via CDN |
| Fonts | Google Fonts: Playfair Display (headings) and Inter (body) |
| Demo photography | Unsplash |

There is no `package.json`, bundler, or compile step.

---

## Code Organization

> For a guided tour, data-flow diagrams, trace exercises, and a glossary, see **[CODE-GUIDE.md](CODE-GUIDE.md)**.

### `assets/js/main.js`

The file is divided into eight labelled sections:

1. **Products** — `PRODUCTS` array and shared constants
2. **Helpers** — `formatMoney()`, `renderStars()`, `getProductById()`, `categoryLabel()`, `shippingCost()`
3. **Product card HTML** — `productCardHTML()`, the single card template used everywhere
4. **Cart system** — the `Cart` object and `setupCartDrawer()`
5. **Toast notification** — `showToast()`
6. **Page renderers** — `renderHomePage()`, `renderShopPage()`, `renderProductPage()`, `renderCartPage()`, `renderCheckoutPage()`
7. **Global behaviours** — quick add, navbar, carousel, reveal animations, demo forms, footer year
8. **Boot** — the `DOMContentLoaded` listener that starts everything

### `assets/css/style.css`

The stylesheet is divided into 27 numbered sections, listed in the banner comment at the top of the file. Major areas include:

- Design tokens and base styles
- Typography and buttons
- Announcement bar and navbar
- Hero, category tiles, product cards, and carousel
- Marquee, feature banner, editorial split, testimonials, Instagram grid
- Newsletter and footer
- Cart drawer, shop filters, product page
- About, contact, cart, checkout, auth, blog, and error pages
- Toast, back-to-top, scroll reveal, and responsive fixes

### HTML pages

Each page begins with a short page map comment, and sections are marked with comments such as `<!-- ===================== HERO SLIDER ===================== -->`.

---

## Accessibility and Performance

- Interactive controls include `aria-label`, `aria-controls`, and visible focus styles where appropriate.
- Navigation and forms are usable with a keyboard.
- `prefers-reduced-motion` reduces animations, disables marquee movement, and stops carousel autoplay.
- Product card images use native lazy loading.
- Scroll animations use `IntersectionObserver`, so they only run when sections enter the viewport.
- The carousel stops when the browser tab is hidden.
- `overflow-x: clip` on the body prevents horizontal scrolling without breaking the sticky shop sidebar.

---

## Limitations

This project is a front-end demo, not a production store:

- **No backend or database.** Products are hard-coded in `main.js`.
- **No real authentication.** Login and register only show a toast and redirect.
- **No real payments.** Checkout relies on browser form validation, then clears the cart locally.
- **Cart is browser-local.** It is stored in `localStorage` and is not synced across devices.
- **Forms do not send data.** Newsletter and contact forms only display confirmation toasts.
- **Internet required for demo assets.** Bootstrap, icons, fonts, and images load from CDNs.
- **No server-side 404 handling.** `error.html` exists but must be configured by the host.
- **No inventory, taxes, discounts, or order history.**

---

## Next Steps to Production

1. **Payments** — integrate Stripe, Razorpay, or a Shopify Buy Button.
2. **Backend** — move products, carts, and orders to a database or commerce API (Firebase, Supabase, Shopify, or a custom API).
3. **Authentication** — add real sign-up, sign-in, sessions, and password reset.
4. **Forms** — connect the newsletter and contact forms to EmailJS, Formspree, or your backend.
5. **Inventory and orders** — add stock tracking, order confirmation emails, and order history.
6. **CMS** — let the store owner edit products and journal posts without touching code.
7. **Hosting** — deploy on GitHub Pages, Netlify, or Vercel, and configure the 404 page.
8. **Testing** — add cross-browser checks, form validation tests, and accessibility audits.

---

## License

Demo project — free to use for learning, client presentations, and personal projects. Product photography is courtesy of [Unsplash](https://unsplash.com).
