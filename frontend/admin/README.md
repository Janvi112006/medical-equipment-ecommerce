# Admin Panel — Medical Equipment E-commerce Platform

A React (Vite) admin panel for managing products, orders, and users. Connects to the backend built in Phases 2–7.

## What's Included

- Admin login (JWT-based, backend-verified — only accounts with `role: "admin"` can get in)
- Dashboard: product/order/user counts, recent orders
- Product Management: search, category filter, pagination, create/edit/delete, stock updates
- Order Management: list, filter by status, full order details, status updates, tracking, timeline
- User Management: list, search, promote/demote role
- Sidebar + top navigation, responsive down to mobile (sidebar becomes a slide-in drawer)
- Loading states, error banners with retry, empty states across every page
- All admin routes protected — redirects to `/login` if not authenticated as an admin

## Folder Structure

```
frontend/admin/
├── src/
│   ├── api/
│   │   └── axiosClient.js       # Configured axios instance, auth header, 401 handling
│   ├── context/
│   │   └── AuthContext.jsx      # Login/logout/session state
│   ├── components/               # Sidebar, TopNav, Layout, modals, shared UI states
│   ├── pages/                    # LoginPage, DashboardPage, ProductsPage, OrdersPage, UsersPage
│   ├── styles/
│   │   └── global.css            # Design tokens + all component styles
│   ├── App.jsx                   # Route definitions
│   └── main.jsx                  # Entry point
├── index.html
├── vite.config.js
├── package.json
└── .env.example
```

## Setup Instructions

### 1. Make sure the backend is running first
This admin panel needs the backend from Phases 2–7 running and reachable (see `backend/README.md`):
```bash
cd ../../backend
npm install
npm run dev
```

### 2. Install and run the admin panel
```bash
cd frontend/admin
npm install
cp .env.example .env   # defaults to http://localhost:5000/api, change if your backend runs elsewhere
npm run dev
```
Opens at `http://localhost:5173` (Vite's default).

### 3. Log in
You need an existing user with `role: "admin"` in MongoDB. If you don't have one yet, register a normal account via the backend's `/api/auth/register`, then set `role: "admin"` on that user directly in MongoDB once (see `backend/README.md`). After that, you can promote further admins from the Users page itself.

## How Authentication Works

1. `POST /api/auth/login` is called with email/password.
2. If the returned `role` is **not** `"admin"`, the panel refuses to log the user in — even with correct credentials — and shows "This account does not have admin access." No token is stored in that case.
3. On success, the JWT and user info are stored in `localStorage` (`admin_token`, `admin_user`) so the session survives a page refresh.
4. Every API request automatically attaches `Authorization: Bearer <token>`.
5. If any request comes back `401` (expired/invalid token), the panel automatically logs out and redirects to `/login`.
6. All routes under `/` are wrapped in `ProtectedRoute`, which redirects to `/login` if there's no valid admin session.

## Manual Testing Checklist

This is a browser app, so testing it means actually opening it in a browser — there's no curl-based equivalent. Walk through this checklist after starting both the backend and this frontend:

**Login**
- [ ] Logging in with a non-admin (customer) account is rejected with a clear message, and does not grant access
- [ ] Logging in with wrong credentials shows an error
- [ ] Logging in with a real admin account succeeds and lands on the Dashboard
- [ ] Refreshing the page keeps you logged in (session persists)
- [ ] Visiting `/products`, `/orders`, or `/users` directly while logged out redirects to `/login`

**Dashboard**
- [ ] Product/Order/User counts match what's actually in the database
- [ ] Recent orders table shows the latest orders with correct status badges
- [ ] Temporarily stopping the backend and reloading shows an error banner with a working "Try again" button

**Products**
- [ ] Search and category filter both narrow the list correctly
- [ ] "Add product" creates a real product (verify it appears in the list and via the backend API)
- [ ] Submitting the form with a missing field shows the backend's validation message inline
- [ ] "Edit" pre-fills the form correctly and saves changes
- [ ] "Stock" updates the stock value and reflects immediately in the table
- [ ] "Delete" asks for confirmation, then removes the product
- [ ] Pagination controls work when there are more than 10 products

**Orders**
- [ ] Status filter narrows the list correctly
- [ ] Clicking a row opens the details modal with correct items/totals/address
- [ ] Updating status moves it through the lifecycle and the timeline grows with each change
- [ ] Setting tracking info saves and shows a tracking status (mocked, per the placeholder service)
- [ ] Pagination controls work when there are more than 10 orders

**Users**
- [ ] Search by name/email narrows the list
- [ ] "Make admin" / "Make customer" prompts for confirmation, then updates the role and badge
- [ ] Your own row shows "(you)" instead of a role-change button, and the backend also blocks self-changes if attempted directly via the API

**Responsive layout**
- [ ] Resize the browser below ~880px width: sidebar collapses, hamburger button appears in the top bar, and toggling it slides the sidebar in/out with a backdrop
- [ ] Tables scroll horizontally on narrow screens instead of breaking the layout

## Known Limitations
See `docs/Phase-08_Admin_Panel.md` for the full list — most notably, there's no dashboard revenue figure yet (would need a dedicated reporting endpoint), and product images are URLs/paths only (no file upload, matching the backend's Phase 4 design).
