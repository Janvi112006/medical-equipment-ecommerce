# API Documentation

Complete reference for every endpoint in the backend. Base URL: `http://localhost:5000/api` in development (see `Environment_Setup.md` for production).

**Response format:** every endpoint returns `{ "success": true/false, "message"?, "data"?, "errors"?, "pagination"? }`. Validation failures return `400` with an `errors` array of `{ field, message }`.

**Authentication:** protected endpoints require a header `Authorization: Bearer <token>`, obtained from Register or Login. Admin-only endpoints additionally require the logged-in user to have `role: "admin"`.

---

## Health Check

### `GET /`
Public, not under `/api`. Confirms the server is running. Returns `{ "message": "Medical Equipment E-commerce API is running" }`.

---

## Auth — `/api/auth`

### `POST /api/auth/register`
Public. Creates a new account with `role: "customer"` (role cannot be set by the client).

**Body:**
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "atleast6chars", "phone": "9876543210" }
```
`name` (≥2 chars), `email` (valid format), `password` (≥6 chars) required. `phone` optional, 7–15 digits if provided.

**Response `201`:** `{ success, message, data: { _id, name, email, role, token } }`

### `POST /api/auth/login`
Public.

**Body:** `{ "email": "...", "password": "..." }`

**Response `200`:** same shape as register. **`401`** for wrong email/password.

### `GET /api/auth/profile`
Protected (any logged-in user). Returns the current user's own profile (no password field).

---

## Products — `/api/products`

### `GET /api/products`
Public. Query params: `search`, `category`, `minPrice`, `maxPrice`, `inStock` (`true`/`false`), `sort` (`price_asc`/`price_desc`/`name_asc`/`name_desc`/`newest`, default `newest`), `page` (default 1), `limit` (default 10, max 50).

**Response `200`:** `{ success, data: [products], pagination: { total, page, limit, totalPages } }`

### `GET /api/products/categories`
Public. Returns the distinct list of categories currently in use: `{ success, data: ["Category A", "Category B", ...] }`

### `GET /api/products/:id`
Public. Single product, or `404`.

### `POST /api/products`
Admin only. Creates a product.
**Body:** `{ name, description, category, price, stock?, images? }` — `images` is an array of URL/path strings (no file upload).

### `PUT /api/products/:id`
Admin only. All fields optional; only provided fields are updated.

### `PATCH /api/products/:id/stock`
Admin only. Inventory management — use **one** of:
```json
{ "stock": 100 }     // sets stock to exactly 100
{ "adjust": -5 }      // subtracts 5 from current stock (won't go below 0)
```

### `DELETE /api/products/:id`
Admin only.

---

## Cart — `/api/cart`
All routes require a logged-in user (cart belongs to whoever is authenticated).

### `GET /api/cart`
Returns the cart with computed totals:
```json
{
  "success": true,
  "data": {
    "items": [{ "product": {}, "quantity": 2, "lineTotal": 1598 }],
    "subtotal": 1598, "taxRate": 0, "tax": 0, "total": 1598, "itemsRemoved": 0
  }
}
```
`itemsRemoved` reports how many cart lines were auto-removed because their product no longer exists.

### `POST /api/cart/add`
**Body:** `{ "productId": "...", "quantity": 2 }`. Increments quantity if already in the cart. Returns `400` if the requested quantity would exceed available stock.

### `PUT /api/cart/update`
**Body:** `{ "productId": "...", "quantity": 3 }`. Sets the quantity for that item (use the remove endpoint to delete a line entirely).

### `DELETE /api/cart/remove/:productId`
Removes one product from the cart.

---

## Addresses — `/api/addresses`
All routes require a logged-in user; each address belongs to whoever created it.

### `POST /api/addresses`
**Body:** `{ fullName, phone, addressLine, city, state, pincode, country? }` — all but `country` (defaults `"India"`) required.

### `GET /api/addresses`
Lists the logged-in user's own saved addresses.

### `DELETE /api/addresses/:id`
Only succeeds if the address belongs to the logged-in user.

---

## Checkout — `/api/checkout`

### `POST /api/checkout`
Protected. Requires a non-empty cart. Body — use **one** of:
```json
{ "addressId": "<a saved address id>" }
```
```json
{ "shippingAddress": { "fullName": "...", "phone": "...", "addressLine": "...", "city": "...", "state": "...", "pincode": "..." } }
```

**What it does:** validates stock for every cart item (rejects the whole checkout with a list of specific issues if anything's short) → creates an `Order` (`status: "pending"`, `payment.status: "unpaid"`) with item/price snapshots and an initial history entry → decrements stock → clears the cart.

**Response `201`:** the created `Order`. **`400`** if cart is empty, address is invalid/missing, or stock is insufficient.

---

## Payments — `/api/payments`
All routes protected; an order can only be acted on by its owner. Razorpay is the active gateway — Stripe/PayPal are placeholder env vars only, not implemented.

### `POST /api/payments/create-order`
**Body:** `{ "orderId": "<internal order id>" }`. Creates a Razorpay order for the given internal order and stores the Razorpay order id on it.

**Response `200`:** `{ success, data: { razorpayOrderId, amount, currency, key, internalOrderId } }`. `key` is the public Razorpay key id, safe to use in a frontend checkout widget.

### `POST /api/payments/verify`
**Body** (values come from the Razorpay checkout widget after a payment):
```json
{ "orderId": "...", "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..." }
```
Recomputes the HMAC-SHA256 signature server-side with `RAZORPAY_KEY_SECRET`. Only a match marks the order `payment.status: "paid"` and `status: "confirmed"`. **`400`** on an invalid signature (also flips `payment.status` to `"failed"`).

### `POST /api/payments/failure`
**Body:** `{ "orderId": "...", "reason": "optional free-text reason" }`. Records a cancelled/failed payment attempt.

---

## Orders — `/api/orders`
`status` (fulfillment, admin-controlled): `pending` → `confirmed` (automatic on payment) → `shipped` → `out_for_delivery` → `delivered`, or `cancelled`. Separate from `payment.status` (`unpaid`/`paid`/`failed`).

### `GET /api/orders/my`
Protected. The logged-in user's own orders. Query: `status`, `page`, `limit`.

### `GET /api/orders`
Admin only. All orders, with the user populated. Query: `status`, `user` (id), `page`, `limit`.

### `GET /api/orders/:id`
Protected. Owner or admin only (`403` otherwise). Full order including `items`, `subtotal`/`tax`/`totalAmount`, `shippingAddress`, `payment`, `tracking`, and `history` (timeline).

### `GET /api/orders/:id/tracking`
Protected. Owner or admin. Returns `{ orderId, orderStatus, tracking }`. If a `trackingId` is already set, this refreshes the (currently mocked) status via `utils/trackingService.js`.

### `PATCH /api/orders/:id/status`
Admin only. **Body:** `{ "status": "shipped", "note"?: "optional" }`. Appends a history entry and triggers the (placeholder) notification hook.

### `PATCH /api/orders/:id/tracking`
Admin only. **Body:** `{ "provider": "Shiprocket", "trackingId": "SR123456789", "trackingUrl"?: "..." }`. Sets tracking info via the placeholder tracking service.

---

## Users — `/api/users`
Admin only. Added in the Admin Panel phase to support user management (also the way to promote a user to admin via API, instead of editing MongoDB directly).

### `GET /api/users`
Query: `search` (matches name or email), `role`, `page`, `limit`.

### `PATCH /api/users/:id/role`
**Body:** `{ "role": "admin" }` or `{ "role": "customer" }`. An admin cannot change their own role (`400`, prevents accidental lockout).

---

## Error Responses
| Status | Meaning |
|---|---|
| `400` | Validation failed, or a business rule was violated (e.g. insufficient stock, empty cart, can't change own role) |
| `401` | Missing/invalid/expired token |
| `403` | Authenticated, but not allowed (wrong role, or not the resource owner) |
| `404` | Resource not found |
| `500` | Unexpected server error |
| `502` | Upstream provider error (e.g. Razorpay API call failed) |
