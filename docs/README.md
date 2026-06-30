# Documentation Index

## Project Name
Medical Equipment E-commerce Platform

## Client Name
Dr. Roopa

## Project Status
🟢 **Complete.** All 12 phases of the originally-scoped project finished. See [Phase-12_Final_Project.md](./Phase-12_Final_Project.md) for the full project summary, feature list, deployment checklist, and conclusion.

## Current Phase
Phase 12 — Final Project Documentation & Release (Completed — this is the final phase of the originally-scoped project)

> **Note on phase order:** the original Phase 1 roadmap planned Website at Phase 5. Per explicit client instruction, the actual build order became: Cart & Checkout (Phase 5), Payment Integration (Phase 6), Order Management & Tracking (Phase 7), Admin Panel (Phase 8), Customer Website (Phase 9), Mobile App (Phase 10), Final Testing/QA/Deployment Prep (Phase 11), Final Project Documentation & Release (Phase 12).

## Completed Phases
- ✅ [Phase 1 — Project Planning](./Phase-01_Project_Planning.md)
- ✅ [Phase 2 — Backend Foundation](./Phase-02_Backend_Foundation.md)
- ✅ [Phase 2.1 — Backend Verification & Cleanup](./Phase-02.1_Backend_Verification.md)
- ✅ [Phase 3 — Authentication](./Phase-03_Authentication.md)
- ✅ [Phase 4 — Product Management](./Phase-04_Product_Management.md)
- ✅ [Phase 5 — Cart & Checkout](./Phase-05_Cart_Checkout.md)
- ✅ [Phase 6 — Payment Integration](./Phase-06_Payment_Integration.md)
- ✅ [Phase 7 — Order Management & Order Tracking](./Phase-07_Order_Management_Tracking.md)
- ✅ [Phase 8 — Admin Panel (Frontend)](./Phase-08_Admin_Panel.md)
- ✅ [Phase 9 — Customer Website (Frontend)](./Phase-09_Customer_Website.md)
- ✅ [Phase 10 — Mobile Application (React Native)](./Phase-10_Mobile_App.md)
- ✅ [Phase 11 — Final Testing, QA & Deployment Preparation](./Phase-11_Testing_QA_Deployment.md)
- ✅ [Phase 12 — Final Project Documentation & Release](./Phase-12_Final_Project.md)

## Pending Phases
None from the originally-scoped roadmap. See [Phase-12_Final_Project.md](./Phase-12_Final_Project.md)'s "Future Enhancements" section for explicitly out-of-scope items (Push Notifications/Firebase, AI Chatbot, CMS, live shipping API, and others) that remain available as future work, plus its Deployment Checklist for the concrete steps to actually go live.

## All Phase Documents
| Phase | Document | Status |
|---|---|---|
| 1 | [Phase-01_Project_Planning.md](./Phase-01_Project_Planning.md) | ✅ Completed |
| 2 | [Phase-02_Backend_Foundation.md](./Phase-02_Backend_Foundation.md) | ✅ Completed |
| 2.1 | [Phase-02.1_Backend_Verification.md](./Phase-02.1_Backend_Verification.md) | ✅ Completed |
| 3 | [Phase-03_Authentication.md](./Phase-03_Authentication.md) | ✅ Completed |
| 4 | [Phase-04_Product_Management.md](./Phase-04_Product_Management.md) | ✅ Completed |
| 5 | [Phase-05_Cart_Checkout.md](./Phase-05_Cart_Checkout.md) | ✅ Completed |
| 6 | [Phase-06_Payment_Integration.md](./Phase-06_Payment_Integration.md) | ✅ Completed |
| 7 | [Phase-07_Order_Management_Tracking.md](./Phase-07_Order_Management_Tracking.md) | ✅ Completed |
| 8 | [Phase-08_Admin_Panel.md](./Phase-08_Admin_Panel.md) | ✅ Completed |
| 9 | [Phase-09_Customer_Website.md](./Phase-09_Customer_Website.md) | ✅ Completed |
| 10 | [Phase-10_Mobile_App.md](./Phase-10_Mobile_App.md) | ✅ Completed |
| 11 | [Phase-11_Testing_QA_Deployment.md](./Phase-11_Testing_QA_Deployment.md) | ✅ Completed |
| 12 (Final) | [Phase-12_Final_Project.md](./Phase-12_Final_Project.md) | ✅ Completed |

## Standalone Reference Documentation
Not tied to a single phase — these describe the project as a whole and stay useful going forward. Created in Phase 11.

| Document | Purpose |
|---|---|
| [Environment_Setup.md](./Environment_Setup.md) | Every environment variable across all four parts, how they connect, quick-start commands |
| [API_Documentation.md](./API_Documentation.md) | Complete reference for every backend endpoint — method, path, access, body, response |
| [Installation_Guide.md](./Installation_Guide.md) | From-zero setup walkthrough for all four parts, plus a common-issues table |

## Final Documentation PDF
[Final_Project_Documentation.pdf](./Final_Project_Documentation.pdf) — a PDF export of [Phase-12_Final_Project.md](./Phase-12_Final_Project.md), generated for offline reading or sharing outside this repository.

## Folder Structure Overview
```
medical-equipment-ecommerce/
├── backend/              # Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── config/        # DB connection, Razorpay client
│   │   ├── models/        # User, Product, Order, Cart, Address
│   │   ├── controllers/   # Auth, Product, Cart, Address, Checkout, Payment, Order
│   │   ├── routes/        # One route file per controller above
│   │   ├── middleware/    # JWT auth, role checks, validators, error handling
│   │   └── utils/         # Token generation, order history, notify/tracking placeholders
│   ├── tests/              # Manual test scripts (one per feature area)
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── website/           # Customer website (Next.js) — built in Phase 9
│   │   └── app/, components/, context/, lib/
│   └── admin/             # Admin Panel (React + Vite) — built in Phase 8
│       └── src/             # api/, context/, components/, pages/, styles/
├── mobile/                 # Mobile app (React Native / Expo) — built in Phase 10
│   └── src/                  # api/, context/, navigation/, components/, screens/, utils/
├── docs/                   # All phase documentation (this folder)
│   ├── README.md            # ← you are here
│   ├── Phase-01_Project_Planning.md ... Phase-11_Testing_QA_Deployment.md
│   ├── Phase-12_Final_Project.md      ← final project summary
│   ├── Environment_Setup.md, API_Documentation.md, Installation_Guide.md
│   └── ...
├── .gitignore               # Root-level safety net (added in Phase 11)
└── README.md                # Root project overview
```

## Tech Stack
| Layer | Technology |
|---|---|
| Mobile App | React Native (Expo) — built in Phase 10 |
| Website | Next.js (React) — built in Phase 9 |
| Admin Panel | React (Vite) — built in Phase 8 |
| Backend | Node.js + Express |
| Database | MongoDB |
| Auth | JWT + bcrypt |
| Payment Gateway | Razorpay |
| Push Notifications | Firebase Cloud Messaging (placeholder in place — see `utils/notifyOrderStatusChange.js`) |
| Order Tracking | Third-party API — provider TBD; placeholder service in place — see `utils/trackingService.js` |
| AI Chatbot | Deferred — placeholder only |
| CMS | Not included (client decision) |

## How to Navigate This Documentation
1. Start here at `docs/README.md` for the current project status at a glance.
2. For setup, the API, or environment variables, go straight to the standalone reference docs above (`Installation_Guide.md`, `API_Documentation.md`, `Environment_Setup.md`) — they're written to be self-contained, not phase-history.
3. Each phase has its own permanent document named `Phase-XX_Name.md` — these are never overwritten, so they form a full project history.
4. Every phase document follows the same structure: Objective, Requirements Implemented, Folder Structure Changes, Files Created/Modified, Database Changes, APIs Added, Dependencies Added, Testing Performed, Bugs Fixed, Known Issues, How to Run, Next Phase, and a completion checklist. (Phase 11 follows a deployment-focused variant: Objective, Testing Summary, Issues Fixed, Deployment Guide, Security Checklist, Final Project Structure, Next Phase.)
5. To see what's been built so far, read the phase docs in order (01 → 02 → ... → 12), or just read [Phase-12_Final_Project.md](./Phase-12_Final_Project.md) for a complete summary of all of them in one document.
6. To see what's available as future work, check Phase 12's "Future Enhancements" section.
7. This index file is the *only* documentation file that gets updated as the project progresses — it always reflects the latest status. If you need historical detail on a specific phase, open that phase's own document; it stays exactly as it was when that phase was completed.
