# Mobile App — Medical Equipment E-commerce Platform

A React Native app (Expo, managed workflow) covering the same customer journey as the website: browse, buy, track. Connects to the backend built in Phases 2–7.

## What's Included

- Login / Register screens
- Home — hero, category chips, newest arrivals
- Product Listing — search, category/sort filters (in a bottom-sheet filter modal), load-more pagination
- Product Details — image, description, quantity stepper, add to cart
- Cart — view/update/remove items, subtotal/tax/total
- Checkout — saved or new delivery address, places the order, then **Pay now** via a WebView-hosted Razorpay checkout
- Order History — paginated list of your orders
- Order Details — items, totals, address, payment status, pay-later option, link to tracking
- Order Tracking — dedicated screen for carrier/tracking ID/status plus the order's timeline
- Profile — account details + saved address book, log out
- Bottom tab navigation (Home / Shop / Cart / Orders / Account) with a stack on top for detail screens
- JWT auth via AsyncStorage (mobile's equivalent of the website's localStorage), auto-logout on 401
- Loading, error, and empty states on every data-driven screen
- Firebase push notifications kept as a **placeholder only** (`src/utils/pushNotifications.js`) — ready for a later phase, per the explicit task for this phase

## Why a WebView for Razorpay, Not `react-native-razorpay`
The standard React Native Razorpay SDK is a native module that needs a custom Expo dev build (it doesn't work in Expo's plain managed workflow, which has no way to compile native code in this environment). Instead, Checkout and Order Details open a `react-native-webview` containing a tiny self-contained HTML page that loads Razorpay's own `checkout.js` and opens the real widget — the same script the website uses, just hosted inside a WebView instead of a browser tab. The WebView posts a message back to React Native on success or dismissal, which then calls the existing `/api/payments/verify` or `/api/payments/failure` endpoints from Phase 6. This needed no backend changes and no custom native build — `react-native-webview` is a standard library Expo's managed workflow supports out of the box.

## Folder Structure

```
mobile/
├── App.js                      # Entry point: providers + navigation container
├── app.json                    # Expo config (app.extra.apiBaseUrl)
├── babel.config.js
├── src/
│   ├── config.js                 # Reads the API base URL from Expo config
│   ├── theme.js                   # Colors/spacing/radii + status badge color map
│   ├── api/apiClient.js           # axios instance, AsyncStorage token, 401 handling
│   ├── context/                    # AuthContext, CartContext
│   ├── navigation/                 # RootNavigator (stack), MainTabs (bottom tabs)
│   ├── components/                 # Shared UI: states, ProductCard, Button, FormField,
│   │                                # QuantityStepper, RequireAuthGate, ScreenContainer
│   ├── screens/                    # One file per screen (11 total — see below)
│   └── utils/pushNotifications.js  # Firebase placeholder (see above)
└── .gitignore
```

## Setup Instructions

### 1. Make sure the backend is running first
```bash
cd ../backend
npm install
npm run dev
```

### 2. Install and run the app
```bash
cd mobile
npm install
npm start
```
This opens Expo's developer tools. Scan the QR code with the **Expo Go** app on your phone, or press `a`/`i` for an Android/iOS emulator (if installed).

### 3. Point the app at your backend
Edit `app.json` → `expo.extra.apiBaseUrl`:
- **Emulator on the same machine as the backend:** `http://localhost:5000/api` (Android emulator: use `http://10.0.2.2:5000/api` instead — `localhost` inside the Android emulator refers to the emulator itself, not your computer)
- **Physical device:** use your computer's LAN IP, e.g. `http://192.168.1.50:5000/api` (phone and computer must be on the same Wi-Fi network)

### 4. Try it out
Register a new account from the app. For a real payment test, the backend's `.env` needs genuine Razorpay **TEST mode** keys; use test card `4111 1111 1111 1111` (any future expiry, any CVV) inside the WebView checkout.

## How Authentication Works
Same pattern as the website, but using `@react-native-async-storage/async-storage` instead of `localStorage` (React Native has no `localStorage`). Token + user are stored under `customer_token`/`customer_user`. A 401 from any API call automatically logs the user out. Home, Product Listing, and Product Details are public; Cart, Checkout, Order History, Order Details, Order Tracking, and Profile each gate their own content with `RequireAuthGate` (prompting to log in/sign up in place) rather than hiding the tab entirely — so the tab bar always shows all 5 sections.

## Manual Testing Checklist
This is a native app — testing it means running it in Expo Go or an emulator. Walk through this after starting the backend and the app:

**Login / Register**
- [ ] Registering logs you in immediately
- [ ] Wrong password shows a clear error
- [ ] Logging out from Profile returns you to a logged-out state, and gated tabs show the login prompt again

**Home**
- [ ] Category chips navigate to Product Listing pre-filtered to that category
- [ ] Pull-to-refresh reloads the categories and newest-arrivals data

**Product Listing**
- [ ] Search narrows results
- [ ] The Filters bottom sheet's category and sort selections apply correctly on "Apply filters"
- [ ] Scrolling to the bottom loads more products (load-more pagination) when there are more than 12

**Product Details**
- [ ] Quantity stepper respects available stock
- [ ] "Add to cart" while logged out navigates to Login
- [ ] "Add to cart" while logged in shows a confirmation and updates the Cart tab's badge count
- [ ] Out-of-stock products disable the add-to-cart button

**Cart**
- [ ] Quantity +/- updates line and order totals
- [ ] Removing the last item shows the empty-cart state
- [ ] "Proceed to checkout" navigates to Checkout

**Checkout**
- [ ] With no saved addresses, the new-address form shows automatically
- [ ] "Place order" creates an order and moves to the payment step
- [ ] "Pay now" opens the WebView; completing a Razorpay TEST payment closes the WebView and navigates to Order Details showing `paid`
- [ ] Dismissing the WebView without paying still leaves the order visible (as `pending`/`unpaid`)

**Order History / Details / Tracking**
- [ ] Orders list shows correct status badges and loads more on scroll
- [ ] Order Details shows correct items/totals/address and an unpaid order's "Pay now" works here too
- [ ] "Track this order" opens the Tracking screen showing carrier/ID/status and the same timeline as Order Details

**Profile**
- [ ] Account details match what you registered with
- [ ] Adding/removing an address works and reflects immediately

**Responsive / device variety**
- [ ] Layout looks correct on at least one small-screen and one larger-screen device/emulator size
- [ ] Keyboard doesn't obscure form fields on Login/Register/Checkout (uses `KeyboardAvoidingView` where needed)

## Known Limitations
See `docs/Phase-10_Mobile_App.md` for the full list — most notably, this checklist needs to be run on your machine with Expo Go or an emulator, since this sandbox can't install npm packages or run a native runtime. Firebase push notifications are an intentional placeholder per this phase's task list.
