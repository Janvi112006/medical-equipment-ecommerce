# Customer Website — Medical Equipment E-commerce Platform

A Next.js (App Router) storefront for browsing, buying, and tracking orders. Connects to the backend built in Phases 2–7.

## What's Included

- Home page — hero, shop-by-category chips, newest arrivals
- Product listing — search, category filter, price range filter, sorting, pagination (all via shareable URL query params)
- Product details — image, description, quantity selector, add to cart
- Shopping cart — view/update/remove items, subtotal/tax/total
- Checkout — saved or new delivery address, places the order, then **Pay now** via the real Razorpay checkout widget
- Login / Register
- My account — profile info + saved address book (add/remove)
- Order history + order details — full item list, totals, shipping address, tracking, and timeline; can pay from here too if still unpaid
- Responsive down to mobile (search hides into a hamburger nav, grids/tables reflow)
- Loading states, error banners with retry, and empty states on every data-driven page
- SEO basics: per-page `<title>`/description via Next's Metadata API, dynamic product-page metadata fetched server-side, account/cart/checkout pages marked `noindex`

## Why the Razorpay Widget Is Here, Not Just a "Place Order" Button
The Checkout page task implies a customer can actually complete a purchase. A checkout page that creates a pending order but offers no way to pay isn't functionally complete — so this phase wires up the real Razorpay checkout widget client-side, calling the existing `/api/payments/create-order` and `/api/payments/verify` endpoints built in Phase 6. No new backend code was needed for this; it's the existing payment API being used as intended.

## Folder Structure

```
frontend/website/
├── app/
│   ├── layout.jsx                # Root layout: providers, header, footer, site-wide metadata
│   ├── globals.css                # Design tokens + all styles
│   ├── page.jsx                    # Home
│   ├── products/page.jsx           # Product listing
│   ├── products/[id]/page.jsx      # Product details (dynamic SEO metadata)
│   ├── cart/page.jsx
│   ├── checkout/page.jsx
│   ├── login/page.jsx
│   ├── register/page.jsx
│   ├── profile/page.jsx
│   ├── orders/page.jsx             # Order history
│   ├── orders/[id]/page.jsx        # Order details
│   └── not-found.jsx
├── components/                     # Shared UI (Header, Footer, ProductCard, states, RequireAuth...)
│   └── views/                      # The actual interactive content for each page ("use client")
├── context/                        # AuthContext, CartContext
├── lib/
│   └── apiClient.js                # axios instance (client) + fetchServerSide helper (server metadata)
├── next.config.js
├── jsconfig.json
└── .env.example
```

Each `app/.../page.jsx` is a **server component** that only exports `metadata` (or `generateMetadata`) and renders a matching client component from `components/views/`. This keeps SEO metadata server-rendered while all the interactivity (forms, cart actions, fetching) runs client-side — the same axios + `useEffect` pattern used in the Admin Panel, for a consistent codebase.

## Setup Instructions

### 1. Make sure the backend is running first
```bash
cd ../../backend
npm install
npm run dev
```

### 2. Install and run the website
```bash
cd frontend/website
npm install
cp .env.example .env.local   # defaults to http://localhost:5000/api
npm run dev
```
Opens at `http://localhost:3000`.

### 3. Try it out
Register a new account from the site itself (no admin role needed — any logged-in user can shop). To test payment, you'll need real Razorpay **test mode** keys in the backend's `.env` (see `backend/README.md`); use test card `4111 1111 1111 1111` (any future expiry, any CVV) on the Razorpay widget.

## How Authentication Works
Same pattern as the Admin Panel, but **without** the admin-role check — any registered user can log in here. Token + user are stored in `localStorage` under `customer_token`/`customer_user` (different keys than the admin panel's `admin_token`/`admin_user`, so both can run in the same browser without colliding). A 401 from any API call automatically logs the customer out.

## Manual Testing Checklist
This is a browser app — testing it means opening it in a browser. Walk through this after starting both the backend and this site:

**Home**
- [ ] Category chips link to the correctly filtered product listing
- [ ] Newest arrivals show the most recently added products

**Product listing**
- [ ] Search, category, price range, and sort all narrow/reorder results, and the URL updates to match (bookmarkable, shareable)
- [ ] Pagination works with more than 12 products
- [ ] Reloading a filtered URL directly (e.g. pasting `/products?category=X`) shows the same filtered results

**Product details**
- [ ] Quantity selector respects available stock
- [ ] "Add to cart" while logged out redirects to `/login` and back afterward
- [ ] "Add to cart" while logged in updates the header cart badge immediately
- [ ] Out-of-stock products disable the add-to-cart button

**Cart**
- [ ] Quantity +/- updates the line total and overall total
- [ ] Removing the last item shows the empty-cart state with a link back to shopping
- [ ] "Proceed to checkout" navigates to `/checkout`

**Checkout**
- [ ] With no saved addresses, the new-address form shows automatically
- [ ] With saved addresses, you can pick one or switch to "use a new address"
- [ ] "Place order" creates an order and moves to the payment step
- [ ] "Pay now" opens the real Razorpay widget; completing a test payment redirects to the order details page showing `paid`
- [ ] Closing the Razorpay widget without paying still leaves the order visible (as `pending`/`unpaid`) in order history

**Login / Register**
- [ ] Registering logs you in immediately and redirects to wherever you were headed
- [ ] Logging in with the wrong password shows a clear error
- [ ] A `?redirect=` query param round-trips correctly after login

**My account**
- [ ] Profile details match what you registered with
- [ ] Adding and removing an address works and reflects immediately

**Order history / details**
- [ ] Orders list shows correct status/payment badges
- [ ] Clicking an order opens its details with items, totals, address, and a timeline
- [ ] An unpaid order shows a working "Pay now" button here too

**Responsive layout**
- [ ] Resize below ~860px: header search hides, hamburger menu appears and toggles the nav
- [ ] Product grid and tables reflow without horizontal overflow breaking the layout

## Known Limitations
See `docs/Phase-09_Customer_Website.md` for the full list — most notably, this checklist (and the Razorpay flow) needs to be run on your machine since this sandbox can't install npm packages or run a live MongoDB-backed backend.
