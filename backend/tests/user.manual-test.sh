#!/bin/bash
# Manual test script for the user management endpoints (added to support
# Phase 8's Admin Panel User Management page).
#
# Run this AFTER starting the backend locally:
#   cd backend && npm install && npm run dev
#
#   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword \
#   CUSTOMER_EMAIL=customer@example.com CUSTOMER_PASSWORD=yourpassword \
#   ./tests/user.manual-test.sh

BASE="http://localhost:5000"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password123}"
CUSTOMER_EMAIL="${CUSTOMER_EMAIL:-customer@example.com}"
CUSTOMER_PASSWORD="${CUSTOMER_PASSWORD:-password123}"

echo "============================================="
echo "0. LOGIN as admin and customer"
echo "============================================="
ADMIN_LOGIN=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
ADMIN_ID=$(echo "$ADMIN_LOGIN" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "$ADMIN_LOGIN"

CUSTOMER_LOGIN=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"$CUSTOMER_PASSWORD\"}")
CUSTOMER_TOKEN=$(echo "$CUSTOMER_LOGIN" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
CUSTOMER_ID=$(echo "$CUSTOMER_LOGIN" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "$CUSTOMER_LOGIN"

if [ -z "$ADMIN_TOKEN" ] || [ -z "$CUSTOMER_TOKEN" ]; then
  echo "Missing a token — make sure both accounts exist and re-run."
  exit 1
fi

echo ""
echo "============================================="
echo "1. LIST users (admin) — expect 200 with pagination"
echo "============================================="
curl -s -X GET "$BASE/api/users?limit=5" -H "Authorization: Bearer $ADMIN_TOKEN"
echo ""

echo ""
echo "============================================="
echo "2. LIST users — as customer (expect 403)"
echo "============================================="
curl -s -X GET "$BASE/api/users" -H "Authorization: Bearer $CUSTOMER_TOKEN"
echo ""

echo ""
echo "============================================="
echo "3. SEARCH users by email fragment (expect at least 1 match)"
echo "============================================="
curl -s -X GET "$BASE/api/users?search=$(echo "$CUSTOMER_EMAIL" | cut -d'@' -f1)" -H "Authorization: Bearer $ADMIN_TOKEN"
echo ""

echo ""
echo "============================================="
echo "4. PROMOTE the customer to admin (expect 200)"
echo "============================================="
curl -s -X PATCH "$BASE/api/users/$CUSTOMER_ID/role" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"role":"admin"}'
echo ""

echo ""
echo "============================================="
echo "5. DEMOTE that user back to customer, to leave test data clean (expect 200)"
echo "============================================="
curl -s -X PATCH "$BASE/api/users/$CUSTOMER_ID/role" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"role":"customer"}'
echo ""

echo ""
echo "============================================="
echo "6. UPDATE role — invalid value (expect 400 validation error)"
echo "============================================="
curl -s -X PATCH "$BASE/api/users/$CUSTOMER_ID/role" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"role":"superuser"}'
echo ""

echo ""
echo "============================================="
echo "7. ADMIN tries to change their OWN role (expect 400, self-lockout prevention)"
echo "============================================="
curl -s -X PATCH "$BASE/api/users/$ADMIN_ID/role" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"role":"customer"}'
echo ""

echo ""
echo "============================================="
echo "8. UPDATE role — as customer, not admin (expect 403)"
echo "============================================="
curl -s -X PATCH "$BASE/api/users/$ADMIN_ID/role" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" -H "Content-Type: application/json" \
  -d '{"role":"customer"}'
echo ""

echo ""
echo "============================================="
echo "Done. Review each response above against the expected result noted in each step."
echo "============================================="
