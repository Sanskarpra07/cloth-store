# DAURA & CO. — Code Study Guide

This guide is for reading the code, not for changing the design. It explains how the static pages, the JavaScript renderers, and the CSS fit together, and it gives you traces you can follow in DevTools.

For setup, features, and customization, read `README.md` first.

---

## 1. The one-sentence mental model

Each HTML file is a **static shell**; `assets/js/main.js` finds empty containers by `id` and fills them with HTML built from the `PRODUCTS` array and from the cart saved in `localStorage`.

There is no framework, no bundler, and no backend. That makes the whole flow visible in three files:

| File | Responsibility |
|---|---|
| `*.html` | Page structure, shared navbar/footer, and empty mount points |
| `assets/css/style.css` | All visual styling, design tokens, responsive rules |
| `assets/js/main.js` | Data, rendering, cart state, filters, carousel, form demos |

Bootstrap 5 (CDN) supplies the grid, navbar, offcanvas, accordion, carousel, and toast behaviour. Bootstrap Icons and Google Fonts are also CDN links.

---

## 2. How to run and inspect it

```bash
# from the project root
npx serve .
# or use the VS Code Live Server extension
```

Open the local URL, then open DevTools:

- **Elements** — see the HTML that JavaScript injected.
- **Console** — check for errors and run snippets.
- **Application → Local Storage** — inspect `daura_cart`.
- **Sources** — set breakpoints in `main.js`.

Useful console commands:

```js
// See the saved cart
JSON.parse(localStorage.getItem("daura_cart") || "[]")

// Clear the cart
localStorage.removeItem("daura_cart")
location.reload()

// See all products (PRODUCTS is global in main.js)
PRODUCTS.length
```

---

## 3. Reading order

Read in this order the first time:

1. `README.md` — what the site does.
2. `index.html` — the shared page shell and the home page structure.
3. `assets/js/main.js` sections 1–5 — data, helpers, card template, cart, toast.
4. `assets/js/main.js` section 6 — one renderer per page.
5. `assets/js/main.js` sections 7–8 — global behaviours and the boot sequence.
6. `assets/css/style.css` sections 1–5 — design tokens and base styles.
7. `shop.html` and `product.html` — the two most JavaScript-driven pages.
8. The rest of the CSS and the simpler static pages.

The banner comments at the top of `main.js` and `style.css` list the section order, so you can jump straight to a topic.

---

## 4. File map

```text
index.html          Home page shell: hero, categories, featured grid,
                    editorial split, New Arrivals carousel, testimonials
shop.html           Shop shell: sidebar mount points, toolbar, grid, empty state
product.html        Product shell: #productDetail and #relatedGrid
cart.html           Full bag shell: #cartPageItems and #cartSummary
checkout.html       Three-step demo form + #checkoutSummary
about.html          Static brand story
contact.html        Static info cards, form, FAQ
login.html          Static split auth layout
register.html       Static split auth layout
blog.html           Static journal listing
blog-single.html    Static article layout
error.html          Static 404 page

assets/js/main.js   All behaviour and rendering
assets/css/style.css All styling
README.md           Setup, features, customization, limitations
CODE-GUIDE.md       This study guide
```

Every HTML page starts with a comment listing its sections and shared blocks. Most pages also mark major sections with comments such as:

```html
<!-- ===================== HERO SLIDER ===================== -->
```

---

## 5. The data flow

```text
PRODUCTS (main.js)
   │
   ├─ renderHomePage() ──────→ #featuredGrid, #newGrid, category counts
   ├─ renderShopPage() ──────→ #filterGroups, #shopGrid, #activeFilters
   ├─ renderProductPage() ───→ #productDetail, #relatedGrid
   └─ productCardHTML() ─────→ every product tile

User clicks "Add to Bag"
   │
   └─ Cart.add(product, size, color, qty)
         │
         ├─ Cart.read()  ← localStorage("daura_cart")
         ├─ merge or push a line
         ├─ Cart.save(items)
         │     ├─ localStorage.setItem(...)
         │     ├─ Cart.updateBadge()      → .cart-badge
         │     ├─ Cart.renderDrawer()     → #cartItems, #cartFooter
         │     ├─ renderCartPage()        → cart.html
         │     └─ renderCheckoutPage()    → checkout.html
         └─ showToast("... added to bag")
```

Two ideas make this work:

1. **The cart stores copies of product fields.** It does not store a reference to `PRODUCTS`, so the drawer and cart page can render even if the product list changes later.
2. **The cart line identity is `id + size + color`.** The same product in two sizes is two lines.

---

## 6. Page lifecycle

Every page runs the same boot function at the bottom of `main.js`:

```js
document.addEventListener("DOMContentLoaded", function () {
  setupCartDrawer();
  setupQuickAdd();
  setupTransparentNavOffset();
  setupNavbarScroll();
  setupBackToTop();
  setupRevealAnimations();
  setupDemoForms();
  setupFooterYear();

  renderHomePage();
  setupProductCarousel();
  renderShopPage();
  renderProductPage();
  renderCartPage();
  renderCheckoutPage();
});
```

Each renderer starts by looking for its container and returning early if the container is missing:

```js
const grid = document.getElementById("shopGrid");
if (!grid) return;
```

That is why the same `main.js` can be loaded on every page. Only the renderer whose mount point exists does any work.

---

## 7. Walkthrough: the home page

Open `index.html` and `renderHomePage()` side by side.

1. The HTML contains the hero carousel, static editorial sections, and empty containers:
   - `#featuredGrid`
   - `#newGrid`
   - `[data-cat-count]` elements inside the category tiles.
2. `renderHomePage()` counts products per category and writes text such as `6 Products` into each tile.
3. It renders the first 8 products into `#featuredGrid`:

   ```js
   featuredGrid.innerHTML = PRODUCTS.slice(0, 8).map(productCardHTML).join("");
   ```

4. It filters products with `badge === "new"` and renders them three times into `#newGrid`:

   ```js
   const cards = newProducts.map(productCardHTML).join("");
   newGrid.innerHTML = new Array(CAROUSEL_COPIES).fill(cards).join("");
   ```

5. `setupProductCarousel()` then:
   - starts the track in the middle copy,
   - moves one card per arrow click or autoplay tick,
   - jumps back by one copy width when it reaches an edge.

The three copies are the trick. Because copy 1, 2, and 3 are identical, the jump is invisible.

---

## 8. Walkthrough: shop filters

Open `shop.html` and `renderShopPage()` together. The function is long because it contains the filter model, the sidebar builder, the filtering logic, and the event wiring.

### 8.1 State

The source of truth is the `state` object:

```js
const state = {
  category: params.get("category") || "all",
  type: params.get("type") || "all",
  maxPrice: maxPrice,
  sizes: [],
  colors: [],
  sort: "featured"
};
```

- `category` and `type` can come from the URL, e.g. `shop.html?category=women`.
- `sizes` and `colors` are arrays because the user can select several.
- `sort` is only used when drawing the grid.

### 8.2 Building the sidebar

`buildFiltersHTML()` creates the sidebar from `PRODUCTS`:

- `availableTypes()` — only types in the current category.
- `availableSizes()` — only sizes in the current category, excluding `One Size`.
- `availableColors()` — only colours in the current category.
- `group()` — wraps each section in a Bootstrap collapse.

This is why the filter options change when you switch from All Products to Women.

### 8.3 Filtering

`getFilteredList()` applies every active condition:

```js
if (state.category !== "all" && p.category !== state.category) return false;
if (state.type !== "all" && p.type !== state.type) return false;
if (p.price > state.maxPrice) return false;
// sizes: at least one selected size must be available
// colours: at least one selected colour must be available
```

Then it sorts the result and returns it.

### 8.4 Drawing

`applyFilters()` does three things:

1. `grid.innerHTML = list.map(productCardHTML).join("")`
2. shows or hides `#shopEmpty`
3. updates `#resultsCount` and the active filter tags.

### 8.5 Interaction

Event delegation keeps the listeners alive even though the sidebar is re-rendered:

```js
groupsWrap.addEventListener("click", function (event) {
  const catBtn = event.target.closest("[data-cat]");
  // ...
});
```

The `data-*` attributes are the contract between the HTML and the JavaScript:

| Attribute | Meaning |
|---|---|
| `data-cat` | Category filter value |
| `data-type` | Product type filter value |
| `data-size` | Size filter value |
| `data-color` | Colour filter value |
| `data-remove-type` | Active tag type to remove |
| `data-remove-value` | Active tag value to remove |

When the category changes, the code also removes any selected type, size, or colour that no longer exists in the new category. That prevents impossible filter combinations.

---

## 9. Walkthrough: product page

Open `product.html` and `renderProductPage()`.

1. The URL is read with `new URLSearchParams(window.location.search)`.
2. `getProductById(params.get("id") || 1)` finds the product, falling back to the first product.
3. The function builds:
   - gallery thumbnails,
   - colour buttons,
   - size buttons,
   - price markup,
   - the full two-column detail layout.
4. It writes the result into `#productDetail`.
5. It wires the controls:
   - gallery thumbnails swap `#galleryMain`,
   - colour buttons update `selectedColor`,
   - size buttons update `selectedSize` and `#sizeLabel`,
   - quantity buttons update `qty`,
   - `#pdAddToCart` calls `Cart.add(product, selectedSize, selectedColor, qty)`.
6. Related products are filtered by the same category, excluding the current product, and rendered into `#relatedGrid`.

The fallback content in `product.html` (`Loading product…`) is replaced as soon as the renderer runs. If JavaScript is disabled, that fallback remains visible.

---

## 10. Walkthrough: cart and checkout

### 10.1 Adding an item

`setupQuickAdd()` handles every `[data-add-id]` button with one delegated listener. Quick Add uses the product's first size and colour.

The product page uses its own button so it can pass the user's chosen size, colour, and quantity.

Both paths end at `Cart.add()`.

### 10.2 Reading and saving

```js
read()  → JSON.parse(localStorage.getItem("daura_cart") || "[]")
save()  → localStorage.setItem("daura_cart", JSON.stringify(items))
```

`save()` is also the central refresh point. After writing to storage it updates the badge, the drawer, the cart page, and the checkout summary.

### 10.3 The drawer

`setupCartDrawer()` injects the offcanvas markup into `document.body` on every page. This is why the bag is available everywhere without duplicating the drawer in 12 HTML files.

The drawer uses delegated clicks for `[data-qty-index]` and `[data-remove-index]`.

### 10.4 The cart page

`renderCartPage()` reads the cart and renders one `.cart-line` per item. Each line has:

- a link to `product.html?id=<id>`,
- size and colour text,
- quantity buttons with `data-cp-qty` and `data-cp-index`,
- a remove button with `data-cp-remove`.

It also renders the summary and disables the checkout link when the bag is empty.

### 10.5 Checkout

`renderCheckoutPage()` builds the order summary from the same cart. The form is a demo:

1. `setupDemoForms()` prevents the default submit.
2. It checks that the cart is not empty.
3. It clears the cart.
4. It shows a toast and redirects to `index.html`.

No payment data leaves the browser.

---

## 11. Global behaviours

These run on every page and are safe when their elements are absent.

| Function | What it does |
|---|---|
| `setupCartDrawer()` | Injects the drawer and wires cart controls |
| `setupQuickAdd()` | Delegated "+ Quick Add" handling |
| `setupTransparentNavOffset()` | Stores announcement height in `--announcement-height` |
| `setupNavbarScroll()` | Transparent → solid navbar |
| `setupBackToTop()` | Shows the floating button after 500px |
| `setupRevealAnimations()` | Adds `.visible` once with `IntersectionObserver` |
| `setupDemoForms()` | Newsletter, contact, login, register, checkout demos |
| `setupFooterYear()` | Fills `.js-year` with the current year |

The navbar logic is worth reading closely:

- `index.html` uses `nav-transparent` because the navbar sits over the hero.
- Inner pages use the solid navbar from the start.
- After 60px of scrolling on the home page, `nav-transparent` is removed and `is-scrolled` is added.
- `--announcement-height` is calculated by JavaScript because the announcement bar can wrap to two lines on small screens.

---

## 12. CSS architecture

`style.css` is organized in 27 numbered sections. The order matters:

1. **Tokens** (`:root`) — colours, fonts, nav height, radius, transition, shadow.
2. **Base** — body, headings, links, images, scrollbar.
3. **Typography helpers** — `.eyebrow`, `.section-title`, `.section-sub`.
4. **Buttons** — `.btn-ink`, `.btn-outline-ink`, etc.
5. **Layout helpers** — `.section-pad`, carousel arrows.
6. **Shared chrome and home page** — announcement, navbar, hero, categories, product cards, carousel, marquee, features, editorial, testimonials, Instagram, newsletter, footer.
7. **Page-specific styles** — cart drawer, shop, product, about, contact, feedback, reveal, responsive fixes, shop redesign, cart/checkout/auth/blog/error.

### How the layout works

- Bootstrap's grid classes in the HTML handle columns and gutters.
- `style.css` adds the editorial look: spacing, type, borders, hover states, and responsive changes.
- The product carousel overrides Bootstrap column widths inside `.product-carousel-track`.
- The shop sidebar becomes sticky only above 992px; below that it is an offcanvas drawer.
- `overflow-x: clip` on `body` prevents sideways scrolling without breaking `position: sticky`.

### Responsive strategy

Most sections add their own `@media` rules near the component. Section 25 collects shared fixes:

- below 992px: mobile nav spacing, 3-column Instagram grid, smaller section padding, vertical reveal animations;
- below 576px: smaller button and newsletter padding;
- `prefers-reduced-motion`: near-zero animation durations and no marquee.

---

## 13. HTML architecture

Each page follows the same shell:

```text
<!DOCTYPE html>
<head>
  meta, title, favicons, description
  Google Fonts
  Bootstrap CSS + Icons
  style.css (last so it can override Bootstrap)
</head>
<body>
  announcement bar
  navbar
  page-specific content
  newsletter (on some pages)
  footer
  Bootstrap JS
  main.js
</body>
```

The navbar and footer are duplicated on every page. That is normal for a static site with no templating system. If you change a nav link, change it in every HTML file.

JavaScript mount points are usually empty containers:

```html
<div id="featuredGrid"></div>
<div id="shopGrid"></div>
<div id="productDetail"></div>
<div id="cartPageItems"></div>
<div id="checkoutSummary"></div>
```

Search for these IDs when tracing a renderer.

---

## 14. Tracing exercises

Use these to test your understanding. Try to predict the result before running the code.

### Exercise 1 — Follow one product card

1. Open `index.html`.
2. Find `productCardHTML()` in `main.js`.
3. Identify which fields become the image `src`, the link `href`, the badge, and the price.
4. Change a product's `name` in `PRODUCTS` and confirm it updates on the home and shop pages.

### Exercise 2 — Follow one filter click

1. Open `shop.html`.
2. Click **Women** in the sidebar.
3. In DevTools, put a breakpoint on `state.category = catBtn.dataset.cat;`.
4. Step through:
   - which types/sizes/colours are removed,
   - how `refreshSidebar()` rebuilds the options,
   - how `applyFilters()` redraws the grid and tags.

### Exercise 3 — Follow an add-to-bag action

1. Open any product page.
2. Put a breakpoint on `Cart.add` in the Sources panel.
3. Click **Add to Bag**.
4. Step through `read()`, the merge check, `save()`, and `showToast()`.
5. Check `localStorage` in the Application panel.
6. Open the drawer and confirm the line and totals.

### Exercise 4 — Trace the carousel loop

1. Open `index.html`.
2. In DevTools, inspect `#newGrid` and count the product cards. You should see three copies.
3. Find `getCopyWidth()` and `keepScrollInsideMiddleCopy()`.
4. Scroll the carousel to the right edge and watch the track jump back by one copy width.

### Exercise 5 — Add a page section

1. Add a new `<section>` to `index.html` with an `id`.
2. Add a renderer in `main.js` that finds that `id` and returns early if it is missing.
3. Call the renderer from the boot function.
4. Style it in `style.css` with a new numbered section or inside the relevant existing section.

---

## 15. Where to change common things

| Goal | File | What to edit |
|---|---|---|
| Add or edit a product | `assets/js/main.js` | `PRODUCTS` array |
| Change prices | `assets/js/main.js` | `PRODUCTS[].price` / `oldPrice` |
| Change colours/fonts | `assets/css/style.css` | `:root` variables |
| Change shipping rules | `assets/js/main.js` | `FREE_SHIPPING_THRESHOLD`, `FLAT_SHIPPING_RATE` |
| Change carousel speed | `assets/js/main.js` | `CAROUSEL_AUTOPLAY_MS` |
| Add a nav link | all `*.html` files | the shared navbar block |
| Add a footer link | all `*.html` files | the shared footer block |
| Change the cart storage key | `assets/js/main.js` | `"daura_cart"` in `Cart.read()` / `Cart.save()` |
| Replace demo images | `*.html`, `assets/js/main.js` | Unsplash URLs |
| Change form behaviour | `assets/js/main.js` | `setupDemoForms()` |

---

## 16. Glossary

- **Renderer** — a function that builds HTML and assigns it to `innerHTML`.
- **Mount point** — an empty element with an `id` that a renderer targets.
- **State** — the data that describes the current UI, such as the `state` object on the shop page.
- **Delegated event** — one listener on a parent element that handles clicks on many children via `event.target.closest(...)`.
- **`localStorage`** — browser storage that survives page reloads; used for the cart.
- **Offcanvas** — a Bootstrap panel that slides in from the side; used for the cart drawer and mobile filters.
- **`IntersectionObserver`** — browser API that reports when an element enters the viewport; used for scroll reveal.
- **`prefers-reduced-motion`** — a user setting that asks the site to reduce animation.
- **Design token** — a CSS variable such as `--ink` or `--cream` that centralizes a design decision.

---

## 17. Suggested next study steps

1. Re-implement `productCardHTML()` yourself using template literals.
2. Add a search input to the shop page and filter `PRODUCTS` by name.
3. Move the navbar and footer into a small JavaScript include to remove duplication.
4. Add a "recently viewed" list in `localStorage`.
5. Replace the demo checkout with a real payment provider in a test mode.

Each of these builds on the same pattern: read state, derive data, render HTML, wire events.
