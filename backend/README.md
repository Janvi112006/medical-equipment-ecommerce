# Backend — Medical Equipment E-commerce Platform

Phase 2 foundation: Node.js + Express + MongoDB API with authentication and product management.

## What's Included in This Phase

- Express server with clean folder structure
- MongoDB connection (via Mongoose)
- Models: `User`, `Product`, `Order`, `Cart`, `Address`
- Auth: Register, Login, Get Profile (JWT-based)
- Input validation on Register/Login (`express-validator`)
- Role-based access control (`protect`, `adminOnly`, `authorizeRoles`)
- Product CRUD: public read, admin-only write — with search, category/price/stock filters, sorting, and pagination
- Distinct category listing endpoint
- Inventory/stock management endpoint (set or adjust)
- Cart: view, add, update quantity, remove — with subtotal/tax(placeholder)/total
- Delivery address book (create/list/delete)
- Checkout: stock validation, pending order creation, stock decrement, cart clearing
- Payment: Razorpay order creation, signature verification, payment failure handling
- Order management: my orders, order details, admin order listing/filtering
- Order status lifecycle: pending → confirmed → shipped → out_for_delivery → delivered (or cancelled), admin-controlled
- Order tracking: provider/trackingId/status, with a placeholder tracking service
- Order history/timeline, auto-recorded on every status or tracking change
- Notification placeholder, called on every status/tracking change (ready for future Firebase wiring)
- Input validation on all of the above (`express-validator`)
- Standardized JSON response format (`success`, `message`, `data`/`errors`)
- Centralized error handling

**Not included yet (later phases):** Cart, Checkout, Payment (Razorpay), Order tracking, Push notifications, AI chatbot. The `Order` model already has placeholder fields for payment and tracking so nothing needs to be restructured later.

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── productController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── productRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── app.js                 # Express app + middleware + routes
│   └── server.js              # Entry point (connects DB, starts server)
├── .env.example
├── .gitignore
└── package.json
```

## Setup Instructions

### 1. Prerequisites
- Node.js (v18 or later recommended)
- MongoDB running locally, or a MongoDB Atlas connection string

### 2. Install dependencies
```bash
cd backend
npm install
```

### 3. Configure environment variables
Copy the example file and fill in your own values:
```bash
cp .env.example .env
```

At minimum, set:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — any long random string

Razorpay, tracking API, and chatbot keys are placeholders for now — leave them blank until those modules are built.

`CORS_ORIGIN` can stay blank in development (all origins allowed). In production, set it to a comma-separated list of your actual frontend URLs — see the Security Recommendations in `docs/Phase-11_Testing_QA_Deployment.md`.

### 4. Run the server

Development (auto-restarts on file changes):
```bash
npm run dev
```

Production:
```bash
npm start
```

The server starts at `http://localhost:5000` (or whatever `PORT` you set in `.env`).

You should see in the terminal:
```
MongoDB connected: <your-host>
Server running on http://localhost:5000
```

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create a new account (validated: name, email, password ≥6 chars, optional phone) |
| POST | `/api/auth/login` | Public | Log in, returns a JWT (validated: email, password) |
| GET | `/api/auth/profile` | Logged-in user | Get current user's profile |

**Response format:** every endpoint returns `{ success: true/false, message, data? / errors? }`.

**Register/Login body example:**
```json
{
  "name": "Roopa",
  "email": "roopa@example.com",
  "password": "yourpassword123",
  "phone": "9999999999"
}
```

**Example success response (login):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "...",
    "name": "Roopa",
    "email": "roopa@example.com",
    "role": "customer",
    "token": "..."
  }
}
```

**Example validation error response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Enter a valid email address" }
  ]
}
```

### Products — `/api/products`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/products` | Public | List products with search, filters, sorting, pagination |
| GET | `/api/products/categories` | Public | Get the distinct list of categories in use |
| GET | `/api/products/:id` | Public | Get one product |
| POST | `/api/products` | Admin only | Create a product (validated) |
| PUT | `/api/products/:id` | Admin only | Update a product (validated) |
| PATCH | `/api/products/:id/stock` | Admin only | Update inventory — set absolute stock or adjust by a delta |
| DELETE | `/api/products/:id` | Admin only | Delete a product |

**Query params for `GET /api/products`:**
| Param | Example | Description |
|---|---|---|
| `search` | `?search=monitor` | Matches against name OR description (case-insensitive) |
| `category` | `?category=Diagnostic Equipment` | Exact category match |
| `minPrice` / `maxPrice` | `?minPrice=100&maxPrice=2000` | Price range filter |
| `inStock` | `?inStock=true` | `true` = stock > 0, `false` = stock ≤ 0 |
| `sort` | `?sort=price_asc` | One of: `price_asc`, `price_desc`, `name_asc`, `name_desc`, `newest` (default) |
| `page` | `?page=2` | Page number, default 1 |
| `limit` | `?limit=20` | Items per page, default 10, max 50 |

**List response shape:**
```json
{
  "success": true,
  "data": [ /* array of products */ ],
  "pagination": { "total": 42, "page": 1, "limit": 10, "totalPages": 5 }
}
```

**Create product body example:**
```json
{
  "name": "Digital BP Monitor",
  "description": "Automatic blood pressure monitor with LCD display",
  "category": "Diagnostic Equipment",
  "price": 1499,
  "stock": 50,
  "images": ["https://example.com/images/bp-monitor.jpg"]
}
```
`images` stores URL or path strings only — there is no file upload in this phase.

**Update stock body — either form:**
```json
{ "stock": 100 }       // sets stock to exactly 100
{ "adjust": -5 }        // subtracts 5 from current stock (won't go below 0)
```

### Cart — `/api/cart`
All cart routes require a logged-in user (`Authorization: Bearer <token>`). The cart belongs to whoever is logged in.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart` | View cart with subtotal, tax (placeholder), and total |
| POST | `/api/cart/add` | Add a product to the cart (or increase quantity if already in cart) |
| PUT | `/api/cart/update` | Set a specific item's quantity |
| DELETE | `/api/cart/remove/:productId` | Remove an item from the cart |

**Add/Update body:**
```json
{ "productId": "<product id>", "quantity": 2 }
```

**Cart response shape:**
```json
{
  "success": true,
  "data": {
    "items": [
      { "product": { "_id": "...", "name": "...", "price": 799, "...": "..." }, "quantity": 2, "lineTotal": 1598 }
    ],
    "subtotal": 1598,
    "taxRate": 0,
    "tax": 0,
    "total": 1598,
    "itemsRemoved": 0
  }
}
```
`tax`/`taxRate` are placeholders — see `TAX_RATE` in `.env.example`. They default to 0 until a real tax rule is confirmed.

### Addresses — `/api/addresses`
All routes require a logged-in user. Each address belongs to the account that created it.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/addresses` | Add a delivery address |
| GET | `/api/addresses` | List your saved addresses |
| DELETE | `/api/addresses/:id` | Delete one of your addresses |

**Create address body:**
```json
{
  "fullName": "Dr. Roopa",
  "phone": "9876543210",
  "addressLine": "123 MG Road",
  "city": "Bengaluru",
  "state": "Karnataka",
  "pincode": "560001",
  "country": "India"
}
```

### Checkout — `/api/checkout`
Requires a logged-in user with at least one item in their cart.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/checkout` | Validate stock, create a pending order, decrement stock, clear the cart |

**Body — use ONE of these two forms:**
```json
{ "addressId": "<a saved address id>" }
```
```json
{
  "shippingAddress": {
    "fullName": "Dr. Roopa",
    "phone": "9876543210",
    "addressLine": "123 MG Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560001"
  }
}
```

**What happens on checkout:**
1. Cart must not be empty
2. Stock is checked for every item — if anything is short, the whole checkout is rejected with a list of the specific issues
3. An `Order` is created with `status: "pending"` and `payment.status: "unpaid"` — payment itself is wired up in the next phase
4. Each product's stock is decremented by the ordered quantity
5. The cart is cleared

**Success response:** the created `Order` document, including `subtotal`, `tax`, `totalAmount`, `items` (snapshotted name/price/quantity), and `shippingAddress`.

### Payments — `/api/payments`
All routes require a logged-in user. Razorpay is the active gateway (final decision). Stripe and PayPal are **placeholders only** — env vars exist for them in `.env.example` but no code is implemented for either in this phase.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments/create-order` | Create a Razorpay order for one of your existing internal orders |
| POST | `/api/payments/verify` | Verify a Razorpay checkout signature and mark the order as paid |
| POST | `/api/payments/failure` | Record that a payment failed or was cancelled |

**Typical flow:**
1. Customer checks out (`POST /api/checkout`) → gets back an internal `Order` with `payment.status: "unpaid"`
2. Frontend calls `POST /api/payments/create-order` with that order's `_id` → gets back `{ razorpayOrderId, amount, currency, key }`
3. Frontend opens Razorpay's checkout widget using those values
4. On success, Razorpay's widget returns `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` to the frontend
5. Frontend sends those three values + the internal `orderId` to `POST /api/payments/verify`
6. Backend recomputes the signature server-side with `RAZORPAY_KEY_SECRET` — only if it matches is the order marked `paid`
7. If the user cancels/closes the widget, or Razorpay reports failure, the frontend calls `POST /api/payments/failure` instead

**Create order body:**
```json
{ "orderId": "<internal order id from checkout>" }
```

**Create order response:**
```json
{
  "success": true,
  "message": "Razorpay order created",
  "data": {
    "razorpayOrderId": "order_xxxxxxxxxxxxx",
    "amount": 49900,
    "currency": "INR",
    "key": "rzp_test_xxxxxxxxxxxxx",
    "internalOrderId": "..."
  }
}
```

**Verify body** (these three values come from Razorpay's checkout widget, not from your own code):
```json
{
  "orderId": "<internal order id>",
  "razorpay_order_id": "order_xxxxxxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "razorpay_signature": "..."
}
```

**Failure body:**
```json
{ "orderId": "<internal order id>", "reason": "User closed the checkout window" }
```

**Important:** the signature in `/verify` is the only thing that proves a payment is real — never trust a frontend that just says "payment succeeded" without it. An invalid signature gets rejected with `400` and the order's `payment.status` is set to `"failed"`.

### Orders — `/api/orders`
`status` (fulfillment status, admin-controlled) is separate from `payment.status` (set automatically by the payment flow). Valid `status` values: `pending`, `confirmed`, `shipped`, `out_for_delivery`, `delivered`, `cancelled`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/orders/my` | Logged-in user | Your own orders. Supports `?status=&page=&limit=` |
| GET | `/api/orders` | Admin only | All orders. Supports `?status=&user=&page=&limit=` |
| GET | `/api/orders/:id` | Owner or admin | Full order details, including `history` timeline |
| GET | `/api/orders/:id/tracking` | Owner or admin | Current tracking info (refreshes the mocked status if a trackingId is set) |
| PATCH | `/api/orders/:id/status` | Admin only | Update fulfillment status |
| PATCH | `/api/orders/:id/tracking` | Admin only | Set/replace tracking info (provider, trackingId, trackingUrl) |

**Update status body:**
```json
{ "status": "shipped", "note": "Optional note for the timeline" }
```

**Update tracking body:**
```json
{ "provider": "Shiprocket", "trackingId": "SR123456789", "trackingUrl": "https://...optional..." }
```
If `trackingUrl` is omitted, a placeholder URL is generated. **Tracking is a placeholder** — `utils/trackingService.js` returns a mocked status (`in_transit`) until a real courier API is integrated; see `TRACKING_API_BASE_URL`/`TRACKING_API_KEY` in `.env.example`.

**Order history/timeline:** every order has a `history` array, appended to automatically whenever its status or tracking changes:
```json
"history": [
  { "status": "pending", "note": "Order placed, awaiting payment", "changedBy": null, "changedAt": "..." },
  { "status": "confirmed", "note": "Payment verified successfully via Razorpay", "changedBy": null, "changedAt": "..." },
  { "status": "shipped", "note": "Manually shipped", "changedBy": "<admin user id>", "changedAt": "..." }
]
```
`changedBy: null` means the entry was system-generated (e.g. automatic payment confirmation); otherwise it's the admin user id who made the change.

**Notifications (placeholder):** every status/tracking change calls `utils/notifyOrderStatusChange.js`, which currently just logs what *would* be sent. This is intentionally in place now so wiring in Firebase Cloud Messaging later won't require touching any controller — only that one function.

### Users — `/api/users`
Admin only. Added in the Admin Panel (frontend) phase to support the User Management page — this also resolves the "no way to promote a user to admin via API" limitation noted since Phase 2 (previously this had to be done by hand in MongoDB; it can still be done that way, but now there's an API too).

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List users. Supports `?search=&role=&page=&limit=` |
| PATCH | `/api/users/:id/role` | Change a user's role to `customer` or `admin` |

**Update role body:**
```json
{ "role": "admin" }
```
An admin cannot change their own role through this endpoint (prevents accidental self-lockout) — expect `400` if you try.

To call an admin-only route, send the JWT from login in the header:
```
Authorization: Bearer <your_token_here>
```

> Note: As of the Admin Panel (frontend) phase, `PATCH /api/users/:id/role` lets an existing admin promote another user to admin via the API (see Users section below). For the very first admin account, you'll still need to set `role: "admin"` directly on a user document in MongoDB once — after that, all further promotions can go through the API or the Admin Panel UI.

## Testing the Auth APIs

A manual test script is included at `tests/auth.manual-test.sh`. After starting the server (`npm run dev`), run:
```bash
chmod +x tests/auth.manual-test.sh
./tests/auth.manual-test.sh
```
It exercises register, login, profile, validation errors, wrong password, missing/invalid token, and the admin-only role check — printing each response so you can confirm it matches the expected result noted in the script.

## Testing the Product APIs

A manual test script is included at `tests/product.manual-test.sh`. It needs an admin account (set `role: "admin"` on a user in MongoDB first):
```bash
chmod +x tests/product.manual-test.sh
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword ./tests/product.manual-test.sh
```
It exercises create/read/update/delete, validation errors, search, category/price/stock filters, sorting, pagination, the categories list, and stock adjustment — printing each response so you can confirm it matches the expected result noted in the script.

## Testing the Cart & Checkout APIs

A manual test script is included at `tests/cart-checkout.manual-test.sh`. It needs both an admin account and a customer account:
```bash
chmod +x tests/cart-checkout.manual-test.sh
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword \
CUSTOMER_EMAIL=customer@example.com CUSTOMER_PASSWORD=yourpassword \
./tests/cart-checkout.manual-test.sh
```
It exercises view/add/update/remove cart, stock limits, validation errors, address create/list/delete, and a full checkout (stock decrement + cart clear + order creation) — printing each response so you can confirm it matches the expected result noted in the script.

## Testing the Payment APIs

A manual test script is included at `tests/payment.manual-test.sh`. It needs both an admin account and a customer account. It has two parts: Part A needs real Razorpay TEST keys + network (creating a Razorpay order); Part B tests the signature verification logic itself and works even without real Razorpay credentials.
```bash
chmod +x tests/payment.manual-test.sh
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword \
CUSTOMER_EMAIL=customer@example.com CUSTOMER_PASSWORD=yourpassword \
./tests/payment.manual-test.sh
```
To test a full real payment end-to-end, use Razorpay's TEST mode card `4111 1111 1111 1111` (any future expiry, any CVV) through an actual Razorpay checkout widget on a frontend, then send the real values it returns to `/verify`.

## Testing the Order & Tracking APIs

A manual test script is included at `tests/order.manual-test.sh`. It needs both an admin account and a customer account:
```bash
chmod +x tests/order.manual-test.sh
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword \
CUSTOMER_EMAIL=customer@example.com CUSTOMER_PASSWORD=yourpassword \
./tests/order.manual-test.sh
```
It exercises my-orders, order details, admin order listing/filtering, status updates through the full lifecycle, role checks, tracking set/get, and validation errors — printing each response so you can confirm it matches the expected result noted in the script. Watch your server's terminal too — each status/tracking change logs a `[notify-placeholder]` line.

## Testing the User Management APIs

A manual test script is included at `tests/user.manual-test.sh`:
```bash
chmod +x tests/user.manual-test.sh
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword \
CUSTOMER_EMAIL=customer@example.com CUSTOMER_PASSWORD=yourpassword \
./tests/user.manual-test.sh
```

## Next Steps (Future Backend Phases)
- Push notifications (Firebase) — replace the placeholder in `utils/notifyOrderStatusChange.js`
- Real tracking provider integration — replace the placeholder in `utils/trackingService.js`
- AI chatbot endpoint (deferred, placeholder only)
- Stripe/PayPal — placeholders only; not planned unless explicitly requested
