#!/bin/bash
# Manual test script for Phase 4 — Product Management APIs
#
# Run this AFTER starting the backend locally:
#   cd backend && npm install && npm run dev
#
# This script needs an ADMIN user to test admin-only routes. Steps:
#   1. Register a normal user via /api/auth/register (or run auth.manual-test.sh first)
#   2. In MongoDB, set that user's role to "admin"
#   3. Put that user's email/password below, or pass them as env vars:
#        ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword ./tests/product.manual-test.sh

BASE_URL="http://localhost:5000/api/products"
AUTH_URL="http://localhost:5000/api/auth"

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password123}"

echo "============================================="
echo "0. LOGIN as admin to get a token"
echo "============================================="
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
echo "$LOGIN_RESPONSE"
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo ""
  echo "Could not get a token. Make sure ADMIN_EMAIL/ADMIN_PASSWORD point to a"
  echo "real user with role: 'admin' in your database, then re-run this script."
  exit 1
fi

echo ""
echo "============================================="
echo "1. CREATE product — valid data, as admin (expect 201)"
echo "============================================="
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Digital BP Monitor","description":"Automatic blood pressure monitor","category":"Diagnostic Equipment","price":1499,"stock":50,"images":["https://example.com/bp-monitor.jpg"]}')
echo "$CREATE_RESPONSE"
PRODUCT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo ""
echo "============================================="
echo "2. CREATE product — missing required field (expect 400 validation error)"
echo "============================================="
curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Missing a name","category":"Test","price":10}'
echo ""

echo ""
echo "============================================="
echo "3. CREATE product — negative price (expect 400 validation error)"
echo "============================================="
curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bad Product","description":"Test","category":"Test","price":-50}'
echo ""

echo ""
echo "============================================="
echo "4. LIST products — no filters (expect 200 + pagination object)"
echo "============================================="
curl -s -X GET "$BASE_URL"
echo ""

echo ""
echo "============================================="
echo "5. LIST products — search (expect matches in name/description)"
echo "============================================="
curl -s -X GET "$BASE_URL?search=monitor"
echo ""

echo ""
echo "============================================="
echo "6. LIST products — category filter"
echo "============================================="
curl -s -X GET "$BASE_URL?category=Diagnostic%20Equipment"
echo ""

echo ""
echo "============================================="
echo "7. LIST products — price range filter (minPrice/maxPrice)"
echo "============================================="
curl -s -X GET "$BASE_URL?minPrice=100&maxPrice=2000"
echo ""

echo ""
echo "============================================="
echo "8. LIST products — inStock filter"
echo "============================================="
curl -s -X GET "$BASE_URL?inStock=true"
echo ""

echo ""
echo "============================================="
echo "9. LIST products — sorting (price ascending)"
echo "============================================="
curl -s -X GET "$BASE_URL?sort=price_asc"
echo ""

echo ""
echo "============================================="
echo "10. LIST products — pagination (page 1, limit 2)"
echo "============================================="
curl -s -X GET "$BASE_URL?page=1&limit=2"
echo ""

echo ""
echo "============================================="
echo "11. GET distinct categories list"
echo "============================================="
curl -s -X GET "$BASE_URL/categories"
echo ""

echo ""
echo "============================================="
echo "12. GET single product by id (expect 200)"
echo "============================================="
curl -s -X GET "$BASE_URL/$PRODUCT_ID"
echo ""

echo ""
echo "============================================="
echo "13. GET single product — bad id (expect 404 or error)"
echo "============================================="
curl -s -X GET "$BASE_URL/000000000000000000000000"
echo ""

echo ""
echo "============================================="
echo "14. UPDATE product — change price and stock (expect 200)"
echo "============================================="
curl -s -X PUT "$BASE_URL/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price":1599}'
echo ""

echo ""
echo "============================================="
echo "15. STOCK — set absolute stock value (expect 200, stock = 100)"
echo "============================================="
curl -s -X PATCH "$BASE_URL/$PRODUCT_ID/stock" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stock":100}'
echo ""

echo ""
echo "============================================="
echo "16. STOCK — adjust by delta (expect 200, stock = 95)"
echo "============================================="
curl -s -X PATCH "$BASE_URL/$PRODUCT_ID/stock" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"adjust":-5}'
echo ""

echo ""
echo "============================================="
echo "17. CREATE product — as non-admin (expect 403). Needs a customer token."
echo "    Skipping automatically — run manually with a customer account's token:"
echo "    curl -X POST $BASE_URL -H \"Authorization: Bearer <customer_token>\" ..."
echo "============================================="

echo ""
echo "============================================="
echo "18. DELETE product (expect 200)"
echo "============================================="
curl -s -X DELETE "$BASE_URL/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo ""
echo "============================================="
echo "19. DELETE product — already deleted (expect 404)"
echo "============================================="
curl -s -X DELETE "$BASE_URL/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo ""
echo "============================================="
echo "Done. Review each response above against the expected result noted in each step."
echo "============================================="
