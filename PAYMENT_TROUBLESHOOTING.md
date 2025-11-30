# Complete Troubleshooting Guide: Payment Error 500

## Summary
You're getting a **500 Internal Server Error** on the payment endpoint because **Razorpay API credentials are not configured** in the backend `.env` file.

## Root Cause
The `.env` file contains placeholder values:
```env
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

When the backend tries to create an order with these placeholder credentials, Razorpay rejects the request, causing a 500 error.

---

## Quick Fix (2 Minutes)

### 1. Get Razorpay Credentials
- Go to https://razorpay.com
- Log in to your account
- Navigate to: **Settings → API Keys**
- Copy your **Key ID** (starts with `rzp_live_` or `rzp_test_`)
- Copy your **Key Secret**

### 2. Update `.env` File
Edit `server/.env`:
```env
# BEFORE
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# AFTER
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx
```

### 3. Restart Server
```bash
# Stop current server (Ctrl+C)
# Then:
cd server
npm run dev
```

### 4. Test Payment
1. Open app in browser
2. Go to Donate Money page
3. Enter amount (₹10 or more)
4. Click Donate
5. Check backend console for: "✅ Razorpay order created"

---

## Step-by-Step Verification

### ✅ Step 1: Verify Backend is Running
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"success","message":"Server is running"...}
```

### ✅ Step 2: Check Server Logs After Restart
Look for one of these:

**✅ SUCCESS:**
```
📝 Creating Razorpay order with amount: 100 INR
✅ Razorpay order created: order_xxx
💾 Transaction created: [id]
```

**❌ CONFIGURATION ERROR:**
```
❌ Razorpay credentials not configured!
   Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file
```

**❌ INVALID CREDENTIALS:**
```
❌ Razorpay Order Error: {
  message: "Invalid credentials",
  statusCode: 401,
  code: "INVALID_KEY"
}
```

### ✅ Step 3: Check Frontend Console
When you click "Donate":

1. Look for: `Payment initiated {amount: 100, selectedNGO: "..."}`
2. Then: `Loading Razorpay SDK...`
3. Then: `Razorpay SDK loaded successfully`
4. Then: `Creating payment order...`
5. Check the response:
   - ✅ If 200 OK: `Order created: {orderId: "order_xxx"...}`
   - ❌ If error: `Order creation error: {success: false...}`

### ✅ Step 4: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Enter amount and click Donate
4. Look for request to `api/payment/create-order`
5. Click on it
6. Check Response tab:
   - ✅ 200 status = Working
   - ❌ 500 status = Credentials issue

---

## Detailed Error Messages & Solutions

### Error: "Payment gateway not configured"
```
❌ Backend Response:
{
  "success": false,
  "message": "Payment gateway not configured. Please contact support.",
  "error": null
}
```
**Cause:** Placeholder credentials in .env  
**Solution:** Update `.env` with real Razorpay keys

---

### Error: "Invalid Razorpay credentials"
```
❌ Backend Console:
❌ Razorpay Order Error: {
  statusCode: 401,
  code: "INVALID_KEY"
}
```
**Cause:** Credentials are invalid or incorrect  
**Solution:** Double-check Key ID and Key Secret from Razorpay dashboard

---

### Error: "Failed to create payment order"
```
❌ Frontend Toast: "Failed to create payment order"
❌ Backend Console: "❌ Razorpay Order Error: ..."
```
**Cause:** Various (invalid amount, network issue, Razorpay API problem)  
**Solution:**
1. Check backend console for specific error
2. Verify amount is ≥ ₹1
3. Check internet connection
4. Check Razorpay status page

---

### Error: Razorpay Modal Doesn't Open
**Possible Causes:**

1. **SDK didn't load:**
   - Check browser console: `console.log(window.Razorpay)`
   - Should show a function, not undefined
   - Solution: Check internet connection, reload page

2. **Order creation failed:**
   - Check Network tab → create-order response
   - Should be 200 OK with orderId
   - Solution: Fix backend issues first

3. **Invalid Key ID:**
   - Network tab → Response → check `key` field
   - Should start with `rzp_live_` or `rzp_test_`
   - Solution: Update `.env` with correct Key ID

---

## Razorpay Test Credentials

For testing purposes, you can use Razorpay's test keys:

**Test Cards:**
```
Visa:
Card Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: 123
OTP: 123456

Mastercard:
Card Number: 5555 5555 5555 4444
Expiry: Any future date
CVV: 123
OTP: 123456
```

**Note:** Use `rzp_test_` keys for testing. Switch to `rzp_live_` keys for production.

---

## Verification Checklist

After making changes, verify each step:

- [ ] Edit `server/.env` with real credentials
- [ ] Server restarted successfully
- [ ] Backend logs show no "not configured" errors
- [ ] `http://localhost:5000/api/health` returns 200
- [ ] Frontend Donate page loads
- [ ] Can enter amount without errors
- [ ] Clicking Donate shows "Razorpay SDK loaded successfully" in console
- [ ] Backend console shows "Razorpay order created"
- [ ] Razorpay modal opens on screen
- [ ] Can select payment method
- [ ] Can enter test card details
- [ ] Payment completes
- [ ] Success message displays
- [ ] Transaction appears in Razorpay dashboard

---

## Environment File Reference

**Location:** `server/.env`

**Required Variables:**
```env
# Critical for payments
RAZORPAY_KEY_ID=rzp_live_xxxxx    # Your actual Key ID
RAZORPAY_KEY_SECRET=xxxxx         # Your actual Key Secret

# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your_secret_key

# Other services (leave as-is for now)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

---

## Backend Code Overview

### Payment Flow:
1. **Frontend** → POST to `/api/payment/create-order`
2. **Backend** validates credentials and amount
3. **Backend** calls `razorpay.orders.create()` with amount
4. **Razorpay API** returns order details
5. **Backend** creates Transaction record in MongoDB
6. **Backend** returns order details + Key ID to frontend
7. **Frontend** opens Razorpay modal with order details
8. **User** completes payment
9. **Frontend** → POST to `/api/payment/verify`
10. **Backend** verifies signature and updates records

### Error Handling:
- Invalid credentials → 401 error
- Misconfigured → 500 error with message
- Invalid amount → 400 error
- Specific error messages logged to console

---

## Production Deployment Notes

When deploying to production:

1. **Use Live Keys:**
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxx    # NOT rzp_test_
   RAZORPAY_KEY_SECRET=xxxxx
   ```

2. **Enable HTTPS:**
   - Razorpay requires HTTPS in production
   - Update `CORS_ORIGIN` to HTTPS URL

3. **Set Up Webhooks:**
   - Settings → Webhooks in Razorpay dashboard
   - Add: `https://yourdomain.com/api/payment/webhook`
   - Subscribe to: `payment.authorized`, `payment.failed`

4. **Monitor Transactions:**
   - Check dashboard daily for failed payments
   - Set up alerts for errors

---

## Support Resources

- **Razorpay Documentation:** https://razorpay.com/docs/api/
- **Razorpay Support:** https://razorpay.com/support
- **API Status:** https://status.razorpay.com/

---

## File Changes Made

### Backend Files Updated:

1. **`server/src/controllers/paymentController.js`**
   - Added credential validation
   - Better error logging
   - Specific error messages

2. **`server/src/models/Transaction.js`**
   - Made `ngo` field optional
   - Made `paymentMethod` have default value

### Documentation Files Created:

1. **`RAZORPAY_SETUP.md`** - Complete setup guide
2. **`PAYMENT_DEBUG_GUIDE.md`** - Debugging reference
3. **This file** - Troubleshooting steps

---

## Summary

| Item | Status |
|------|--------|
| **Backend Code** | ✅ Ready |
| **Frontend Code** | ✅ Ready |
| **Database Models** | ✅ Ready |
| **Razorpay Credentials** | ❌ **NEEDED** |
| **Configuration** | ❌ **PENDING** |
| **Ready to Test** | ⏳ **Once configured** |

**Next Action:** Update `.env` with real Razorpay credentials and restart the server.

---

**Last Updated:** November 30, 2025  
**Status:** Waiting for Razorpay configuration
