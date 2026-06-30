# Phase 4 — Product Management

## Phase Number
Phase 4

## Objective
Complete the product management system: full CRUD with input validation, category support, search, filters, sorting, pagination, dedicated inventory/stock management, and confirm admin-only restrictions on write operations. Image support remains URL/path storage only — no file upload in this phase.

## Requirements Implemented
1. Complete Product CRUD — Create, Read, Update, Delete (Create/Read/Delete existed from Phase 2; Update existed too — all now validated and response-standardized)
2. Product categories — `category` field on each product, plus a new `GET /api/products/categories` endpoint returning the distinct list in use (for building filter dropdowns later)
3. Product search — now matches against both `name` and `description` (previously name only)
4. Product filters — added `category`, `minPrice`/`maxPrice`, and `inStock` filters (category filter existed; price/stock filters are new)
5. Inventory/stock management — new `PATCH /api/products/:id/stock` endpoint supporting either an absolute set (`stock`) or a relative adjustment (`adjust`, clamped at 0)
6. Product image support — unchanged: `images` is an array of strings (URL or path), validated to ensure non-empty strings. No file upload — storage of URL/path only, as scoped.
7. Pagination — added `page`/`limit` query params (default 10/page, max 50/page) with a `pagination` object in the response (`total`, `page`, `limit`, `totalPages`)
8. Sorting — added `sort` query param: `price_asc`, `price_desc`, `name_asc`, `name_desc`, `newest` (default)
9. Admin-only restriction — confirmed unchanged: `protect` + `adminOnly` guard Create/Update/Delete/Stock-update; List/Get/Categories remain public
10. Testing — manual test script covering CRUD, validation, filters, sorting, pagination, categories, and stock adjustment (see Testing Performed)

## Files Created
- `backend/src/middleware/productValidators.js` — validation rule chains for create/update/stock endpoints
- `backend/tests/product.manual-test.sh` — manual curl-based test script for all product endpoints

## Files Modified
- `backend/src/controllers/productController.js` — rewritten: added pagination, sorting, expanded filters (price/stock), `getCategories`, `updateStock`; standardized all responses to `{ success, message, data }` (list responses also include `pagination`)
- `backend/src/routes/productRoutes.js` — added `GET /categories` and `PATCH /:id/stock` routes; wired validation middleware into create/update/stock routes; kept `/categories` declared before `/:id` to avoid route collision
- `backend/src/models/Product.js` — added indexes on `category`, `price`, and `createdAt` to keep filtering/sorting fast as the catalog grows (no field/schema changes)
- `backend/package.json` — `express-validator` already present from Phase 3, reused here (no new dependency)
- `backend/README.md` — documented the full new product API surface, query params, response shapes, and the new test script

## Database Changes
- No schema field changes to `Product` — `category`, `price`, `stock`, `images` already existed from Phase 2
- Added 3 indexes to the `products` collection: `{ category: 1 }`, `{ price: 1 }`, `{ createdAt: -1 }` — performance only, no data shape change

## APIs Added
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/products/categories` | Public | Distinct category list |
| PATCH | `/api/products/:id/stock` | Admin only | Set or adjust inventory stock |

**Enhanced (same URL/method, expanded behavior):**
| Method | Endpoint | What changed |
|---|---|---|
| GET | `/api/products` | Added `minPrice`/`maxPrice`/`inStock`/`sort`/`page`/`limit` query params; search now covers description too; response now includes `pagination` |
| POST | `/api/products` | Now validated (`createProductRules`) |
| PUT | `/api/products/:id` | Now validated (`updateProductRules`) |

## Dependencies Added
None new — reused `express-validator` already added in Phase 3.

## Testing Performed
1. **Static verification (run in this sandbox):**
   - Syntax-checked all backend `.js` files with `node --check` — all passed
   - Cross-checked every controller export against what `productRoutes.js` imports — consistent
   - Confirmed route order places `/categories` before `/:id` so it isn't swallowed by the id-matching route
   - Re-ran the project-wide duplicate-folder scan — no duplicates introduced
2. **Live endpoint testing — requires your machine:** Same sandbox limitation as Phases 2.1 and 3 (no network/MongoDB access here). Built `backend/tests/product.manual-test.sh`, which exercises:
   - Login as admin to get a token
   - Create product (valid) → `201`
   - Create product (missing required field) → `400` validation error
   - Create product (negative price) → `400` validation error
   - List products (no filters) → `200` + pagination object
   - List products with `search`, `category`, `minPrice`/`maxPrice`, `inStock`, `sort`, `page`/`limit`
   - Get distinct categories list
   - Get single product by id (valid and invalid id)
   - Update product (price change)
   - Update stock — absolute set and delta adjust
   - Delete product, then delete again (expect `404` second time)
   - Note included for manually testing the `403` non-admin case with a customer token

   **Run it yourself with:**
   ```bash
   cd backend
   npm install
   cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
   npm run dev
   # in a second terminal, after setting one user's role to "admin" in MongoDB:
   chmod +x tests/product.manual-test.sh
   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword ./tests/product.manual-test.sh
   ```

## Bugs Fixed
None — this phase extended a backend that passed Phase 2.1 and Phase 3 verification with no defects.

## Known Issues
- Live endpoint testing could not be executed in this sandbox (no network/MongoDB access) — must be run locally using the provided script. Carried forward from Phase 2.1 and Phase 3.
- No "promote user to admin" endpoint yet — set `role: "admin"` manually in MongoDB. Carried forward from Phase 2.
- No file upload for product images — by design for this phase; only URL/path strings are stored.
- Category is a free-text field on each product, not a separately managed entity (no dedicated Category collection/admin screen). The quotation doesn't call for category management as a distinct module, so this wasn't added — flag if you'd like that as an explicitly approved addition in a later phase.

## How to Run
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev
```
Server starts at `http://localhost:5000`. Full endpoint details, query params, and the manual test script are in `backend/README.md`.

## Next Phase
Phase 5 — Website (customer-facing responsive website, per the quotation and Phase 1 roadmap) — exact scope to be confirmed with you before starting.

## Completion Checklist
✅ Product CRUD complete (Create, Read, Update, Delete)
✅ Product categories supported + distinct categories endpoint added
✅ Product search implemented (name + description)
✅ Product filters added (category, price range, stock availability)
✅ Inventory/stock management endpoint added (set or adjust)
✅ Product image support confirmed (URL/path strings only, validated)
✅ Pagination added to product listing
✅ Sorting added (price, name, newest)
✅ Create/Update/Delete/Stock restricted to Admin role only
✅ Manual test script created covering CRUD, validation, filters, sorting, pagination, and stock
✅ No bugs found; backward compatibility with Phase 2/3 confirmed
