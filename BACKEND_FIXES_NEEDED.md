# Backend Fixes Required

## Current Issues

Frontend is ready but backend endpoints are failing:

### 1. Payment Endpoint - HTTP 500 Error
**Endpoint:** `POST /api/payment/create-order`
**Status:** Internal Server Error (500)
**Frontend expects:**
```json
{
  "data": {
    "orderId": "order_xxxxx",      // Razorpay Order ID
    "amount": 50000,                // Amount in paise (₹500 = 50000 paise)
    "currency": "INR",
    "key": "rzp_live_xxxxx",        // Your Razorpay API Key
    "transactionId": "txn_xxxxx"    // Database transaction ID
  }
}
```

**What to check:**
- [ ] Razorpay API key is properly configured
- [ ] Order creation logic is implemented
- [ ] Amount validation (should be converted to paise)
- [ ] Error handling and logging

**Frontend sends:**
```json
{
  "amount": 500,           // Amount in rupees
  "ngoId": null,           // or NGO ID if selected
  "isAnonymous": false,
  "notes": "Optional message"
}
```

---

### 2. Payment Verification Endpoint
**Endpoint:** `POST /api/payment/verify`
**Status:** Not reached yet (blocked by create-order error)
**Frontend expects:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "_id": "txn_xxxxx"
    },
    "pointsEarned": 50,
    "levelUp": false,
    "newLevel": null
  }
}
```

**Frontend sends:**
```json
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_xxxxx",
  "ngoId": null,
  "isAnonymous": false,
  "notes": "message",
  "transactionId": "txn_xxxxx"
}
```

---

### 3. NGO List Endpoint - HTTP 429 (Rate Limited)
**Endpoint:** `GET /api/ngos`
**Status:** Too Many Requests (429)
**Frontend expects:**
```json
{
  "data": [
    {
      "_id": "ngo_xxxxx",
      "name": "NGO Name"
    },
    ...
  ]
}
```

**Issue:** Rate limiting is active - either disable temporarily or increase limit

---

### 4. Activity Endpoint - HTTP 404 (Not Found)
**Endpoint:** `GET /api/users/activity`
**Status:** Not Found (404)
**Frontend expects:**
```json
{
  "data": {
    "activities": [
      {
        "_id": "activity_xxxxx",
        "type": "money_donation",
        "description": "Donated ₹500...",
        "createdAt": "2025-11-30T..."
      }
    ]
  }
}
```

---

## Priority Fixes

1. **HIGH** - Fix `POST /api/payment/create-order` (HTTP 500)
   - Debug why it's throwing error
   - Check Razorpay configuration
   - Ensure proper response format

2. **HIGH** - Disable rate limiting or increase limits
   - NGOs endpoint returning 429
   - May affect other endpoints too

3. **MEDIUM** - Implement `POST /api/payment/verify`
   - Payment signature verification
   - Transaction creation
   - Points calculation

4. **LOW** - Implement `GET /api/users/activity`
   - For activity log display
   - Can work around for now

---

## Testing Checklist

- [ ] Backend server running on http://localhost:5000
- [ ] Environment variables set (Razorpay API key, etc.)
- [ ] Database connection working
- [ ] Rate limiting disabled or configured properly
- [ ] CORS enabled for frontend

---

## Frontend Status

✅ All frontend code is working correctly:
- Razorpay SDK loads successfully
- Form validation works
- Error handling in place
- Just waiting for backend endpoints to work

The issue is **100% backend-side**. Frontend is ready to go!
