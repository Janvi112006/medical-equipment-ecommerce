# Environment Setup Guide

A single reference for every environment variable used across the project. Each part also has its own `.env.example` (or `app.json`, for mobile) — this document explains what each variable does and how the four parts connect to each other.

## How the Parts Connect

```
Backend (port 5000)  <──────┐
                              ├── frontend/admin   (Vite, port 5173)
                              ├── frontend/website  (Next.js, port 3000)
                              └── mobile            (Expo, device/emulator)
```

All three frontends are just **API clients** — they hold no database connection of their own. Every one of them needs to know one thing: where the backend is. Everything else (Razorpay keys, JWT secret, Mongo URI) lives only in the backend's `.env`.

---

## Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Required? | Description |
|---|---|---|
| `PORT` | No (defaults to 5000) | Port the Express server listens on |
| `NODE_ENV` | No | `development` or `production` |
| `CORS_ORIGIN` | No (allows all origins if unset) | Comma-separated list of allowed frontend origins, e.g. `https://medequip.com,https://admin.medequip.com`. Leave blank in development; **always set this in production** — see the Security Checklist in `Phase-11_Testing_QA_Deployment.md` |
| `MONGO_URI` | **Yes** | MongoDB connection string. Local: `mongodb://localhost:27017/medical_equipment_db`. Atlas: a connection string from your cluster |
| `JWT_SECRET` | **Yes** | Any long, random string. Used to sign/verify login tokens. **Must be kept secret** — see Security Checklist |
| `JWT_EXPIRES_IN` | No (defaults to `7d`) | How long a login token stays valid |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | **Yes, for payments to work** | From your Razorpay dashboard. Use **TEST mode** keys during development |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` | No | Placeholder only — not implemented. Leave blank |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | No | Placeholder only — not implemented. Leave blank |
| `TRACKING_API_BASE_URL` / `TRACKING_API_KEY` | No | Placeholder only — no real courier provider is wired in yet. Leave blank |
| `TAX_RATE` | No (defaults to `0`) | Decimal tax rate applied at checkout, e.g. `0.18` for 18% GST. Leave at `0` until a real rate is confirmed |
| `CHATBOT_API_KEY` | No | Placeholder only — AI chatbot was deferred. Leave blank |

## Admin Panel (`frontend/admin/.env.local`)

Copy `frontend/admin/.env.example`:

| Variable | Required? | Description |
|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | Backend API base URL, e.g. `http://localhost:5000/api` in development |

Vite only exposes env vars prefixed `VITE_` to the browser — this is a Vite requirement, not a choice made for this project.

## Customer Website (`frontend/website/.env.local`)

Copy `frontend/website/.env.example`:

| Variable | Required? | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | **Yes** | Backend API base URL. Must be prefixed `NEXT_PUBLIC_` — Next.js only exposes `NEXT_PUBLIC_`-prefixed vars to client components (the browser calls the API directly from Cart/Checkout/etc.) |

## Mobile App (`mobile/app.json`)

Mobile doesn't use a `.env` file — Expo apps read config from `app.json` (or `app.config.js`) at build time, exposed via `expo-constants`. Edit `mobile/app.json`:

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://localhost:5000/api"
    }
  }
}
```

| Setting | Description |
|---|---|
| `expo.extra.apiBaseUrl` | Backend API base URL. **Important:** `localhost` only resolves correctly from a device/emulator in specific cases — see below |

**Choosing the right `apiBaseUrl` for mobile:**

- iOS Simulator on the same machine as the backend → `http://localhost:5000/api` works
- Android Emulator → use `http://10.0.2.2:5000/api` instead (the emulator's `localhost` refers to itself, not your computer)
- A physical phone (via Expo Go) → use your computer's LAN IP, e.g. `http://192.168.1.50:5000/api` (phone and computer must be on the same Wi-Fi network)

---

## Quick Start: All Four Parts Together

```bash
# 1. Backend
cd backend
cp .env.example .env        # fill in MONGO_URI, JWT_SECRET, RAZORPAY_KEY_ID/SECRET
npm install
npm run dev                  # http://localhost:5000

# 2. Admin Panel (new terminal)
cd frontend/admin
cp .env.example .env.local   # defaults already point at http://localhost:5000/api
npm install
npm run dev                  # http://localhost:5173

# 3. Customer Website (new terminal)
cd frontend/website
cp .env.example .env.local
npm install
npm run dev                  # http://localhost:3000

# 4. Mobile App (new terminal)
cd mobile
# edit app.json -> expo.extra.apiBaseUrl if testing on a device/Android emulator
npm install
npm start                     # scan the QR code in Expo Go, or press a/i for an emulator
```

## Getting Real Razorpay Test Keys
1. Create a free account at [razorpay.com](https://razorpay.com)
2. Switch to **Test Mode** in the dashboard (top-left toggle)
3. Go to Settings → API Keys → Generate Test Key
4. Copy the Key ID and Key Secret into `backend/.env`
5. Use test card `4111 1111 1111 1111` (any future expiry date, any 3-digit CVV) to simulate a payment

## Getting a MongoDB Connection String
- **Local install:** `mongodb://localhost:27017/medical_equipment_db` (requires `mongod` running locally)
- **MongoDB Atlas (free tier, no local install needed):** create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), create a database user, and copy the connection string from "Connect" → "Drivers"
