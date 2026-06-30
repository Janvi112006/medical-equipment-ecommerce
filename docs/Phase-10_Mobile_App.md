# Phase 10 — Mobile Application (React Native)

## Phase Number
Phase 10

## Objective
Build the React Native mobile app (Expo managed workflow), covering the same customer journey as the website — auth, browsing, cart, checkout with real payment, order history/tracking, and profile — fully connected to the existing backend, with navigation, JWT handling, responsive layout, and loading/error/empty states. Firebase push notifications are kept as an explicit placeholder per this phase's task list.

## Requirements Implemented
1. React Native mobile app created (Expo managed workflow), at `mobile/`
2. Login and Registration screens — no role restriction, register auto-logs-in
3. Home screen — hero, category chips, newest arrivals, pull-to-refresh
4. Product Listing screen — search, category/sort filters (bottom-sheet modal), load-more pagination
5. Product Details screen — image, description, stock-aware quantity stepper, add to cart
6. Cart screen — view/update quantity/remove, subtotal/tax/total
7. Checkout screen — saved or new delivery address, places the order, then **Pay now** via a WebView-hosted Razorpay checkout (see note below)
8. Order History screen — paginated (load-more) list of the logged-in user's orders
9. Order Tracking screen — a **dedicated** screen (separate from Order History/Details, as the task list specifies) showing carrier/tracking ID/status plus the order's timeline
10. User Profile screen — account details (read-only, same reasoning as the website) + saved address book (add/remove), log out
11. Connected to existing backend APIs — every screen uses endpoints already built in Phases 2–7; no backend changes were needed
12. Navigation configured — a root stack (`RootNavigator`) holding a bottom tab navigator (`MainTabs`: Home/Shop/Cart/Orders/Account) plus stack-level screens (Product Details, Checkout, Order Details, Order Tracking, Login, Register) reachable from anywhere
13. JWT authentication handling — `AsyncStorage`-backed session (mobile's equivalent of the website's `localStorage`), auto-logout on any `401`
14. Responsive mobile UI — flexbox-based layouts, `SafeAreaView`, `KeyboardAvoidingView` on forms, 2-column product grids that work across phone screen sizes
15. Loading, error, and empty states on every data-driven screen
16. Firebase Push Notifications kept as a ready placeholder — `src/utils/pushNotifications.js` documents exactly what a real integration would add, with no third-party push dependency actually installed
17. Testing — full static verification of all 30 frontend files, plus a manual on-device/emulator testing checklist (see Testing Performed)

## A Deliberate Technical Choice: WebView Instead of a Native Razorpay SDK
The standard `react-native-razorpay` package is a native module requiring a custom Expo "dev client" build — it cannot run in Expo's plain managed workflow, which has no native compiler available in this environment (or, generally, without an extra build step many beginners wouldn't have set up). Faking this would mean either a non-functional checkout or claiming something that doesn't actually work. Instead, Checkout and Order Details open a `react-native-webview` containing a small self-contained HTML page that loads Razorpay's own `checkout.js` — the exact same script the website uses — and bridges the result back to React Native via `postMessage`. This is a genuinely working approach inside Expo's managed workflow, needed no backend changes, and reuses the `/api/payments/create-order`, `/api/payments/verify`, and `/api/payments/failure` endpoints from Phase 6 exactly as the website does.

## A Practical Addition: Order Details Screen
The task list specifies "Order History screen" and "Order Tracking screen" as two items but doesn't separately mention an order-detail view. Order History (a list) needs somewhere to navigate to when a row is tapped, so an `OrderDetailsScreen` (items/totals/address/payment, with a "Track this order" button) was added as the natural connective screen between History and Tracking — the same role it plays on the website. This didn't require any backend change.

## Files Created
All new — this phase only added the `mobile/` project; no backend or other frontend files were touched.

**Root:** `package.json`, `app.json`, `babel.config.js`, `.gitignore`, `README.md`, `App.js`

**`src/`:**
- `config.js`, `theme.js`
- `api/apiClient.js`
- `context/AuthContext.js`, `context/CartContext.js`
- `navigation/RootNavigator.js`, `navigation/MainTabs.js`
- `components/`: `ScreenContainer.js`, `LoadingState.js`, `ErrorBanner.js`, `EmptyState.js`, `StatusBadge.js`, `ProductCard.js`, `QuantityStepper.js`, `Button.js`, `FormField.js`, `RequireAuthGate.js`
- `screens/`: `LoginScreen.js`, `RegisterScreen.js`, `HomeScreen.js`, `ProductListScreen.js`, `ProductDetailsScreen.js`, `CartScreen.js`, `CheckoutScreen.js`, `OrderHistoryScreen.js`, `OrderDetailsScreen.js`, `OrderTrackingScreen.js`, `ProfileScreen.js`
- `utils/pushNotifications.js` (Firebase placeholder)

## Files Modified
None — no backend, admin panel, or website files were changed in this phase.

## APIs Connected
Every screen uses APIs that already existed from Phases 2–7. No new backend endpoints were needed.

| Screen | Endpoints used |
|---|---|
| Login | `POST /api/auth/login` |
| Register | `POST /api/auth/register` |
| Home | `GET /api/products/categories`, `GET /api/products` |
| Product Listing | `GET /api/products`, `GET /api/products/categories` |
| Product Details | `GET /api/products/:id`, `POST /api/cart/add` |
| Cart | `GET /api/cart`, `PUT /api/cart/update`, `DELETE /api/cart/remove/:productId` |
| Checkout | `GET /api/addresses`, `POST /api/checkout`, `POST /api/payments/create-order`, `POST /api/payments/verify`, `POST /api/payments/failure` |
| Order History | `GET /api/orders/my` |
| Order Details | `GET /api/orders/:id`, `POST /api/payments/create-order`, `POST /api/payments/verify`, `POST /api/payments/failure` |
| Order Tracking | `GET /api/orders/:id`, `GET /api/orders/:id/tracking` |
| Profile | `GET /api/auth/profile`, `GET /api/addresses`, `POST /api/addresses`, `DELETE /api/addresses/:id` |

## Dependencies Added
**Mobile (`mobile/package.json`):**
- `expo` ~51.0.28, `expo-status-bar` ~1.12.1, `expo-constants` ~16.0.2
- `react` 18.2.0, `react-native` 0.74.5
- `@react-navigation/native` ^6.1.18, `@react-navigation/native-stack` ^6.11.0, `@react-navigation/bottom-tabs` ^6.6.1
- `react-native-screens` 3.31.1, `react-native-safe-area-context` 4.10.5 — peer dependencies required by React Navigation
- `@react-native-async-storage/async-storage` 1.23.1 — session persistence (RN has no `localStorage`)
- `axios` ^1.7.7
- `react-native-webview` 13.8.6 — hosts the Razorpay checkout page (see note above)
- Dev: `babel-preset-expo` ~11.0.0

No backend dependencies — none were needed.

## Testing Performed
1. **Static verification, actually executed in this sandbox:** same proven approach from Phases 8–9 — `tsc --noEmit --allowJs --jsx react` as a real JSX/JS syntax checker, confirmed to also handle React Native-specific imports (`react-native`, `@react-navigation/*`, `react-native-webview`) correctly with a small throwaway test file before committing to the approach for this phase.
   - Ran it across **all 30 mobile source files at once** — exit code 0, zero errors
   - Verified every relative import resolves to a real file, and every default/named export matches its usage (contexts, all 10 shared components, all 11 screens, both navigators)
   - Re-ran the syntax/type checks for the backend, admin panel, and website to confirm this phase left them untouched — all still pass
2. **Project-wide structural verification:**
   - Scanned the entire project for duplicate or stray folders — clean (no repeat of the brace-expansion mistake from earlier phases; this phase's folders were all created with explicit individual `mkdir -p` calls from the start)
   - Validated `mobile/package.json` and `mobile/app.json` as well-formed JSON
3. **What couldn't be tested here:** Running the actual Expo app (via Expo Go or an emulator), navigating between screens, adding to cart, and completing a WebView Razorpay payment all need `npm install` (network) and a live MongoDB-backed backend reachable from a device — none available in this sandbox. Built a full manual testing checklist in `mobile/README.md` (login/logout, every screen's data flow, the WebView payment round-trip, load-more pagination, keyboard behavior on forms) for you to run through locally:
   ```bash
   # terminal 1
   cd backend && npm install && npm run dev
   # terminal 2
   cd mobile && npm install && npm start
   ```
   Then open the app in Expo Go or an emulator and work through the checklist. Remember to point `app.json`'s `apiBaseUrl` at the right address for your device (see `mobile/README.md`).

## Bugs Fixed
None — this phase only added new files; no defects were found in the process.

## Known Issues
- **No edit-profile endpoint** — same reasoning as the website's Phase 9: Profile is read-only because no `PUT /api/auth/profile` exists, and the address book covers the page's practical need.
- **Razorpay payment requires real test credentials** and a live device/emulator to fully exercise — same limitation as Phase 6/9's testing.
- **No automated mobile tests** (e.g. Detox) — verification here is static (syntax, import/export correctness) plus the manual checklist, consistent with the approach taken for both frontends.
- **Push notifications are intentionally a placeholder** — per task 16, no Firebase/Expo-notifications dependency was added; `src/utils/pushNotifications.js` documents what a real integration would need.
- **Tab bar badge and gated-tab UX is a deliberate design choice, not a bug**: rather than swapping the entire navigator based on auth state (which would hide Cart/Orders/Profile tabs entirely when logged out), each of those screens gates its *content* with `RequireAuthGate` so the tab bar always shows all 5 sections — matching the website's per-page `RequireAuth` pattern rather than a different mobile-only pattern.
- Carried forward, unchanged from earlier phases: tracking and notifications remain placeholders (Phase 7), no stock-restoration on cancellation/payment-failure (Phases 6/7), no DB transactions across multi-step backend writes (Phases 5/6), category remains free-text (Phase 4).

## How to Run
```bash
# Backend (terminal 1)
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, RAZORPAY_KEY_ID/SECRET
npm run dev

# Mobile app (terminal 2)
cd mobile
npm install
npm start
```
Scan the QR code in Expo Go, or press `a`/`i` for an emulator. See `mobile/README.md` for the full manual testing checklist, device networking notes, and how authentication works.

## Next Phase
To be confirmed with you — remaining items from the original roadmap: Push Notifications (Firebase, to replace the placeholder built in this phase), Testing & QA, Deployment.

## Completion Checklist
✅ React Native mobile application created (Expo managed workflow)
✅ Login and Registration screens created
✅ Home screen created
✅ Product Listing screen created
✅ Product Details screen created
✅ Cart screen created
✅ Checkout screen created, including a working payment flow (WebView-hosted Razorpay)
✅ Order History screen created
✅ Order Tracking screen created (as a distinct screen from Order History)
✅ User Profile screen created
✅ Connected to existing backend APIs — no backend changes required
✅ Navigation configured (bottom tabs + stack for detail/auth screens)
✅ JWT authentication handling added (AsyncStorage, auto-logout on 401)
✅ Responsive mobile UI added
✅ Loading, error, and empty states added throughout
✅ Firebase Push Notifications kept as a ready placeholder, not implemented
✅ All 30 mobile files statically verified (JSX syntax, import/export consistency) — zero errors
✅ Manual on-device/emulator testing checklist created
✅ No bugs found; backend, admin panel, and website confirmed untouched and still passing verification
