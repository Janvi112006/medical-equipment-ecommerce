#!/bin/bash
# Manual test script for Phase 7 — Order Management & Tracking APIs
#
# Run this AFTER starting the backend locally:
#   cd backend && npm install && npm run dev
#
# Needs an admin account and a customer account.
#   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword \
#   CUSTOMER_EMAIL=customer@example.com CUSTOMER_PASSWORD=yourpassword \
#   ./tests/order.manual-test.sh

BASE="http://localhost:5000"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password123}"
CUSTOMER_EMAIL="${CUSTOMER_EMAIL:-customer@example.com}"
CUSTOMER_PASSWORD="${CUSTOMER_PASSWORD:-password123}"

echo "============================================="
echo "0a. LOGIN as admin / customer"
echo "============================================="
ADMIN_TOKEN=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
CUSTOMER_TOKEN=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"$CUSTOMER_PASSWORD\"}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ] || [ -z "$CUSTOMER_TOKEN" ]; then
  echo "Missing a token — make sure both accounts exist (admin role + customer role) and re-run."
  exit 1
fi
echo "Got both tokens."

echo ""
echo "============================================="
echo "0b. CREATE product, ADD to cart, CHECKOUT -> get an order (status: pending)"
echo "============================================="
PRODUCT_ID=$(curl -s -X POST "$BASE/api/products" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Order Test Glucometer","description":"For order testing","category":"Diagnostic Equipment","price":999,"stock":10}' \
  | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

curl -s -X POST "$BASE/api/cart/add" -H "Authorization: Bearer $CUSTOMER_TOKEN" -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":1}" > /dev/null

ORDER_RESPONSE=$(curl -s -X POST "$BASE/api/checkout" -H "Authorization: Bearer $CUSTOMER_TOKEN" -H "Content-Type: application/json" \
  -d '{"shippingAddress":{"fullName":"Test Customer","phone":"9876543210","addressLine":"123 MG Road","city":"Bengaluru","state":"Karnataka","pincode":"560001"}}')
echo "$ORDER_RESPONSE"
ORDER_ID=$(echo "$ORDER_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$ORDER_ID" ]; then
  echo "Could not create an order via checkout — stopping here."
  exit 1
fi

echo ""
echo "============================================="
echo "1. GET MY ORDERS (customer) — expect at least 1 order, with pagination"
echo "============================================="
curl -s -X GET "$BASE/api/orders/my" -H "Authorization: Bearer $CUSTOMER_TOKEN"
echo ""

echo ""
echo "============================================="
echo "2. GET ORDER DETAILS (customer, owner) — expect 200 + history with 1 entry"
echo "============================================="
curl -s -X GET "$BASE/api/orders/$ORDER_ID" -H "Authorization: Bearer $CUSTOMER_TOKEN"
echo ""

echo ""
echo "============================================="
echo "3. GET ORDER DETAILS — as a DIFFERENT customer would be blocked (expect 403)."
echo "   Simulated here using the admin token's OWN orders list instead — skip if"
echo "   you don't have a second customer account. This step just documents the rule."
echo "============================================="
echo "(see Known Issues in the phase doc — not run automatically, needs a 2nd customer)"

echo ""
echo "============================================="
echo "4. ADMIN — GET ALL ORDERS (expect 200, includes this order)"
echo "============================================="
curl -s -X GET "$BASE/api/orders?limit=5" -H "Authorization: Bearer $ADMIN_TOKEN"
echo ""

echo ""
echo "============================================="
echo "5. ADMIN — GET ALL ORDERS as a customer (expect 403)"
echo "============================================="
curl -s -X GET "$BASE/api/orders" -H "Authorization: Bearer $CUSTOMER_TOKEN"
echo ""

echo ""
echo "============================================="
echo "6. ADMIN — UPDATE order status to 'confirmed' (expect 200, history grows to 2 entries)"
echo "============================================="
curl -s -X PATCH "$BASE/api/orders/$ORDER_ID/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"confirmed","note":"Manually confirmed for testing"}'
echo ""

echo ""
echo "============================================="
echo "7. UPDATE status — invalid value (expect 400 validation error)"
echo "============================================="
curl -s -X PATCH "$BASE/api/orders/$ORDER_ID/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"not_a_real_status"}'
echo ""

echo ""
echo "============================================="
echo "8. UPDATE status — as customer, not admin (expect 403)"
echo "============================================="
curl -s -X PATCH "$BASE/api/orders/$ORDER_ID/status" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"shipped"}'
echo ""

echo ""
echo "============================================="
echo "9. ADMIN — UPDATE status through the lifecycle: shipped -> out_for_delivery -> delivered"
echo "============================================="
curl -s -X PATCH "$BASE/api/orders/$ORDER_ID/status" -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"status":"shipped"}'
echo ""
curl -s -X PATCH "$BASE/api/orders/$ORDER_ID/status" -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"status":"out_for_delivery"}'
echo ""
curl -s -X PATCH "$BASE/api/orders/$ORDER_ID/status" -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"status":"delivered"}'
echo ""

echo ""
echo "============================================="
echo "10. ADMIN — SET tracking info (expect 200, tracking.status set via placeholder service)"
echo "============================================="
curl -s -X PATCH "$BASE/api/orders/$ORDER_ID/tracking" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"provider":"Shiprocket","trackingId":"SR123456789"}'
echo ""

echo ""
echo "============================================="
echo "11. UPDATE tracking — missing trackingId (expect 400 validation error)"
echo "============================================="
curl -s -X PATCH "$BASE/api/orders/$ORDER_ID/tracking" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"provider":"Shiprocket"}'
echo ""

echo ""
echo "============================================="
echo "12. GET TRACKING (customer, owner) — expect 200 with provider/trackingId/status"
echo "============================================="
curl -s -X GET "$BASE/api/orders/$ORDER_ID/tracking" -H "Authorization: Bearer $CUSTOMER_TOKEN"
echo ""

echo ""
echo "============================================="
echo "13. GET FULL ORDER again — expect history array now has multiple entries"
echo "    (order placed, payment/confirm if applicable, each status change, tracking added)"
echo "============================================="
curl -s -X GET "$BASE/api/orders/$ORDER_ID" -H "Authorization: Bearer $CUSTOMER_TOKEN"
echo ""

echo ""
echo "============================================="
echo "14. CLEANUP — delete the test product"
echo "============================================="
curl -s -X DELETE "$BASE/api/products/$PRODUCT_ID" -H "Authorization: Bearer $ADMIN_TOKEN"
echo ""

echo ""
echo "============================================="
echo "Done. Review each response above against the expected result noted in each step."
echo "Also check your server's terminal output — each status/tracking change should have"
echo "printed a '[notify-placeholder]' log line (see utils/notifyOrderStatusChange.js)."
echo "============================================="
