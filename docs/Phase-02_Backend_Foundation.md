# Phase 2 — Backend Foundation

## Phase Number
Phase 2

## Objective
Build the backend foundation only: Express server, MongoDB connection, core data models, basic authentication, product CRUD, and JWT-based route protection. No frontend, admin panel, or mobile app in this phase.

## Requirements Implemented
- Node.js + Express server setup
- MongoDB connection via Mongoose
- `User` model (name, email, phone, password, role, isVerified placeholder)
- `Product` model (name, description, category, price, stock, images, createdBy)
- `Order` model (items, totalAmount, shippingAddress, status, payment placeholder for Razorpay, tracking placeholder)
- Auth routes: Register, Login, Get Profile
- Product CRUD routes: public read, admin-only write
- JWT authentication middleware (`protect`) and role guard (`adminOnly`)
- `.env.example` with placeholders for Razorpay, tracking API, and chatbot keys
- Centralized error handling (404 + generic error handler)

## Folder Structure Changes
Created the approved top-level architecture, with only `backend/` implemented:
```
medical-equipment-ecommerce/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── website/        (placeholder, empty)
│   └── admin/           (placeholder, empty)
├── mobile/               (placeholder, empty)
├── docs/
└── README.md
```

## Files Created
- `backend/package.json`
- `backend/.env.example`
- `backend/.gitignore`
- `backend/src/config/db.js`
- `backend/src/models/User.js`
- `backend/src/models/Product.js`
- `backend/src/models/Order.js`
- `backend/src/controllers/authController.js`
- `backend/src/controllers/productController.js`
- `backend/src/routes/authRoutes.js`
- `backend/src/routes/productRoutes.js`
- `backend/src/middleware/authMiddleware.js`
- `backend/src/middleware/errorMiddleware.js`
- `backend/src/utils/generateToken.js`
- `backend/src/app.js`
- `backend/src/server.js`
- `backend/README.md`
- `README.md` (root)

## Files Modified
None — all files newly created in this phase.

## Database Changes
- New MongoDB collections (created implicitly by Mongoose on first write): `users`, `products`, `orders`
- `Order` schema includes forward-looking placeholder fields (`payment.*`, `tracking.*`) so the Payment Integration and Order Tracking phases won't require schema migration

## APIs Added
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/profile` | Logged-in user |
| GET | `/api/products` | Public (supports `?search=`, `?category=`) |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Admin only |
| PUT | `/api/products/:id` | Admin only |
| DELETE | `/api/products/:id` | Admin only |

## Dependencies Added
- `express` ^4.19.2
- `mongoose` ^8.5.0
- `dotenv` ^16.4.5
- `bcryptjs` ^2.4.3
- `jsonwebtoken` ^9.0.2
- `cors` ^2.8.5
- `morgan` ^1.10.0
- `nodemon` ^3.1.4 (dev dependency)

## Testing Performed
- Syntax-checked all 13 backend JS files with `node --check` — all passed
- No live DB/integration test run yet (requires `npm install` + a running MongoDB instance, which happens on your machine). Manual endpoint testing recommended via Postman/cURL once installed.

## Bugs Fixed
None — first implementation, no prior bugs to fix.

## Known Issues
- No "promote user to admin" endpoint yet. To test admin-only product routes, manually set `role: "admin"` on a user document directly in MongoDB. A proper admin-promotion flow is expected in the Admin Panel phase.
- OTP-based login (mentioned in quotation) is not yet implemented — current auth is email + password only. OTP flow is planned for the Authentication phase.

## How to Run
```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev
```
Server starts at `http://localhost:5000`. Full endpoint details and example request bodies are in `backend/README.md`.

## Next Phase
Phase 2.1 — Backend Verification (manual/automated testing of the endpoints built in this phase), then Phase 3 — Authentication (OTP flow, refresh tokens, etc., as needed).

## Completion Checklist
✅ Backend Created
✅ MongoDB Connection Configured
✅ User Model Created
✅ Product Model Created
✅ Order Model Created (with payment & tracking placeholders)
✅ Basic Auth Routes Created (Register/Login/Profile)
✅ Product CRUD Routes Created
✅ JWT Authentication Middleware Added
✅ .env.example Added
✅ README Instructions Added
