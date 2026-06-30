#!/bin/bash
# Manual test script for Phase 3 — Authentication APIs
#
# Run this AFTER starting the backend locally:
#   cd backend && npm install && npm run dev
#
# Usage:
#   chmod +x tests/auth.manual-test.sh
#   ./tests/auth.manual-test.sh
#
# This script exercises every authentication endpoint and prints the response
# for each case, including expected failure cases (validation, wrong password,
# duplicate email, missing token, role check).

BASE_URL="http://localhost:5000/api/auth"
EMAIL="testuser_$(date +%s)@example.com"   # unique email each run
PASSWORD="password123"

echo "============================================="
echo "1. REGISTER — valid data (expect 201 success)"
echo "============================================="
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"phone\":\"9999999999\"}")
echo "$REGISTER_RESPONSE"
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "============================================="
echo "2. REGISTER — duplicate email (expect 400)"
echo "============================================="
curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
echo ""

echo ""
echo "============================================="
echo "3. REGISTER — invalid email format (expect 400 validation error)"
echo "============================================="
curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"not-an-email\",\"password\":\"$PASSWORD\"}"
echo ""

echo ""
echo "============================================="
echo "4. REGISTER — password too short (expect 400 validation error)"
echo "============================================="
curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"shortpass@example.com\",\"password\":\"123\"}"
echo ""

echo ""
echo "============================================="
echo "5. LOGIN — correct credentials (expect 200 success + token)"
echo "============================================="
curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
echo ""

echo ""
echo "============================================="
echo "6. LOGIN — wrong password (expect 401)"
echo "============================================="
curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"wrongpassword\"}"
echo ""

echo ""
echo "============================================="
echo "7. LOGIN — unregistered email (expect 401)"
echo "============================================="
curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"doesnotexist@example.com\",\"password\":\"$PASSWORD\"}"
echo ""

echo ""
echo "============================================="
echo "8. PROFILE — with valid token (expect 200 + user data)"
echo "============================================="
curl -s -X GET "$BASE_URL/profile" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo ""
echo "============================================="
echo "9. PROFILE — no token (expect 401)"
echo "============================================="
curl -s -X GET "$BASE_URL/profile"
echo ""

echo ""
echo "============================================="
echo "10. PROFILE — invalid/garbage token (expect 401)"
echo "============================================="
curl -s -X GET "$BASE_URL/profile" \
  -H "Authorization: Bearer this.is.not.a.valid.token"
echo ""

echo ""
echo "============================================="
echo "11. ADMIN-ONLY ROUTE CHECK — customer trying to create a product (expect 403)"
echo "============================================="
curl -s -X POST "http://localhost:5000/api/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Product\",\"description\":\"Test\",\"category\":\"Test\",\"price\":100}"
echo ""

echo ""
echo "============================================="
echo "Done. Review each response above against the expected result noted in each step."
echo "To test the admin-allowed case for step 11, set role:'admin' on this test user"
echo "in MongoDB directly, log in again to get a fresh token, and re-run that step."
echo "============================================="
