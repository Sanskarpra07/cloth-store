/* ==========================================================================
   DAURA & CO. — Main JavaScript
   --------------------------------------------------------------------------
   This single file powers every interactive part of the storefront.

   HOW THIS FILE IS ORGANIZED (read top to bottom):
   1. PRODUCTS array      → all store data in one place
   2. Helper functions    → money, stars, shipping, product lookup
   3. Product card HTML   → the reusable product tile template
   4. Cart system         → add/remove items, saved in localStorage
   5. Toast notification  → the small "added to bag" popup
   6. Page renderers      → home, shop, product, cart, checkout
   7. Global behaviours   → navbar, carousel, forms, animations
   8. Boot                → runs once when the page finishes loading

   THE BIG PICTURE
   ---------------
   PRODUCTS (static data)
        │
        ├── productCardHTML() ──→ home / shop / related product grids
        │
        └── Cart.add() ──→ localStorage("daura_cart")
                              │
                              ├── cart drawer (every page)
                              ├── cart.html
                              └── checkout.html

   Each HTML page is a shell. JavaScript finds elements by their `id`
   (for example #shopGrid or #productDetail) and fills them with markup.

   For a guided tour, trace exercises, and a file-by-file map, open
   CODE-GUIDE.md in the project root.
   ========================================================================== */


/* ==========================================================================
   1. PRODUCTS — the "database" of the store (static demo data)
   ========================================================================== */

// Shared carousel settings (change these in one place)
const CAROUSEL_AUTOPLAY_MS = 5000; // time between automatic slides
const CAROUSEL_COPIES = 3;         // 3 copies let the carousel loop in both directions

// Shipping rules used by the cart, checkout, and drawer totals.
const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_RATE = 9.99;

/*
  Each product in the array below has this shape:

  {
    id:          unique number (used in product.html?id=1)
    name:        product title shown on cards and detail pages
    category:    "men" | "women" | "accessories"
    type:        product type, e.g. "T-Shirts"
    price:       current price in dollars
    oldPrice:    original price, or null when not on sale
    badge:       "new" | "sale" | null
    rating:      1–5 (rendered as stars)
    colors:      array of CSS colour values
    sizes:       array of available sizes
    image:       main card image URL
    imageHover:  second image shown on hover
    gallery:     image URLs for the product detail gallery
    description: short product story
  }
*/
const PRODUCTS = [
  {
    id: 1,
    name: "Midnight Oversized Tee",
    category: "men",
    type: "T-Shirts",
    price: 49,
    oldPrice: null,
    badge: "new",
    rating: 5,
    colors: ["#14100e", "#e9e1d6", "#b5563c"],
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    imageHover: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80"
    ],
    description: "A heavyweight 240gsm cotton tee with a relaxed, oversized silhouette. Garment-dyed for a lived-in feel from the very first wear."
  },
  {
    id: 2,
    name: "Heritage Wool Coat",
    category: "women",
    type: "Outerwear",
    price: 189,
    oldPrice: 240,
    badge: "sale",
    rating: 5,
    colors: ["#8a7a6a", "#14100e"],
    sizes: ["XS", "S", "M", "L"],
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80",
    imageHover: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Double-faced Italian wool with a softly tailored line. Fully lined, with hidden pockets and a removable belt for two ways to wear."
  },
  {
    id: 3,
    name: "Vintage Wash Denim",
    category: "men",
    type: "Jeans",
    price: 89,
    oldPrice: null,
    badge: null,
    rating: 4,
    colors: ["#3b4a5a", "#1c2430"],
    sizes: ["30", "32", "34", "36"],
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
    imageHover: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Straight-leg jeans cut from 13oz Japanese selvedge denim, washed down for a soft vintage fade that gets better with every wash."
  },
  {
    id: 4,
    name: "Cashmere Blend Knit",
    category: "women",
    type: "Knitwear",
    price: 129,
    oldPrice: null,
    badge: "new",
    rating: 5,
    colors: ["#d8cfc2", "#b5563c", "#14100e"],
    sizes: ["XS", "S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    imageHover: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=900&q=80"
    ],
    description: "A cloud-soft cashmere-merino blend with dropped shoulders and ribbed cuffs. The kind of knit you'll reach for every cold morning."
  },
  {
    id: 5,
    name: "Studio Leather Jacket",
    category: "men",
    type: "Outerwear",
    price: 249,
    oldPrice: null,
    badge: null,
    rating: 5,
    colors: ["#14100e", "#4a3428"],
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
    imageHover: "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Lamb leather with a buttery hand and a clean, minimal collar. YKK zippers, quilted lining, and a fit built to layer over everything."
  },
  {
    id: 6,
    name: "Silk Slip Dress",
    category: "women",
    type: "Dresses",
    price: 159,
    oldPrice: 198,
    badge: "sale",
    rating: 5,
    colors: ["#c9a08e", "#14100e", "#7a8a7a"],
    sizes: ["XS", "S", "M", "L"],
    image: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=80",
    imageHover: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=900&q=80"
    ],
    description: "19-momme mulberry silk cut on the bias, with adjustable straps and a fluid drape. Wear it solo in summer or layered in winter."
  },
  {
    id: 7,
    name: "Everyday Hoodie",
    category: "men",
    type: "Hoodies & Sweats",
    price: 79,
    oldPrice: null,
    badge: null,
    rating: 4,
    colors: ["#6e655c", "#14100e", "#d8cfc2"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
    imageHover: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80"
    ],
    description: "400gsm loopback cotton with a double-layer hood and kangaroo pocket. Pre-shrunk and garment-washed so it fits the same forever."
  },
  {
    id: 8,
    name: "Linen Summer Shirt",
    category: "men",
    type: "Shirts",
    price: 69,
    oldPrice: null,
    badge: "new",
    rating: 4,
    colors: ["#e9e1d6", "#7a8a7a", "#3b4a5a"],
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    imageHover: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80"
    ],
    description: "European flax linen, garment-washed for softness. A relaxed camp collar and curved hem make it the shirt that does summer right."
  },
  {
    id: 9,
    name: "Classic White Tee",
    category: "women",
    type: "T-Shirts",
    price: 39,
    oldPrice: null,
    badge: null,
    rating: 5,
    colors: ["#ffffff", "#14100e", "#b5563c"],
    sizes: ["XS", "S", "M", "L"],
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    imageHover: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80"
    ],
    description: "The perfect white tee — organic Supima cotton, a neat crew neck, and a fit that skims without clinging. One is never enough."
  },
  {
    id: 10,
    name: "Running Sneakers",
    category: "accessories",
    type: "Shoes",
    price: 119,
    oldPrice: null,
    badge: "new",
    rating: 5,
    colors: ["#ffffff", "#14100e", "#b5563c"],
    sizes: ["39", "40", "41", "42", "43", "44"],
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    imageHover: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80"
    ],
    description: "A minimal leather sneaker on a cushioned cupsole. Clean enough for the office, comfortable enough for the whole weekend."
  },
  {
    id: 11,
    name: "Structured Leather Tote",
    category: "accessories",
    type: "Bags",
    price: 169,
    oldPrice: null,
    badge: null,
    rating: 5,
    colors: ["#4a3428", "#14100e"],
    sizes: ["One Size"],
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    imageHover: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Full-grain vegetable-tanned leather with a reinforced base and magnetic closure. Fits a 15-inch laptop with room to spare."
  },
  {
    id: 12,
    name: "Acetate Sunglasses",
    category: "accessories",
    type: "Eyewear",
    price: 89,
    oldPrice: 110,
    badge: "sale",
    rating: 4,
    colors: ["#14100e", "#6b4a2f"],
    sizes: ["One Size"],
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
    imageHover: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Italian acetate frames with CR-39 polarized lenses. Hand-polished hinges and a case made from recycled felt."
  },
  {
    id: 13,
    name: "Oxford Button-Down",
    category: "men",
    type: "Shirts",
    price: 79,
    oldPrice: null,
    badge: null,
    rating: 4,
    colors: ["#ffffff", "#a8bfcf", "#e9e1d6"],
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
    imageHover: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Japanese oxford cotton with a soft-roll collar and mother-of-pearl buttons. The shirt that works tucked, untucked, rolled up, or layered."
  },
  {
    id: 14,
    name: "Wide-Leg Trousers",
    category: "women",
    type: "Trousers",
    price: 99,
    oldPrice: null,
    badge: "new",
    rating: 5,
    colors: ["#14100e", "#8a7a6a", "#d8cfc2"],
    sizes: ["XS", "S", "M", "L"],
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    imageHover: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"
    ],
    description: "High-rise, wide-leg trousers in a fluid crepe blend. Pressed front crease, side pockets, and a hidden hook closure."
  },
  {
    id: 15,
    name: "Minimalist Watch",
    category: "accessories",
    type: "Watches",
    price: 149,
    oldPrice: null,
    badge: null,
    rating: 5,
    colors: ["#14100e", "#c0c0c0"],
    sizes: ["One Size"],
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
    imageHover: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80"
    ],
    description: "A 38mm brushed-steel case, sapphire crystal, and Italian leather strap. Japanese quartz movement, 5ATM water resistance."
  },
  {
    id: 16,
    name: "Trench Re-imagined",
    category: "women",
    type: "Outerwear",
    price: 219,
    oldPrice: null,
    badge: null,
    rating: 5,
    colors: ["#c8b49a", "#14100e"],
    sizes: ["XS", "S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80",
    imageHover: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=80"
    ],
    description: "A modern take on the trench — cropped at the hip, water-resistant cotton gabardine, with storm flap and buckle cuffs."
  }
];


/* ==========================================================================
   2. HELPERS — small utility functions used everywhere
   ========================================================================== */

/** Turns 49 into "$49.00" */
function formatMoney(amount) {
  return "$" + amount.toFixed(2);
}

/** Turns rating number (4) into star icons "★★★★☆" */
function renderStars(count) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += i <= count ? "★" : "☆";
  }
  return html;
}

/** Finds a product by its id (comes from the URL like product.html?id=3) */
function getProductById(id) {
  return PRODUCTS.find(function (p) { return p.id === Number(id); });
}

/** Picks a category label to show under the product name */
function categoryLabel(cat) {
  if (cat === "men") return "Men";
  if (cat === "women") return "Women";
  return "Accessories";
}

/** Shipping is free over $100; otherwise a flat rate applies. */
function shippingCost(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
}


/* ==========================================================================
   3. PRODUCT CARD HTML — one template used on every page
   ========================================================================== */

/**
 * Builds the HTML for one product tile.
 * Used by the home grid, shop grid, and related-products grid.
 *
 * @param {object} product - one object from the PRODUCTS array
 * @returns {string} a Bootstrap column containing a .product-card
 */
function productCardHTML(product) {
  // Badge markup: "New", "Sale", or nothing.
  const badge =
    product.badge === "new"
      ? '<span class="product-badge badge-new">New</span>'
      : product.badge === "sale"
        ? '<span class="product-badge badge-sale">Sale</span>'
        : "";

  // Show the original price struck through only when the product is on sale.
  const priceHTML = product.oldPrice
    ? `<span class="sale-price">${formatMoney(product.price)}</span>
       <span class="old-price">${formatMoney(product.oldPrice)}</span>`
    : formatMoney(product.price);

  return `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="product-card mb-4">
        <div class="product-media-wrap">
          <a href="product.html?id=${product.id}" class="product-media">
            ${badge}
            <img class="img-main" src="${product.image}" alt="${product.name}" loading="lazy">
            <img class="img-hover" src="${product.imageHover}" alt="${product.name} alternate view" loading="lazy">
          </a>
          <button type="button" class="quick-add" data-add-id="${product.id}">+ Quick Add</button>
        </div>
        <div class="product-info">
          <div class="product-category">${product.type}</div>
          <h3 class="product-name"><a href="product.html?id=${product.id}">${product.name}</a></h3>
          <div class="product-price">${priceHTML}</div>
          <div class="product-rating">${renderStars(product.rating)}</div>
        </div>
      </div>
    </div>
  `;
}


/* ==========================================================================
   4. CART SYSTEM — works with localStorage so the cart survives refresh
   ========================================================================== */

/*
  A cart line is stored as:

  {
    id: 1,                  // product id
    name: "Midnight Tee",   // copied so the cart works without PRODUCTS
    price: 49,              // price at the time of adding
    image: "...",           // card image
    size: "M",
    color: "#14100e",
    qty: 2
  }

  Identity = id + size + color. Adding the same product in a different
  size or colour creates a separate line instead of merging quantities.
*/
const Cart = {
  // Read the saved cart from the browser (or start empty)
  read: function () {
    return JSON.parse(localStorage.getItem("daura_cart") || "[]");
  },

  // Save the cart back into the browser
  save: function (items) {
    localStorage.setItem("daura_cart", JSON.stringify(items));
    this.updateBadge();
    this.renderDrawer();
    renderCartPage();
    renderCheckoutPage();
  },

  // Total number of items (sum of quantities)
  count: function () {
    return this.read().reduce(function (sum, item) { return sum + item.qty; }, 0);
  },

  // Add a product (with size + color + quantity) to the cart
  add: function (product, size, color, qty) {
    const items = this.read();
    // If the exact same product+size+color exists, just bump the quantity
    const existing = items.find(function (item) {
      return item.id === product.id && item.size === size && item.color === color;
    });
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: size,
        color: color,
        qty: qty
      });
    }
    this.save(items);
    showToast(product.name + " added to bag");
  },

  // Change quantity of one cart line (delta is +1 or -1)
  changeQty: function (index, delta) {
    const items = this.read();
    if (!items[index]) return;
    items[index].qty += delta;
    if (items[index].qty <= 0) items.splice(index, 1); // remove if 0
    this.save(items);
  },

  // Remove one cart line completely
  remove: function (index) {
    const items = this.read();
    items.splice(index, 1);
    this.save(items);
  },

  // Empty the whole cart (used by the checkout demo button)
  clear: function () {
    this.save([]);
  },

  // Subtotal of all items
  subtotal: function () {
    return this.read().reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);
  },

  // Update the little number bubble on the cart icon
  updateBadge: function () {
    const badge = document.querySelector(".cart-badge");
    if (!badge) return;
    const count = this.count();
    badge.textContent = count;
    badge.classList.toggle("show", count > 0);
  },

  // Rebuild the cart drawer content (items list + totals)
  renderDrawer: function () {
    const list = document.getElementById("cartItems");
    const footer = document.getElementById("cartFooter");
    if (!list || !footer) return;

    const items = this.read();

    // Empty cart state
    if (items.length === 0) {
      list.innerHTML = `
        <div class="cart-empty">
          <i class="bi bi-bag"></i>
          <p class="mb-1" style="font-family:var(--font-display);font-size:18px;color:var(--ink)">Your bag is empty</p>
          <p style="font-size:13px">Add something you love and it will show up here.</p>
        </div>
      `;
      footer.style.display = "none";
      return;
    }

    // Build one row per cart line. `index` is the line's position in the
    // saved array, which is how the qty/remove buttons identify their row.
    list.innerHTML = items.map(function (item, index) {
      return `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-meta">Size: ${item.size} · Color: ${item.color}</div>
            <div class="qty-control">
              <button data-qty-index="${index}" data-qty-delta="-1" aria-label="Decrease quantity">−</button>
              <span>${item.qty}</span>
              <button data-qty-index="${index}" data-qty-delta="1" aria-label="Increase quantity">+</button>
            </div>
            <button class="cart-item-remove d-block" data-remove-index="${index}">Remove</button>
          </div>
          <div class="cart-item-price">${formatMoney(item.price * item.qty)}</div>
        </div>
      `;
    }).join("");

    // Totals footer
    const subtotal = this.subtotal();
    const shipping = shippingCost(subtotal);
    footer.style.display = "block";
    footer.innerHTML = `
      <div class="cart-row"><span>Subtotal</span><span>${formatMoney(subtotal)}</span></div>
      <div class="cart-row"><span>Shipping</span><span>${shipping === 0 ? "Free" : formatMoney(shipping)}</span></div>
      <div class="cart-row total"><span>Total</span><span>${formatMoney(subtotal + shipping)}</span></div>
      <a class="btn btn-ink" href="checkout.html">Proceed to Checkout</a>
      <a class="btn btn-outline-ink" href="cart.html">View Shopping Bag</a>
      <button class="btn btn-outline-ink" data-bs-dismiss="offcanvas">Continue Shopping</button>
      <p class="cart-note">Free shipping on orders over $100 · 30-day returns</p>
    `;
  }
};

/**
 * Injects the offcanvas cart drawer into every page and wires its buttons.
 * The drawer markup lives here instead of in each HTML file so it only has
 * to be maintained once. Runs once on DOMContentLoaded.
 */
function setupCartDrawer() {
  // Build the drawer HTML and push it into the page.
  const drawerHTML = `
    <div class="offcanvas offcanvas-end cart-drawer" tabindex="-1" id="cartDrawer" aria-labelledby="cartDrawerLabel">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="cartDrawerLabel">Shopping Bag (${Cart.count()})</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body">
        <div class="cart-items" id="cartItems"></div>
        <div class="cart-footer" id="cartFooter"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", drawerHTML);

  Cart.updateBadge();
  Cart.renderDrawer();

  // Open drawer from any element with data-bs-toggle="offcanvas" targeting #cartDrawer
  document.querySelectorAll('[data-bs-target="#cartDrawer"]').forEach(function (btn) {
    btn.addEventListener("click", function () {
      Cart.renderDrawer();
    });
  });

  // Delegated clicks inside the drawer: qty buttons, remove, checkout demo
  document.addEventListener("click", function (event) {
    const qtyBtn = event.target.closest("[data-qty-index]");
    if (qtyBtn) {
      Cart.changeQty(Number(qtyBtn.dataset.qtyIndex), Number(qtyBtn.dataset.qtyDelta));
      return;
    }
    const removeBtn = event.target.closest("[data-remove-index]");
    if (removeBtn) {
      Cart.remove(Number(removeBtn.dataset.removeIndex));
      return;
    }
  });
}


/* ==========================================================================
   5. TOAST NOTIFICATION — the little "added to bag" popup
   ========================================================================== */

/**
 * Shows a temporary Bootstrap toast in the top-right corner.
 * Used for "added to bag" confirmations and demo form submissions.
 *
 * @param {string} message - plain text to show inside the toast
 */
function showToast(message) {
  // Build a Bootstrap toast and show it top-right.
  const id = "toast-" + Date.now();
  const html = `
    <div class="toast toast-v align-middle" role="alert" aria-live="assertive" aria-atomic="true" id="${id}">
      <div class="toast-body">
        <i class="bi bi-check-circle-fill"></i> ${message}
      </div>
    </div>
  `;

  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container position-fixed top-0 end-0 p-3";
    document.body.appendChild(container);
  }
  container.insertAdjacentHTML("beforeend", html);

  const toastEl = document.getElementById(id);
  const toast = new bootstrap.Toast(toastEl, { delay: 2600 });
  toast.show();
  toastEl.addEventListener("hidden.bs.toast", function () { toastEl.remove(); });
}


/* ==========================================================================
   6. PAGE RENDERERS — one function per page type
   ========================================================================== */

/** HOME PAGE — fills the featured / new arrival grids */
function renderHomePage() {
  const featuredGrid = document.getElementById("featuredGrid");
  const newGrid = document.getElementById("newGrid");

  // Fill the "Shop by Category" tiles with live product counts
  document.querySelectorAll("[data-cat-count]").forEach(function (el) {
    const cat = el.dataset.catCount;
    const n = PRODUCTS.filter(function (p) { return p.category === cat; }).length;
    el.textContent = n + (n === 1 ? " Product" : " Products");
  });

  if (featuredGrid) {
    // First 8 products = "Featured"
    featuredGrid.innerHTML = PRODUCTS.slice(0, 8).map(productCardHTML).join("");
  }
  if (newGrid) {
    // Products marked "new" = "New Arrivals"
    const newProducts = PRODUCTS.filter(function (p) { return p.badge === "new"; });
    const cards = newProducts.map(productCardHTML).join("");

    // Render the same products several times so the carousel can loop smoothly.
    // The carousel logic starts in the middle copy.
    newGrid.innerHTML = new Array(CAROUSEL_COPIES).fill(cards).join("");
  }
}

/** SHOP PAGE — builds the filter sidebar + grid, then applies filters & sorting */
function renderShopPage() {
  const grid = document.getElementById("shopGrid");
  if (!grid) return;

  const groupsWrap  = document.getElementById("filterGroups");
  const countEl     = document.getElementById("resultsCount");
  const sortSelect  = document.getElementById("sortSelect");
  const activeWrap  = document.getElementById("activeFilters");
  const emptyEl     = document.getElementById("shopEmpty");

  // ---- 1. Work out the filter options from the PRODUCTS data -------------

  const categories = [
    { value: "all",         label: "All Products" },
    { value: "women",       label: "Women" },
    { value: "men",         label: "Men" },
    { value: "accessories", label: "Accessories" }
  ];

  // Price bounds (rounded to nice numbers)
  const priceList = PRODUCTS.map(function (p) { return p.price; });
  const minPrice = Math.floor(Math.min.apply(null, priceList) / 10) * 10;
  const maxPrice = Math.ceil(Math.max.apply(null, priceList) / 10) * 10;

  // ---- 2. The filter state (what the user has chosen) --------------------

  const params = new URLSearchParams(window.location.search);
  const state = {
    category: params.get("category") || "all",
    type: params.get("type") || "all",
    maxPrice: maxPrice,
    sizes: [],
    colors: [],
    sort: "featured"
  };

  // ---- 3. Build the sidebar HTML ----------------------------------------

  function categoryCount(value) {
    return PRODUCTS.filter(function (p) {
      return value === "all" || p.category === value;
    }).length;
  }

  // A product belongs to the current department unless "All Products" is picked.
  function inCategory(product) {
    return state.category === "all" || product.category === state.category;
  }

  // Product types (e.g. "T-Shirts", "Dresses") available in the current department.
  function availableTypes() {
    const list = [];
    PRODUCTS.forEach(function (p) {
      if (!inCategory(p)) return;
      if (list.indexOf(p.type) === -1) list.push(p.type);
    });
    return list.sort();
  }

  function typeCount(type) {
    return PRODUCTS.filter(function (p) {
      return inCategory(p) && p.type === type;
    }).length;
  }

  // Sizes available for the CURRENT category (ignore "One Size" — not a
  // useful filter). Recalculated so irrelevant sizes are never shown.
  function availableSizes() {
    const list = [];
    PRODUCTS.forEach(function (p) {
      if (!inCategory(p)) return;
      p.sizes.forEach(function (s) {
        if (s !== "One Size" && list.indexOf(s) === -1) list.push(s);
      });
    });
    list.sort(function (a, b) { return a.localeCompare(b, undefined, { numeric: true }); });
    return list;
  }

  // Colors available for the current category.
  function availableColors() {
    const list = [];
    PRODUCTS.forEach(function (p) {
      if (!inCategory(p)) return;
      p.colors.forEach(function (c) {
        if (list.indexOf(c) === -1) list.push(c);
      });
    });
    return list;
  }

  // Wraps one filter section in a collapsible header (like ASOS / Zara).
  // `open` decides whether the section starts expanded.
  function group(title, id, inner, open) {
    return `
      <div class="filter-group">
        <button class="filter-group-title${open ? "" : " collapsed"}" type="button"
                data-bs-toggle="collapse" data-bs-target="#${id}"
                aria-expanded="${open ? "true" : "false"}" aria-controls="${id}">
          <span>${title}</span><i class="bi bi-chevron-down"></i>
        </button>
        <div class="collapse${open ? " show" : ""}" id="${id}">
          <div class="filter-group-body">${inner}</div>
        </div>
      </div>
    `;
  }

  function buildFiltersHTML() {
    // Department rows (All / Women / Men / Accessories)
    const catHTML = categories.map(function (c) {
      const active = state.category === c.value ? " active" : "";
      return `
        <li>
          <button class="filter-list-btn${active}" data-cat="${c.value}">
            <span>${c.label}</span>
            <span class="count">${categoryCount(c.value)}</span>
          </button>
        </li>
      `;
    }).join("");

    // Product-type rows — only the types that exist in the current department
    const typeHTML = availableTypes().map(function (t) {
      const active = state.type === t ? " active" : "";
      return `
        <li>
          <button class="filter-list-btn${active}" data-type="${t}">
            <span>${t}</span>
            <span class="count">${typeCount(t)}</span>
          </button>
        </li>
      `;
    }).join("");

    // Size buttons
    const sizeHTML = availableSizes().map(function (s) {
      const active = state.sizes.indexOf(s) > -1 ? " active" : "";
      return `<button class="size-filter-btn${active}" data-size="${s}">${s}</button>`;
    }).join("");

    // Colour swatches
    const colorHTML = availableColors().map(function (c) {
      const active = state.colors.indexOf(c) > -1 ? " active" : "";
      return `<button class="color-filter-btn${active}" style="background:${c}" data-color="${c}" aria-label="Filter by colour ${c}"></button>`;
    }).join("");

    // Price slider
    const priceHTML = `
      <div class="price-labels">
        <span>${formatMoney(minPrice)}</span>
        <strong id="priceVal">${formatMoney(state.maxPrice)}</strong>
      </div>
      <input type="range" class="range-ink" id="priceRange" min="${minPrice}" max="${maxPrice}"
             step="10" value="${state.maxPrice}" aria-label="Maximum price">
    `;

    return [
      group("Category", "fg-category", `<ul class="filter-list">${catHTML}</ul>`, true),
      group("Product Type", "fg-type", `<ul class="filter-list">${typeHTML}</ul>`, true),
      group("Size", "fg-size", `<div class="size-filter-grid">${sizeHTML}</div>`, false),
      group("Colour", "fg-colour", `<div class="color-filter-grid">${colorHTML}</div>`, false),
      group("Price", "fg-price", priceHTML, false)
    ].join("");
  }

  function refreshSidebar() {
    if (groupsWrap) groupsWrap.innerHTML = buildFiltersHTML();
  }

  // ---- 4. Filter + sort the products -------------------------------------

  function getFilteredList() {
    let list = PRODUCTS.filter(function (p) {
      if (state.category !== "all" && p.category !== state.category) return false;
      if (state.type !== "all" && p.type !== state.type) return false;
      if (p.price > state.maxPrice) return false;
      if (state.sizes.length && !state.sizes.some(function (s) { return p.sizes.indexOf(s) > -1; })) return false;
      if (state.colors.length && !state.colors.some(function (c) { return p.colors.indexOf(c) > -1; })) return false;
      return true;
    });

    if (state.sort === "price-low") {
      list.sort(function (a, b) { return a.price - b.price; });
    } else if (state.sort === "price-high") {
      list.sort(function (a, b) { return b.price - a.price; });
    } else if (state.sort === "name") {
      list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    }
    return list;
  }

  // ---- 5. Draw the grid + active filter tags -----------------------------

  function renderActiveTags() {
    if (!activeWrap) return;

    const tags = [];
    if (state.category !== "all") {
      const found = categories.find(function (c) { return c.value === state.category; });
      tags.push({ label: found ? found.label : state.category, type: "category" });
    }
    if (state.type !== "all") {
      tags.push({ label: state.type, type: "type" });
    }
    if (state.maxPrice < maxPrice) {
      tags.push({ label: "Under " + formatMoney(state.maxPrice), type: "price" });
    }
    state.sizes.forEach(function (s) { tags.push({ label: "Size " + s, type: "size", value: s }); });
    state.colors.forEach(function (c) { tags.push({ label: "Colour", type: "color", value: c, swatch: c }); });

    if (!tags.length) { activeWrap.innerHTML = ""; return; }

    activeWrap.innerHTML = `
      <span class="af-label">Filters:</span>
      ${tags.map(function (t) {
        const dot = t.swatch
          ? `<span class="swatch" style="background:${t.swatch}"></span>`
          : "";
        return `
          <span class="filter-tag">
            ${dot}${t.label}
            <button data-remove-type="${t.type}" data-remove-value="${t.value || ""}" aria-label="Remove filter">&times;</button>
          </span>
        `;
      }).join("")}
      <button class="filter-tag-clear" id="clearFilters">Clear all</button>
    `;
  }

  function applyFilters() {
    const list = getFilteredList();
    grid.innerHTML = list.map(productCardHTML).join("");
    if (emptyEl) emptyEl.style.display = list.length ? "none" : "block";
    if (countEl) countEl.textContent = list.length + " product" + (list.length === 1 ? "" : "s");
    renderActiveTags();
  }

  // ---- 6. Small helpers --------------------------------------------------

  function toggleInArray(arr, value) {
    const i = arr.indexOf(value);
    if (i > -1) arr.splice(i, 1);
    else arr.push(value);
  }

  function resetFilters() {
    state.category = "all";
    state.type = "all";
    state.maxPrice = maxPrice;
    state.sizes = [];
    state.colors = [];
    refreshSidebar();
    applyFilters();
  }

  function removeTag(type, value) {
    if (type === "category") state.category = "all";
    else if (type === "type") state.type = "all";
    else if (type === "price") state.maxPrice = maxPrice;
    else if (type === "size") toggleInArray(state.sizes, value);
    else if (type === "color") toggleInArray(state.colors, value);
    refreshSidebar();
    applyFilters();
  }

  // ---- 7. Wire up the interactions ---------------------------------------

  // Clicks inside the sidebar (category / size / color)
  if (groupsWrap) {
    groupsWrap.addEventListener("click", function (event) {
      const catBtn = event.target.closest("[data-cat]");
      if (catBtn) {
        state.category = catBtn.dataset.cat;
        // Drop any selected type/size/colour that doesn't exist in the new category
        const validTypes = availableTypes();
        if (state.type !== "all" && validTypes.indexOf(state.type) === -1) state.type = "all";
        const validSizes = availableSizes();
        state.sizes = state.sizes.filter(function (s) { return validSizes.indexOf(s) > -1; });
        const validColors = availableColors();
        state.colors = state.colors.filter(function (c) { return validColors.indexOf(c) > -1; });
        refreshSidebar();
        applyFilters();
        return;
      }
      const typeBtn = event.target.closest("[data-type]");
      if (typeBtn) {
        const t = typeBtn.dataset.type;
        state.type = state.type === t ? "all" : t; // click the active one again to clear
        refreshSidebar();
        applyFilters();
        return;
      }
      const sizeBtn = event.target.closest("[data-size]");
      if (sizeBtn) {
        toggleInArray(state.sizes, sizeBtn.dataset.size);
        sizeBtn.classList.toggle("active");
        applyFilters();
        return;
      }
      const colorBtn = event.target.closest("[data-color]");
      if (colorBtn) {
        toggleInArray(state.colors, colorBtn.dataset.color);
        colorBtn.classList.toggle("active");
        applyFilters();
        return;
      }
    });

    // Price slider (fires on every drag)
    groupsWrap.addEventListener("input", function (event) {
      if (event.target.id === "priceRange") {
        state.maxPrice = Number(event.target.value);
        const priceVal = document.getElementById("priceVal");
        if (priceVal) priceVal.textContent = formatMoney(state.maxPrice);
        applyFilters();
      }
    });
  }

  // Clicks on the active filter tags (remove one / clear all)
  if (activeWrap) {
    activeWrap.addEventListener("click", function (event) {
      if (event.target.id === "clearFilters") { resetFilters(); return; }
      const rm = event.target.closest("[data-remove-type]");
      if (rm) removeTag(rm.dataset.removeType, rm.dataset.removeValue);
    });
  }

  // Sort dropdown
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      state.sort = sortSelect.value;
      applyFilters();
    });
  }

  // ---- 8. First paint ----------------------------------------------------
  // Guard against bad URL values (e.g. shop.html?category=xyz)
  const validCatValues = categories.map(function (c) { return c.value; });
  if (validCatValues.indexOf(state.category) === -1) state.category = "all";
  if (state.type !== "all" && availableTypes().indexOf(state.type) === -1) state.type = "all";

  refreshSidebar();
  applyFilters();
}

/** PRODUCT PAGE — reads ?id= from URL and builds the whole detail view */
function renderProductPage() {
  const wrap = document.getElementById("productDetail");
  if (!wrap) return;

  const params = new URLSearchParams(window.location.search);
  const product = getProductById(params.get("id") || 1) || PRODUCTS[0];

  // Default selections
  let selectedSize = product.sizes[0];
  let selectedColor = product.colors[0];
  let qty = 1;

  // Price markup (with optional old price)
  const priceHTML = product.oldPrice
    ? `<span class="sale-price" style="color:var(--sale)">${formatMoney(product.price)}</span>
       <span class="old-price" style="font-size:16px">${formatMoney(product.oldPrice)}</span>`
    : formatMoney(product.price);

  // Build the repeated option buttons first so the main template stays readable.
  const galleryThumbs = product.gallery.map(function (src, i) {
    return `
      <button class="gallery-thumb${i === 0 ? " active" : ""}" data-gallery-src="${src}">
        <img src="${src}" alt="View ${i + 1}">
      </button>
    `;
  }).join("");

  const colorButtons = product.colors.map(function (c, i) {
    return `<button class="color-btn${i === 0 ? " active" : ""}" style="background:${c}" data-color="${c}" aria-label="Color ${c}"></button>`;
  }).join("");

  const sizeButtons = product.sizes.map(function (s, i) {
    return `<button class="size-btn${i === 0 ? " active" : ""}" data-size="${s}">${s}</button>`;
  }).join("");

  // Two columns: gallery on the left, product info on the right.
  wrap.innerHTML = `
    <div class="col-lg-7 mb-4 mb-lg-0">
      <div class="product-gallery-main">
        <img id="galleryMain" src="${product.gallery[0]}" alt="${product.name}">
      </div>
      <div class="gallery-thumbs">${galleryThumbs}</div>
    </div>

    <div class="col-lg-5 product-detail">
      <div class="pd-category">
        <a href="shop.html?category=${product.category}">${categoryLabel(product.category)}</a> ·
        <a href="shop.html?type=${encodeURIComponent(product.type)}">${product.type}</a> ·
        <span style="color:var(--muted)">SKU DCO-0${product.id}</span>
      </div>
      <h1 class="pd-title">${product.name}</h1>
      <div class="product-rating mb-2">
        ${renderStars(product.rating)}
        <span style="color:var(--muted);font-size:12px;letter-spacing:0">(48 reviews)</span>
      </div>
      <div class="pd-price">${priceHTML}</div>
      <p class="pd-desc">${product.description}</p>

      <span class="option-label">Color</span>
      <div class="color-options" id="colorOptions">${colorButtons}</div>

      <span class="option-label">Size: <span class="selected-val" id="sizeLabel">${selectedSize}</span></span>
      <div class="size-options" id="sizeOptions">${sizeButtons}</div>

      <div class="pd-actions">
        <div class="qty-control">
          <button id="pdQtyMinus" aria-label="Decrease quantity">−</button>
          <span id="pdQty">${qty}</span>
          <button id="pdQtyPlus" aria-label="Increase quantity">+</button>
        </div>
        <button class="btn btn-ink" id="pdAddToCart">Add to Bag — ${formatMoney(product.price)}</button>
      </div>

      <ul class="pd-meta-list">
        <li><strong>SKU</strong> DCO-0${product.id}</li>
        <li><strong>Category</strong> ${product.type}</li>
        <li><strong>Shipping</strong> Free over $100 · 3–5 days</li>
        <li><strong>Returns</strong> 30-day easy returns</li>
      </ul>

      <div class="accordion accordion-flush mt-4" id="pdAccordion">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#accDetails">Details & Fit</button>
          </h2>
          <div id="accDetails" class="accordion-collapse collapse" data-bs-parent="#pdAccordion">
            <div class="accordion-body">Model is 6'1" / 185cm and wears size M. True to size — take your normal size for a regular fit, size up for a relaxed look. Fabric has medium stretch.</div>
          </div>
        </div>
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#accCare">Materials & Care</button>
          </h2>
          <div id="accCare" class="accordion-collapse collapse" data-bs-parent="#pdAccordion">
            <div class="accordion-body">Made from premium natural fibres. Machine wash cold with like colors, tumble dry low. Do not bleach. Warm iron if needed.</div>
          </div>
        </div>
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#accShip">Shipping & Returns</button>
          </h2>
          <div id="accShip" class="accordion-collapse collapse" data-bs-parent="#pdAccordion">
            <div class="accordion-body">Free standard shipping on orders over $100. Express options available at checkout. Returns accepted within 30 days in original condition.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // --- Wire up the interactivity ---

  // Gallery thumbnails swap the big image
  wrap.querySelectorAll(".gallery-thumb").forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      document.getElementById("galleryMain").src = thumb.dataset.gallerySrc;
      wrap.querySelectorAll(".gallery-thumb").forEach(function (t) { t.classList.remove("active"); });
      thumb.classList.add("active");
    });
  });

  // Color picker
  wrap.querySelectorAll(".color-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      selectedColor = btn.dataset.color;
      wrap.querySelectorAll(".color-btn").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
    });
  });

  // Size picker
  wrap.querySelectorAll(".size-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      selectedSize = btn.dataset.size;
      document.getElementById("sizeLabel").textContent = selectedSize;
      wrap.querySelectorAll(".size-btn").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
    });
  });

  // Quantity buttons
  document.getElementById("pdQtyMinus").addEventListener("click", function () {
    if (qty > 1) { qty--; document.getElementById("pdQty").textContent = qty; }
  });
  document.getElementById("pdQtyPlus").addEventListener("click", function () {
    qty++; document.getElementById("pdQty").textContent = qty;
  });

  // Add to bag
  document.getElementById("pdAddToCart").addEventListener("click", function () {
    Cart.add(product, selectedSize, selectedColor, qty);
  });

  // Related products (same category, exclude current, max 4)
  const relatedGrid = document.getElementById("relatedGrid");
  if (relatedGrid) {
    const related = PRODUCTS
      .filter(function (p) { return p.category === product.category && p.id !== product.id; })
      .slice(0, 4);
    relatedGrid.innerHTML = related.map(productCardHTML).join("");
  }
}


/** CART PAGE — full shopping bag view with editable quantities */
function renderCartPage() {
  const wrap = document.getElementById("cartPageItems");
  if (!wrap) return;

  const summary = document.getElementById("cartSummary");
  const countEl = document.getElementById("cartPageCount");
  const checkoutBtn = document.getElementById("cartCheckoutBtn");
  const items = Cart.read();
  const totalQty = Cart.count();

  if (countEl) {
    countEl.textContent = items.length
      ? totalQty + " item" + (totalQty === 1 ? "" : "s") + " in your bag"
      : "Your bag is empty";
  }

  // Empty state: show a friendly message and disable checkout.
  if (!items.length) {
    wrap.innerHTML = `
      <div class="cart-empty cart-empty-page">
        <i class="bi bi-bag"></i>
        <p class="mb-1" style="font-family:var(--font-display);font-size:24px;color:var(--ink)">Nothing here yet</p>
        <p style="font-size:14px;margin-bottom:24px">Add something you love and it will appear right here.</p>
        <a href="shop.html" class="btn btn-ink">Start Shopping</a>
      </div>
    `;
    if (summary) {
      summary.innerHTML = `
        <p class="text-muted-warm mb-0" style="font-size:13px">
          Your order summary will appear once you add a piece to your bag.
        </p>
      `;
    }
    if (checkoutBtn) {
      checkoutBtn.classList.add("disabled");
      checkoutBtn.setAttribute("aria-disabled", "true");
      checkoutBtn.removeAttribute("href");
    }
    return;
  }

  if (checkoutBtn) {
    checkoutBtn.classList.remove("disabled");
    checkoutBtn.removeAttribute("aria-disabled");
    checkoutBtn.setAttribute("href", "checkout.html");
  }

  // One row per cart item, with quantity controls and a remove button.
  wrap.innerHTML = items.map(function (item, index) {
    return `
      <div class="cart-line">
        <a href="product.html?id=${item.id}" class="cart-line-img">
          <img src="${item.image}" alt="${item.name}">
        </a>
        <div class="cart-line-info">
          <a href="product.html?id=${item.id}" class="cart-line-name">${item.name}</a>
          <div class="cart-line-meta">Size: ${item.size} · Colour: ${item.color}</div>
          <div class="cart-line-actions">
            <div class="qty-control">
              <button data-cp-qty="-1" data-cp-index="${index}" aria-label="Decrease quantity">−</button>
              <span>${item.qty}</span>
              <button data-cp-qty="1" data-cp-index="${index}" aria-label="Increase quantity">+</button>
            </div>
            <button class="cart-item-remove" data-cp-remove="${index}">Remove</button>
          </div>
        </div>
        <div class="cart-line-price">${formatMoney(item.price * item.qty)}</div>
      </div>
    `;
  }).join("");

  // Order summary: subtotal, shipping, and final total.
  const subtotal = Cart.subtotal();
  const shipping = shippingCost(subtotal);
  if (summary) {
    summary.innerHTML = `
      <div class="summary-row"><span>Subtotal</span><span>${formatMoney(subtotal)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? "Free" : formatMoney(shipping)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${formatMoney(subtotal + shipping)}</span></div>
    `;
  }

  // Quantity and remove buttons inside the rendered cart rows.
  wrap.querySelectorAll("[data-cp-qty]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      Cart.changeQty(Number(btn.dataset.cpIndex), Number(btn.dataset.cpQty));
    });
  });
  wrap.querySelectorAll("[data-cp-remove]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      Cart.remove(Number(btn.dataset.cpRemove));
    });
  });
}

/** CHECKOUT PAGE — order summary built from the saved cart */
function renderCheckoutPage() {
  const summary = document.getElementById("checkoutSummary");
  if (!summary) return;

  const items = Cart.read();
  const submit = document.querySelector('#checkoutForm button[type="submit"]');

  // Empty bag: explain what to do and disable the submit button.
  if (!items.length) {
    summary.innerHTML = `
      <div class="cart-empty cart-empty-mini">
        <i class="bi bi-bag"></i>
        <p class="mb-1" style="font-family:var(--font-display);font-size:20px;color:var(--ink)">Your bag is empty</p>
        <p style="font-size:13px">Add a piece before checking out.</p>
        <a href="shop.html" class="btn btn-outline-ink">Shop the Collection</a>
      </div>
    `;
    if (submit) submit.disabled = true;
    return;
  }

  if (submit) submit.disabled = false;

  // Build the order summary from the saved cart.
  const subtotal = Cart.subtotal();
  const shipping = shippingCost(subtotal);

  summary.innerHTML = `
    ${items.map(function (item) {
      return `
        <div class="co-line">
          <img src="${item.image}" alt="${item.name}">
          <div><strong>${item.name}</strong><small>Size ${item.size} · Qty ${item.qty}</small></div>
          <span>${formatMoney(item.price * item.qty)}</span>
        </div>
      `;
    }).join("")}
    <div class="summary-row mt-3"><span>Subtotal</span><span>${formatMoney(subtotal)}</span></div>
    <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? "Free" : formatMoney(shipping)}</span></div>
    <div class="summary-row total"><span>Total</span><span>${formatMoney(subtotal + shipping)}</span></div>
  `;
}


/* ==========================================================================
   7. GLOBAL BEHAVIOURS — run on every page
   ========================================================================== */

/**
 * Handles every "+ Quick Add" button with one delegated click listener.
 * Delegation means the buttons work even when a grid is rendered later
 * (for example, after the shop filters change the results).
 */
function setupQuickAdd() {
  document.addEventListener("click", function (event) {
    const btn = event.target.closest("[data-add-id]");
    if (!btn) return;
    event.preventDefault();
    const product = getProductById(btn.dataset.addId);
    if (product) {
      // Add with the product's first size & color as defaults
      Cart.add(product, product.sizes[0], product.colors[0], 1);
    }
  });
}

/**
 * Measures the announcement bar and stores its height in the CSS variable
 * --announcement-height. The transparent hero navbar uses that variable so
 * it always sits directly below the bar, even when the bar wraps on mobile.
 */
function setupTransparentNavOffset() {
  const announcement = document.querySelector(".announcement");
  if (!announcement) return;

  function sync() {
    const height = announcement.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--announcement-height", height + "px");
  }

  sync();
  window.addEventListener("resize", sync, { passive: true });
  if ("ResizeObserver" in window) new ResizeObserver(sync).observe(announcement);
}

/**
 * Switches the navbar between its transparent and solid states.
 * Home page: transparent over the hero, solid after 60px.
 * Inner pages: always solid, with a small shadow after 10px.
 */
function setupNavbarScroll() {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;

  function onScroll() {
    // On pages with a transparent hero nav, switch to solid once scrolled
    if (nav.classList.contains("nav-transparent")) {
      if (window.scrollY > 60) {
        nav.classList.remove("nav-transparent");
        nav.classList.add("is-scrolled");
      } else {
        nav.classList.add("nav-transparent");
        nav.classList.remove("is-scrolled");
      }
    } else {
      // Other pages: always sticky solid
      nav.classList.toggle("is-scrolled", window.scrollY > 10);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/**
 * Shows the floating back-to-top button after 500px of scrolling and
 * smoothly returns the page to the top when it is clicked.
 */
function setupBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  window.addEventListener("scroll", function () {
    btn.classList.toggle("show", window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/**
 * New Arrivals carousel.
 *
 * The product list is rendered three times:
 *
 *   [ copy 1 ] [ copy 2 ] [ copy 3 ]
 *                 ^ start here
 *
 * We start in copy 2. When the user reaches copy 3, we instantly jump
 * back by one copy. Because the copies are identical, the jump is invisible.
 * Scrolling left does the same thing in the opposite direction.
 */
function setupProductCarousel() {
  const track = document.getElementById("newGrid");
  if (!track) return;

  const prevButton = document.querySelector('[data-carousel-prev="newGrid"]');
  const nextButton = document.querySelector('[data-carousel-next="newGrid"]');
  if (!prevButton || !nextButton) return;

  const SCROLL_SETTLE_MS = 150; // wait this long after scrolling before looping
  const ROUNDING_TOLERANCE = 1; // browsers can round scroll positions by 1px
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cardsPerCopy = track.children.length / CAROUSEL_COPIES;

  let autoplayTimer = null;
  let scrollEndTimer = null;
  let isNormalizing = false;

  // Width of one complete copy of the product list.
  function getCopyWidth() {
    const firstCard = track.children[0];
    const firstCardOfSecondCopy = track.children[cardsPerCopy];
    if (!firstCard || !firstCardOfSecondCopy) return 0;

    return (
      firstCardOfSecondCopy.getBoundingClientRect().left -
      firstCard.getBoundingClientRect().left
    );
  }

  // Is there more than one screen of products?
  function hasOverflow() {
    return getCopyWidth() > track.clientWidth + ROUNDING_TOLERANCE;
  }

  // Keep the arrows visible only when the carousel can move.
  function updateControls() {
    const canScroll = hasOverflow();

    prevButton.classList.toggle("is-hidden", !canScroll);
    nextButton.classList.toggle("is-hidden", !canScroll);
    prevButton.disabled = !canScroll;
    nextButton.disabled = !canScroll;
  }

  // Change the scroll position without triggering another visible jump.
  function setScrollPosition(position) {
    isNormalizing = true;
    track.scrollLeft = position;
    isNormalizing = false;
  }

  // Keep the track inside the middle copy. Copies 1 and 3 only exist
  // so that there is always more content available in both directions.
  function keepScrollInsideMiddleCopy() {
    const copyWidth = getCopyWidth();
    if (!copyWidth || isNormalizing) return;

    const currentScroll = track.scrollLeft;
    const twoCopies = copyWidth * 2;

    if (currentScroll >= twoCopies - ROUNDING_TOLERANCE) {
      setScrollPosition(currentScroll - copyWidth);
    } else if (currentScroll < copyWidth - ROUNDING_TOLERANCE) {
      setScrollPosition(currentScroll + copyWidth);
    }
  }

  // Distance from one card to the next, including the gap.
  function getCardStep() {
    const firstCard = track.firstElementChild;
    if (!firstCard) return 0;

    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;

    return firstCard.getBoundingClientRect().width + gap;
  }

  // Move one card left (-1) or right (+1).
  function scrollOneCard(direction) {
    track.scrollBy({
      left: direction * getCardStep(),
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  }

  function stopAutoplay() {
    if (!autoplayTimer) return;

    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function startAutoplay() {
    stopAutoplay();
    if (prefersReducedMotion || !hasOverflow()) return;

    autoplayTimer = setInterval(function () {
      scrollOneCard(1);
    }, CAROUSEL_AUTOPLAY_MS);
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Arrow buttons move one card and reset the autoplay timer.
  prevButton.addEventListener("click", function () {
    scrollOneCard(-1);
    restartAutoplay();
  });

  nextButton.addEventListener("click", function () {
    scrollOneCard(1);
    restartAutoplay();
  });

  // After any scroll, check whether we need to jump back into the middle copy.
  track.addEventListener("scroll", function () {
    updateControls();

    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(keepScrollInsideMiddleCopy, SCROLL_SETTLE_MS);
  }, { passive: true });

  // Pause while the user is interacting with the carousel.
  track.addEventListener("pointerdown", stopAutoplay);
  track.addEventListener("pointerup", restartAutoplay);
  track.addEventListener("pointercancel", restartAutoplay);
  track.addEventListener("mouseenter", stopAutoplay);
  track.addEventListener("mouseleave", startAutoplay);
  track.addEventListener("focusin", stopAutoplay);
  track.addEventListener("focusout", startAutoplay);

  // Recalculate sizes after the browser window changes.
  window.addEventListener("resize", function () {
    track.scrollLeft = getCopyWidth();
    updateControls();
    restartAutoplay();
  });

  // Do not animate while the browser tab is hidden.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  // Start in the middle copy so the loop has room in both directions.
  track.scrollLeft = getCopyWidth();
  updateControls();
  startAutoplay();
}

/** Loop the homepage community photos using the same controls as New Arrivals. */
function setupInstagramCarousel() {
  const track = document.getElementById("instaGrid");
  if (!track || !track.children.length) return;

  const prevButton = document.querySelector('[data-carousel-prev="instaGrid"]');
  const nextButton = document.querySelector('[data-carousel-next="instaGrid"]');
  if (!prevButton || !nextButton) return;

  const originalItems = Array.from(track.children);
  const cardsPerCopy = originalItems.length;
  const copy = originalItems.map(function (item) {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelector("img")?.setAttribute("alt", "");
    clone.setAttribute("tabindex", "-1");
    return clone;
  });
  track.append(...copy.map(function (item) { return item.cloneNode(true); }), ...copy);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = null;
  let settleTimer = null;
  let normalizing = false;

  function copyWidth() {
    const start = track.children[0];
    const nextCopy = track.children[cardsPerCopy];
    return start && nextCopy ? nextCopy.getBoundingClientRect().left - start.getBoundingClientRect().left : 0;
  }
  function canScroll() { return copyWidth() > track.clientWidth + 1; }
  function controls() {
    const enabled = canScroll();
    [prevButton, nextButton].forEach(function (button) {
      button.disabled = !enabled;
      button.classList.toggle("is-hidden", !enabled);
    });
  }
  function move(direction) {
    const first = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    if (first) track.scrollBy({ left: direction * (first.getBoundingClientRect().width + gap), behavior: prefersReducedMotion ? "auto" : "smooth" });
  }
  function stop() { clearInterval(timer); timer = null; }
  function start() {
    stop();
    if (!prefersReducedMotion && canScroll()) timer = setInterval(function () { move(1); }, CAROUSEL_AUTOPLAY_MS);
  }
  function normalize() {
    if (normalizing) return;
    const width = copyWidth();
    if (!width) return;
    if (track.scrollLeft >= width * 2 - 1 || track.scrollLeft < width - 1) {
      normalizing = true;
      track.scrollLeft += track.scrollLeft >= width * 2 - 1 ? -width : width;
      normalizing = false;
    }
  }

  prevButton.addEventListener("click", function () { move(-1); start(); });
  nextButton.addEventListener("click", function () { move(1); start(); });
  track.addEventListener("scroll", function () {
    controls();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(normalize, 150);
  }, { passive: true });
  track.addEventListener("pointerdown", stop);
  track.addEventListener("pointerup", start);
  track.addEventListener("pointercancel", start);
  track.addEventListener("mouseenter", stop);
  track.addEventListener("mouseleave", start);
  track.addEventListener("focusin", stop);
  track.addEventListener("focusout", start);
  window.addEventListener("resize", function () { track.scrollLeft = copyWidth(); controls(); start(); });
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  track.scrollLeft = copyWidth();
  controls();
  start();
}

/**
 * Adds the .visible class the first time a .reveal or .reveal-stagger
 * element enters the viewport. IntersectionObserver avoids scroll handlers,
 * and unobserve() keeps the animation from replaying.
 */
function setupRevealAnimations() {
  const targets = document.querySelectorAll(".reveal, .reveal-stagger");
  if (!targets.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // only animate once
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(function (el) { observer.observe(el); });
}

/**
 * Wires every demo form. None of these send data to a server:
 * they prevent the default submit, show a toast, and sometimes redirect.
 * See the Forms table in README.md for the exact behaviour of each form.
 */
function setupDemoForms() {
  document.querySelectorAll(".js-newsletter").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      showToast("You're on the list — welcome to DAURA & CO.!");
      form.reset();
    });
  });

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      showToast("Message sent! We'll reply within 24 hours.");
      contactForm.reset();
    });
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      showToast("Welcome back to DAURA & CO. ✦");
      loginForm.reset();
      setTimeout(function () { window.location.href = "index.html"; }, 900);
    });
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      showToast("Account created — welcome to DAURA & CO. ✦");
      registerForm.reset();
      setTimeout(function () { window.location.href = "index.html"; }, 900);
    });
  }

  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!Cart.count()) {
        showToast("Your bag is empty — add a piece first.");
        return;
      }
      Cart.clear();
      checkoutForm.reset();
      showToast("Order placed! Thank you for shopping with DAURA & CO. ✦");
      setTimeout(function () { window.location.href = "index.html"; }, 1200);
    });
  }
}

/** Fills every .js-year element with the current year (footer copyright). */
function setupFooterYear() {
  document.querySelectorAll(".js-year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
}


/* ==========================================================================
   8. BOOT — runs once when the page finishes loading
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  setupCartDrawer();      // build cart drawer + wire cart events
  setupQuickAdd();        // "+ Quick Add" buttons on product cards
  setupTransparentNavOffset(); // align transparent nav under the announcement
  setupNavbarScroll();    // transparent → solid navbar
  setupBackToTop();       // floating scroll-to-top button
  setupRevealAnimations();// fade/slide sections into view
  setupDemoForms();       // newsletter & contact form demos
  setupFooterYear();      // auto-fill copyright year

  renderHomePage();       // home page product grids
  setupProductCarousel(); // New Arrivals carousel controls
  setupInstagramCarousel(); // Community photo carousel
  renderShopPage();       // shop page grid + filters + sort
  renderProductPage();    // product detail page
  renderCartPage();       // full shopping bag page
  renderCheckoutPage();   // checkout order summary
});
