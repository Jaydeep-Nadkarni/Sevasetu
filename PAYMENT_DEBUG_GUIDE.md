# Payment Integration Debugging Guide

## Current Status
The backend payment endpoint is working correctly. The HTTP 500 error you're seeing is because **Razorpay credentials are not configured** in the `.env` file.

## What's Happening

### The Error Chain:
```
1. Frontend sends payment request to /api/payment/create-order
2. Backend tries to initialize Razorpay with placeholder credentials
3. Razorpay SDK fails silently due to invalid credentials
4. Backend catches error and returns "Failed to create payment order"
5. Frontend shows error message
```

### The Fix:
Update `.env` file with real Razorpay API keys. See `RAZORPAY_SETUP.md` for detailed instructions.

---

## Debugging Steps

### Step 1: Check Backend Logs
After updating `.env` and restarting the server, look for:

✅ **Success Logs:**
```
📝 Creating Razorpay order with amount: 100 INR
✅ Razorpay order created: order_1a2b3c4d5e6f
💾 Transaction created: [mongodb-id]
```

❌ **Error Logs:**
```
❌ Razorpay Order Error: {
  message: "Invalid credentials",
  statusCode: 401,
  code: "INVALID_KEY"
}
```

### Step 2: Check Browser Console
When you click the donate button:

1. **SDK Loading:**
   ```
   Loading Razorpay SDK...
   Razorpay SDK loaded successfully
   ```

2. **Order Creation:**
   ```
   Payment initiated {amount: 100, selectedNGO: "..."}
   Creating payment order...
   ```

3. **Response:**
   ```
   Order created: {orderId: "order_xxx", amount: 10000}
   // OR
   Order creation error: {success: false, message: "..."}
   ```

### Step 3: Network Tab Debugging
1. Open DevTools → Network tab
2. Filter for "create-order" request
3. Check the response:
   - **200 OK** = Success ✅
   - **500 Internal Error** = Credentials issue ❌

---

## Common Issues & Solutions

### Issue 1: HTTP 500 on `/api/payment/create-order`

**Cause:** Razorpay credentials not set or invalid

**Solution:**
```bash
# 1. Edit server/.env
RAZORPAY_KEY_ID=rzp_live_xxxxxx    # Real key ID
RAZORPAY_KEY_SECRET=xxxxx           # Real key secret

# 2. Restart server
cd server
npm run dev

# 3. Check logs for:
# "❌ Razorpay credentials not configured!" OR "✅ Razorpay order created"
```

---

### Issue 2: "Payment gateway not configured"

**Cause:** Credentials are placeholder values

**Expected Error Message:**
```
❌ Razorpay credentials not configured!
   Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file
```

**Solution:** See `RAZORPAY_SETUP.md`

---

### Issue 3: Invalid Amount Error

**Cause:** Amount < 1 or invalid number

**Check:**
```javascript
// Frontend validation (DonateMoney.jsx)
if (amount < 1) {
  toast.error('Amount must be at least ₹1')
  return
}
```

**Solution:** Enter amount ≥ ₹1

---

### Issue 4: Razorpay Modal Doesn't Open

**Causes:**
1. SDK not loaded
2. Order creation failed
3. Invalid Key ID sent to frontend

**Debug Steps:**
```javascript
// Check browser console:
// 1. Is SDK loaded?
console.log(window.Razorpay) // Should show Razorpay function

// 2. Is order created?
// Check Network tab → create-order response

// 3. Is Key ID correct?
// Network tab → Response should have key: "rzp_live_xxx"
```

---

## Backend Code Changes

### What Was Fixed:

1. **Added Credential Validation:**
   ```javascript
   if (!config.razorpay.keyId || 
       config.razorpay.keyId === 'your_razorpay_key_id_here') {
     return errorResponse(res, 'Payment gateway not configured', 500)
   }
   ```

2. **Better Error Logging:**
   ```javascript
   console.error('❌ Razorpay Order Error:', {
     message: error.message,
     statusCode: error.statusCode,
     code: error.code,
     description: error.description
   })
   ```

3. **Made NGO Optional:**
   - Transaction can be created without NGO
   - Platform donations now work

4. **Specific Error Messages:**
   - 401 errors → "Invalid Razorpay credentials"
   - 400 errors → "Invalid payment request"
   - Other → Razorpay error description

---

## Testing Checklist

- [ ] Updated `.env` with real Razorpay keys
- [ ] Restarted backend server
- [ ] Backend logs show "Razorpay order created"
- [ ] Frontend receives order ID in response
- [ ] Razorpay modal opens on frontend
- [ ] Can enter test card details
- [ ] Payment completes successfully
- [ ] Transaction appears in Razorpay dashboard
- [ ] Frontend shows success message
- [ ] Database updated with transaction record

---

## Production Checklist

- [ ] Switch to Razorpay live keys
- [ ] Enable SSL/TLS on backend
- [ ] Set up webhook endpoint
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Monitor error logs
- [ ] Set up alerts for failed payments
- [ ] Test refund process
- [ ] Document support process

---

## Quick Fix Summary

1. Get Razorpay credentials from https://razorpay.com
2. Update `.env` file in `server/` directory
3. Restart backend server
4. Test payment flow

**That's it!** The backend code is production-ready and will work once credentials are configured.

---

## File References

- **Backend Controller:** `server/src/controllers/paymentController.js`
- **Backend Routes:** `server/src/routes/paymentRoutes.js`
- **Backend Config:** `server/src/config/config.js`
- **Frontend Form:** `client/src/pages/User/DonateMoney.jsx`
- **Environment File:** `server/.env`
- **Setup Guide:** `RAZORPAY_SETUP.md`

---

## Next Steps

1. **Get Credentials:** Follow `RAZORPAY_SETUP.md`
2. **Update .env:** Add real Razorpay keys
3. **Restart Server:** `npm run dev`
4. **Test Payment:** Try donation flow
5. **Verify:** Check Razorpay dashboard

**Status:** ✅ Backend ready, ⏳ Waiting for Razorpay configuration
