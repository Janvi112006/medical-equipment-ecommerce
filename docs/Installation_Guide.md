# Installation & Setup Guide

A from-scratch guide to getting the entire platform running locally. If you only need the environment variable reference, see `Environment_Setup.md`. If you need API details, see `API_Documentation.md`.

## Prerequisites

| Tool | Needed for | Notes |
|---|---|---|
| Node.js 18+ | All four parts | Check with `node -v` |
| npm | All four parts | Comes with Node.js |
| MongoDB | Backend | Local install, or a free MongoDB Atlas cluster (no install needed) |
| Expo Go app | Mobile (optional) | Free app on the App Store / Google Play, for testing on a physical phone without a full native build |
| A Razorpay account | Payments | Free to create; use Test Mode keys for development |

You do **not** need Android Studio or Xcode to develop the mobile app — Expo's managed workflow runs on a physical device via the Expo Go app, or in a basic emulator if you have one installed.

## Step 1 — Get the Code
Unzip the project. You should see:
```
medical-equipment-ecommerce/
├── backend/
├── frontend/
│   ├── website/
│   └── admin/
├── mobile/
└── docs/
```

## Step 2 — Backend (do this first — everything else depends on it)

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in at minimum:
- `MONGO_URI` — see `Environment_Setup.md` for how to get one
- `JWT_SECRET` — any long random string
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Test Mode keys from your Razorpay dashboard (needed for the payment flow to work; everything else runs fine without them, you'll just see a clear error if you try to pay)

```bash
npm run dev
```

You should see:
```
MongoDB connected: <your-host>
Server running on http://localhost:5000
```

**Create your first admin account:** register normally through any frontend (or `POST /api/auth/register`), then manually set that user's `role` to `"admin"` in MongoDB (using MongoDB Compass, `mongosh`, or your Atlas dashboard). After that one manual step, you can promote further users to admin through the Admin Panel itself or `PATCH /api/users/:id/role`.

**Verify it's working:** run the manual test scripts in `backend/tests/` (see `backend/README.md` for each script's usage) or just visit `http://localhost:5000` in a browser — you should see `{"message":"Medical Equipment E-commerce API is running"}`.

## Step 3 — Admin Panel

```bash
cd frontend/admin
npm install
cp .env.example .env.local
npm run dev
```
Open `http://localhost:5173`. Log in with the admin account you created in Step 2.

## Step 4 — Customer Website

```bash
cd frontend/website
npm install
cp .env.example .env.local
npm run dev
```
Open `http://localhost:3000`. Register a new (non-admin) account to shop as a customer.

## Step 5 — Mobile App

```bash
cd mobile
npm install
npm start
```
This opens Expo's developer tools in your terminal/browser.
- **On a physical phone:** install the Expo Go app, then scan the QR code shown in the terminal
- **On an emulator:** press `a` (Android) or `i` (iOS), if you have one set up

If testing on a physical device or an Android emulator, edit `mobile/app.json` → `expo.extra.apiBaseUrl` first — see `Environment_Setup.md` for which address to use.

## Step 6 — Try the Full Flow
1. In the website or mobile app, browse products, add one to your cart
2. Go to checkout, enter a delivery address, place the order
3. Click "Pay now" — this opens the real Razorpay checkout (test mode)
4. Use test card `4111 1111 1111 1111`, any future expiry, any CVV
5. In the Admin Panel, log in as your admin account and check the Orders page — you should see the new order, with payment marked `paid`
6. Update the order's status through its lifecycle (Confirmed → Shipped → Out for Delivery → Delivered) and assign tracking info — both should be visible back in the website/mobile order details

## Common Issues

| Problem | Likely cause |
|---|---|
| Backend won't start, `MongoDB connection failed` | `MONGO_URI` is wrong, or local MongoDB isn't running |
| Frontend loads but shows network errors | Backend isn't running, or the frontend's API base URL doesn't match where the backend is actually listening |
| Mobile app can't reach the backend | Using `localhost` from a physical device or Android emulator — see the networking notes in `Environment_Setup.md` |
| "This account does not have admin access" in Admin Panel | The account you're logging in with has `role: "customer"` — promote it first (see Step 2) |
| Razorpay create-order fails | `RAZORPAY_KEY_ID`/`SECRET` in the backend's `.env` are still placeholders — get real Test Mode keys |
| `npm install` fails with a registry/network error | No internet access, or behind a restrictive proxy/firewall |

## Where to Go Next
- `API_Documentation.md` — every endpoint, request/response shapes
- `docs/Phase-11_Testing_QA_Deployment.md` — production deployment instructions, security checklist, architecture diagram
- Each part's own `README.md` (`backend/README.md`, `frontend/admin/README.md`, `frontend/website/README.md`, `mobile/README.md`) — manual testing checklists and part-specific details
