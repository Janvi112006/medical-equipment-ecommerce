#!/bin/bash
# Manual test script for Phase 5 — Cart & Checkout APIs
#
# Run this AFTER starting the backend locally:
#   cd backend && npm install && npm run dev
#
# This script needs an ADMIN user (to create a test product) and will then
# act as a CUSTOMER to add it to cart and check out.
#   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword \
#   CUSTOMER_EMAIL=customer@example.com CUSTOMER_PASSWORD=yourpassword \
#   ./tests/cart-checkout.manual-test.sh

BASE="http://localhost:5000"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password123}"
CUSTOMER_EMAIL="${CUSTOMER_EMAIL:-customer@example.com}"
CUSTOMER_PASSWORD="${CUSTOMER_PASSWORD:-password123}"

echo "============================================="
echo "0a. LOGIN as admin (to create a test product)"
echo "============================================="
ADMIN_LOGIN=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
echo "$ADMIN_LOGIN"
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "============================================="
echo "0b. LOGIN as customer (the account that will use the cart)"
echo "    If this account doesn't exist yet, register it first via"
echo "    auth.manual-test.sh or curl, then re-run this script."
echo "============================================="
CUSTOMER_LOGIN=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"$CUSTOMER_PASSWORD\"}")
echo "$CUSTOMER_LOGIN"
CUSTOMER_TOKEN=$(echo "$CUSTOMER_LOGIN" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ] || [ -z "$CUSTOMER_TOKEN" ]; then
  echo ""
  echo "Missing a token — make sure both accounts exist (admin role + customer role) and re-run."
  exit 1
fi

echo ""
echo "============================================="
echo "0c. CREATE a test product with limited stock (5 units), as admin"
echo "============================================="
PRODUCT_RESPONSE=$(curl -s -X POST "$BASE/api/products" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Cart Test Stethoscope","description":"For checkout testing","category":"Diagnostic Equipment","price":799,"stock":5}')
echo "$PRODUCT_RESPONSE"
PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo ""
echo "============================================="
echo "1. VIEW empty cart (expect 200, items: [])"
echo "============================================="
curl -s -X GET "$BASE/api/cart" -H "Authorization: Bearer $CUSTOMER_TOKEN"
echo ""

echo ""
echo "============================================="
echo "2. ADD to cart — valid quantity (expect 200, item added)"
echo "============================================="
curl -s -X POST "$BASE/api/cart/add" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":2}"
echo ""

echo ""
echo "============================================="
echo "3. ADD to cart — exceeds stock (expect 400)"
echo "============================================="
curl -s -X POST "$BASE/api/cart/add" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":100}"
echo ""

echo ""
echo "============================================="
echo "4. ADD to cart — invalid quantity (expect 400 validation error)"
echo "============================================="
curl -s -X POST "$BASE/api/cart/add" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":0}"
echo ""

echo ""
echo "============================================="
echo "5. VIEW cart — expect 1 item, subtotal/tax/total present"
echo "============================================="
curl -s -X GET "$BASE/api/cart" -H "Authorization: Bearer $CUSTOMER_TOKEN"
echo ""

echo ""
echo "============================================="
echo "6. UPDATE cart quantity to 3 (expect 200)"
echo "============================================="
curl -s -X PUT "$BASE/api/cart/update" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":3}"
echo ""

echo ""
echo "============================================="
echo "7. CREATE delivery address (expect 201)"
echo "============================================="
ADDRESS_RESPONSE=$(curl -s -X POST "$BASE/api/addresses" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" -H "Content-Type: application/json" \
  -d '{"fullName":"Test Customer","phone":"9876543210","addressLine":"123 MG Road","city":"Bengaluru","state":"Karnataka","pincode":"560001"}')
echo "$ADDRESS_RESPONSE"
ADDRESS_ID=$(echo "$ADDRESS_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo ""
echo "============================================="
echo "8. CREATE address — missing field (expect 400 validation error)"
echo "============================================="
curl -s -X POST "$BASE/api/addresses" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" -H "Content-Type: application/json" \
  -d '{"fullName":"Test Customer","phone":"9876543210","city":"Bengaluru","state":"Karnataka","pincode":"560001"}'
echo ""

echo ""
echo "============================================="
echo "9. LIST addresses (expect at least 1)"
echo "============================================="
curl -s -X GET "$BASE/api/addresses" -H "Authorization: Bearer $CUSTOMER_TOKEN"
echo ""

echo ""
echo "============================================="
echo "10. CHECKOUT — no address provided (expect 400)"
echo "============================================="
curl -s -X POST "$BASE/api/checkout" -H "Authorization: Bearer $CUSTOMER_TOKEN" -H "Content-Type: application/json" -d '{}'
echo ""

echo ""
echo "============================================="
echo "11. CHECKOUT — quantity exceeds current stock (expect 400 with stock issue)"
echo "    (Skip if cart quantity 3 is within the 5-unit stock; this is here as"
echo "    a template — raise the cart quantity above stock first to test it.)"
echo "============================================="
echo "(skipped automatically — see note above)"

echo ""
echo "============================================="
echo "12. CHECKOUT — using saved addressId (expect 201, order created, cart cleared)"
echo "============================================="
CHECKOUT_RESPONSE=$(curl -s -X POST "$BASE/api/checkout" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" -H "Content-Type: application/json" \
  -d "{\"addressId\":\"$ADDRESS_ID\"}")
echo "$CHECKOUT_RESPONSE"

echo ""
echo "============================================="
echo "13. VIEW cart after checkout (expect empty cart)"
echo "============================================="
curl -s -X GET "$BASE/api/cart" -H "Authorization: Bearer $CUSTOMER_TOKEN"
echo ""

echo ""
echo "============================================="
echo "14. VERIFY stock decremented (expect stock = 5 - 3 = 2)"
echo "============================================="
curl -s -X GET "$BASE/api/products/$PRODUCT_ID"
echo ""

echo ""
echo "============================================="
echo "15. REMOVE item from cart (add one back first, then remove)"
echo "============================================="
curl -s -X POST "$BASE/api/cart/add" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":1}" > /dev/null
curl -s -X DELETE "$BASE/api/cart/remove/$PRODUCT_ID" -H "Authorization: Bearer $CUSTOMER_TOKEN"
echo ""

echo ""
echo "============================================="
echo "16. CLEANUP — delete the test address and product"
echo "============================================="
curl -s -X DELETE "$BASE/api/addresses/$ADDRESS_ID" -H "Authorization: Bearer $CUSTOMER_TOKEN"
echo ""
curl -s -X DELETE "$BASE/api/products/$PRODUCT_ID" -H "Authorization: Bearer $ADMIN_TOKEN"
echo ""

echo ""
echo "============================================="
echo "Done. Review each response above against the expected result noted in each step."
echo "============================================="
