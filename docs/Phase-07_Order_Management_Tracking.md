# Phase 7 — Order Management & Order Tracking

## Phase Number
Phase 7

## Objective
Complete order management: customer order views, admin order listing/filtering, a 6-stage admin-controlled fulfillment status lifecycle, a placeholder order tracking endpoint, persisted tracking ID/status, an automatically-recorded order timeline/history, and a notification placeholder preparing for future Firebase Cloud Messaging integration.

## Requirements Implemented
1. Complete Order Management APIs — my orders, order details, admin listing, status updates, tracking get/set (see APIs Added)
2. Get My Orders API — `GET /api/orders/my`, paginated, optional `?status=` filter
3. Get Order Details API — `GET /api/orders/:id`, owner or admin only
4. Admin Order Management APIs — `GET /api/orders` (all orders, filterable by status/user, paginated)
5. Admin can update order status through all 6 states: `pending`, `confirmed`, `shipped`, `out_for_delivery`, `delivered`, `cancelled` — via `PATCH /api/orders/:id/status`
6. Order Tracking endpoint added — `GET/PATCH /api/orders/:id/tracking`, backed by a placeholder third-party tracking service (`utils/trackingService.js`) since no real provider has been finalized yet
7. Tracking ID and tracking status are saved on the order (`Order.tracking.trackingId`, `Order.tracking.status`)
8. Order timeline/history — new `Order.history` array, automatically appended to whenever status or tracking changes, recording what changed, when, an optional note, and who changed it (or `null` for system-generated entries)
9. Notification placeholder — `utils/notifyOrderStatusChange.js`, called from every status/tracking change; currently logs what *would* be sent so Firebase Cloud Messaging can be wired in later without touching any controller
10. Testing — manual test script covering the full order/tracking flow, plus direct execution of the pure-logic utilities in this sandbox (see Testing Performed)

## Files Created
- `backend/src/middleware/orderValidators.js`
- `backend/src/controllers/orderController.js`
- `backend/src/routes/orderRoutes.js`
- `backend/src/utils/addHistoryEntry.js`
- `backend/src/utils/notifyOrderStatusChange.js`
- `backend/src/utils/trackingService.js`
- `backend/tests/order.manual-test.sh`

## Files Modified
- `backend/src/models/Order.js` — **status taxonomy changed** (see Database Changes for details); added `tracking.status` and the new `history` array
- `backend/src/controllers/paymentController.js` — `verifyPayment` now sets `order.status = "confirmed"` (was `"paid"`, which no longer exists in the fulfillment status enum — see Known Issues), and all three payment outcomes (verified, invalid signature, failure) now append a history entry and call the notify placeholder where relevant
- `backend/src/controllers/checkoutController.js` — new orders are created with an initial history entry ("Order placed, awaiting payment")
- `backend/src/app.js` — mounted `/api/orders` routes
- `backend/.env.example` — updated comment on `TRACKING_API_BASE_URL`/`KEY` noting the new placeholder service
- `backend/README.md` — documented the full order/tracking API surface, the history timeline format, and the new test script

## Database Changes
`orders` collection:
- **`status` enum changed** from `["pending", "paid", "shipped", "delivered", "cancelled"]` to `["pending", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"]`. This separates fulfillment status (`status`) from payment status (`payment.status`, unchanged: `unpaid`/`paid`/`failed`) — they were being conflated before (payment success was setting `status: "paid"`, which doesn't make sense as a fulfillment stage). **This is a breaking change for any orders already created under the old enum** — see Known Issues.
- Added `tracking.status` (String, enum `not_shipped`/`in_transit`/`out_for_delivery`/`delivered`/`unknown`, default `not_shipped`)
- Added `history` (array of `{ status, note, changedBy, changedAt }`, default `[]`)

No new collections in this phase.

## APIs Added
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/orders/my` | Logged-in user | Your own orders, paginated, optional status filter |
| GET | `/api/orders` | Admin only | All orders, filterable by status/user, paginated |
| GET | `/api/orders/:id` | Owner or admin | Full order details including history |
| GET | `/api/orders/:id/tracking` | Owner or admin | Current tracking info (refreshes mocked status if a trackingId is set) |
| PATCH | `/api/orders/:id/status` | Admin only | Update fulfillment status |
| PATCH | `/api/orders/:id/tracking` | Admin only | Set/replace tracking provider/trackingId/trackingUrl |

## Dependencies Added
None new — reused `express-validator` already added in Phase 3.

## Testing Performed
1. **Static verification (run in this sandbox):**
   - Syntax-checked all backend `.js` files with `node --check` — all passed, including the 3 modified controllers (`paymentController.js`, `checkoutController.js`, `app.js`)
   - Cross-checked every new export against its corresponding import (`orderController` ↔ `orderRoutes`, `orderValidators` ↔ `orderRoutes`, all 3 new `utils` modules)
   - Confirmed route order places `/my` before `/:id` so it isn't swallowed by the id-matching route (same pattern as the Phase 4 `/categories` fix)
   - Re-ran the project-wide duplicate-folder scan — no duplicates introduced
   - Validated `package.json` as well-formed JSON
2. **Pure-logic utilities — actually executed and confirmed correct in this sandbox** (no database or network needed for these):
   - `addHistoryEntry()` — called twice on a fake order object, confirmed both entries were appended correctly with the right `status`/`note`/`changedBy`/`changedAt` shape
   - `notifyOrderStatusChange()` — called and confirmed it logs the expected placeholder message
   - `fetchTrackingStatus()` — called and confirmed it returns a `status` string and a `trackingUrl` containing the given tracking id
3. **Live endpoint testing — requires your machine:** Same sandbox limitation as previous phases (no network/MongoDB here). Built `backend/tests/order.manual-test.sh`, which exercises:
   - Get my orders (with pagination)
   - Get order details as the owner
   - Admin get-all-orders, and the same call rejected for a non-admin (`403`)
   - Status update through the full lifecycle (`confirmed` → `shipped` → `out_for_delivery` → `delivered`), an invalid status value (`400`), and a non-admin attempting the update (`403`)
   - Set tracking info, a missing-field validation error, and getting tracking as the owner
   - Re-fetching the full order to confirm the history array accumulated multiple entries

   **Run it yourself with:**
   ```bash
   cd backend
   npm install
   cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, RAZORPAY_KEY_ID/SECRET
   npm run dev
   # in a second terminal:
   chmod +x tests/order.manual-test.sh
   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword \
   CUSTOMER_EMAIL=customer@example.com CUSTOMER_PASSWORD=yourpassword \
   ./tests/order.manual-test.sh
   ```

## Bugs Fixed
- **Fixed a status-taxonomy inconsistency introduced in Phase 6**: `verifyPayment` was setting `order.status = "paid"`, but `"paid"` was never a valid fulfillment status — it was left over from an earlier, less precise version of the `Order` model where payment and fulfillment status were blended together. Phase 7's explicit 6-status list (`pending`/`confirmed`/`shipped`/`out_for_delivery`/`delivered`/`cancelled`) made this collision visible, so it's corrected now: payment success sets `status: "confirmed"`, and `payment.status: "paid"` remains the separate source of truth for "has this been paid for."

## Known Issues
- **Breaking change to `Order.status` enum.** Any order documents created in earlier phases/testing with `status: "paid"` will no longer match the new enum. Mongoose only validates on write, so existing documents can still be *read* fine, but re-saving one without first correcting its `status` would fail validation. This is a development-time concern (no production data exists yet) — flagging it so it isn't a surprise later. If real data existed, a one-time migration script (`paid` → `confirmed`) would be needed.
- **No status-transition rules enforced.** An admin can set any of the 6 statuses on any order regardless of its current state (e.g. `delivered` → `pending` is technically allowed). Kept simple intentionally for this phase; worth adding transition rules (e.g. can't un-deliver, can't ship a cancelled order) before production.
- **Tracking remains a placeholder.** `utils/trackingService.js` always returns a mocked `in_transit` status — no real courier API is integrated yet (carried forward from Phase 1/5 planning).
- **Notifications remain a placeholder.** `utils/notifyOrderStatusChange.js` only logs to the console — no real push notification is sent yet (Firebase Cloud Messaging is a separate, not-yet-built phase per the original roadmap).
- **No stock-restoration on cancellation.** Setting status to `cancelled` does not currently restore the stock that was decremented at checkout (Phase 5) — carried forward as a known gap, same family of issue as the no-restock-on-payment-failure note from Phase 6.
- Carried forward, unchanged: no DB transactions across multi-step writes (Phase 5/6), category remains free-text (Phase 4), no admin-promotion endpoint (Phase 2).

## How to Run
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, RAZORPAY_KEY_ID/SECRET
npm run dev
```
Server starts at `http://localhost:5000`. Full order/tracking API details, the history timeline format, and the manual test script are in `backend/README.md`.

## Next Phase
To be confirmed with you — remaining items from the original roadmap: Website, Admin Panel, Mobile App, Push Notifications (Firebase — to replace the placeholder built in this phase), Testing & QA, Deployment.

## Completion Checklist
✅ Order Management APIs completed
✅ Get My Orders API implemented
✅ Get Order Details API implemented
✅ Admin Order Management APIs implemented (list/filter all orders)
✅ Admin can update order status through all 6 required states
✅ Order Tracking endpoint added with a placeholder third-party service
✅ Tracking ID and tracking status saved on the order
✅ Order timeline/history recorded automatically on every status/tracking change
✅ Notification placeholder in place, ready for future Firebase integration
✅ Pure-logic utilities (history, notify, tracking mock) executed and confirmed correct in this sandbox
✅ Manual test script created covering the full order/tracking flow
✅ One pre-existing inconsistency (Phase 6's `status: "paid"`) found and fixed; no other bugs found
