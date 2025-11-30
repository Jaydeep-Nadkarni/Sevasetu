# Payment Flow Diagrams & Architecture

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEVASETU PAYMENT SYSTEM                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  User Clicks     │
│  "Donate" Button │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Validate Form                       │
│  - Amount > 0                        │
│  - User logged in                    │
│  - NGO selected (optional)           │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  Frontend → Backend                                          │
│  POST /api/payment/create-order                             │
│  Body: {amount, ngoId, isAnonymous, notes}                 │
└────────┬─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  Backend Process (paymentController.js)                     │
│                                                             │
│  1. ✅ Validate Razorpay Credentials                        │
│     └─ Check if RAZORPAY_KEY_ID is set (NOT placeholder)  │
│                                                             │
│  2. ✅ Validate Amount                                      │
│     └─ Check if amount >= 1                                │
│                                                             │
│  3. ✅ Create Razorpay Order                                │
│     ├─ Call: razorpay.orders.create(options)              │
│     └─ Return: orderId, amount, currency                   │
│                                                             │
│  4. ✅ Create Transaction Record (MongoDB)                  │
│     ├─ Fields: user, ngo, amount, razorpayOrderId, etc    │
│     ├─ Status: 'pending'                                   │
│     └─ Save: database                                      │
│                                                             │
│  5. ✅ Return Response to Frontend                          │
│     └─ Include: orderId, amount, currency, Key ID          │
└────────┬─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  Frontend Received Order Successfully                        │
│                                                             │
│  Response: {                                               │
│    orderId: "order_1a2b3c4d5e6f",                         │
│    amount: 10000 (paise),                                  │
│    currency: "INR",                                        │
│    key: "rzp_live_xxxxx"  ← KEY ID                        │
│  }                                                         │
└────────┬─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  Load Razorpay SDK (if not already loaded)                   │
│                                                             │
│  <script src="https://checkout.razorpay.com/v1/           │
│   checkout.js"></script>                                  │
└────────┬─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  Open Razorpay Payment Modal                                │
│                                                             │
│  new Razorpay({                                           │
│    key: "rzp_live_xxxxx",    ← KEY ID from backend       │
│    amount: 10000,                                         │
│    currency: "INR",                                       │
│    order_id: "order_xxx",    ← ORDER ID from backend    │
│    handler: function(response) { ... }                    │
│  })                                                       │
│  .open()                                                  │
└────────┬─────────────────────────────────────────────────────┘
         │
         ▼
    ┌────────────────────────────────────────────┐
    │                                            │
    │   USER COMPLETES PAYMENT                  │
    │   (Razorpay Handles This)                 │
    │   - Enter card details                    │
    │   - Verify OTP                            │
    │   - Complete payment                      │
    │                                            │
    └──────────┬─────────────────────────────────┘
               │
               ▼ (Payment Success/Failure)
     ┌─────────┴──────────┐
     │                    │
  ✅ SUCCESS           ❌ FAILED
     │                    │
     ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│ handler() called │  │ error.handler()  │
│ with response:   │  │                  │
│ - order_id       │  │ Show error msg   │
│ - payment_id     │  │ to user          │
│ - signature      │  │                  │
└────────┬─────────┘  └──────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  Verify Payment                                             │
│                                                             │
│  Frontend → Backend                                        │
│  POST /api/payment/verify                                 │
│  Body: {                                                  │
│    razorpay_order_id: "order_xxx",                       │
│    razorpay_payment_id: "pay_xxx",                       │
│    razorpay_signature: "signature_xxx"                   │
│  }                                                        │
└────────┬─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  Backend Verification (paymentController.js)                │
│                                                             │
│  1. ✅ Verify Signature (HMAC-SHA256)                       │
│     ├─ Compute: HMAC-SHA256(body, Key Secret)             │
│     ├─ Compare with: razorpay_signature                   │
│     └─ Result: Valid or Invalid                           │
│                                                             │
│  2. ✅ Update Transaction (MongoDB)                         │
│     ├─ Find: Transaction by razorpayOrderId               │
│     ├─ Update: status = 'completed'                       │
│     └─ Save: payment details                              │
│                                                             │
│  3. ✅ Create Donation Record (MongoDB)                     │
│     ├─ Fields: donor, ngo, amount, type, status          │
│     ├─ Reference: transaction ID                          │
│     └─ Save: database                                     │
│                                                             │
│  4. ✅ Award Points                                         │
│     ├─ Calculate: points based on amount                  │
│     ├─ Add: points to user account                        │
│     ├─ Check: for level ups, badges                       │
│     └─ Update: user profile                               │
│                                                             │
│  5. ✅ Send Notifications                                  │
│     ├─ Socket: Real-time activity update                  │
│     ├─ Database: Notification record                      │
│     └─ Email: Payment receipt (optional)                  │
│                                                             │
│  6. ✅ Return Success Response                             │
│     ├─ Transaction details                                │
│     ├─ Donation details                                   │
│     ├─ Points earned                                      │
│     └─ Level up info (if applicable)                      │
└────────┬─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  Frontend Shows Success Modal                               │
│                                                             │
│  ┌──────────────────────────────────────────────┐         │
│  │  ✅ Payment Successful!                      │         │
│  │  Thank you for your contribution             │         │
│  │                                              │         │
│  │  Amount:      ₹{amount}                      │         │
│  │  To:          {ngoName}                      │         │
│  │  Transaction: {txn_id}                       │         │
│  │                                              │         │
│  │  +{points} Points Earned                     │         │
│  │  🎉 Level Up to Level {level} (if applicable)          │
│  │                                              │         │
│  │  [Redirecting to Dashboard in 5s...]        │         │
│  └──────────────────────────────────────────────┘         │
│                                                             │
│  Auto-redirect to /dashboard                             │
└──────────────────────────────────────────────────────────────┘
```

---

## Database Schema Relationships

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ _id                 │
│ firstName           │
│ lastName            │
│ email               │
│ phone               │
│ points              │
│ level               │
│ badges[]            │
└────────┬────────────┘
         │ owns many
         │
         ▼
    ┌────────────────────────┐
    │     Transaction        │
    ├────────────────────────┤
    │ _id                    │
    │ user         ─────────→ User
    │ ngo          ─────────→ NGO (optional)
    │ amount                 │
    │ currency               │
    │ status: pending/       │
    │         completed      │
    │ razorpayOrderId        │ (from Razorpay)
    │ razorpayPaymentId      │ (from Razorpay)
    │ razorpaySignature      │ (verified)
    │ paymentMethod          │
    │ metadata               │ {isAnonymous}
    │ createdAt              │
    └────────┬───────────────┘
             │ links to
             │
             ▼
    ┌─────────────────────────┐
    │      Donation           │
    ├─────────────────────────┤
    │ _id                     │
    │ donor       ───────────→ User
    │ ngo         ───────────→ NGO
    │ amount                  │
    │ type: monetary/material │
    │ status: completed       │
    │ transaction ──────────→ Transaction
    │ isAnonymous             │
    │ notes                   │
    │ createdAt               │
    └────────┬────────────────┘
             │ triggers
             │
             ▼
    ┌─────────────────────────┐
    │      Activity           │
    ├─────────────────────────┤
    │ _id                     │
    │ user        ──────────→ User
    │ type                    │
    │ description             │
    │ metadata                │
    │ createdAt               │
    └─────────────────────────┘

Also triggers:
- Points update (User.points)
- Level update (User.level)
- Badge award (User.badges)
- Notification creation
```

---

## Error Handling Flow

```
API Request
│
├─→ Check Credentials
│   ├─ Present?
│   │  ├─ NO  → ❌ 500 "Payment gateway not configured"
│   │  └─ YES → Continue
│   │
│   └─ Valid?
│      ├─ Placeholder? → ❌ 500 "Payment gateway not configured"
│      └─ Real value?  → Continue
│
├─→ Validate Amount
│   ├─ > 0?
│   │  ├─ NO  → ❌ 400 "Invalid amount"
│   │  └─ YES → Continue
│
├─→ Create Razorpay Order
│   ├─ Success?
│   │  ├─ YES → Create Transaction & Return ✅
│   │  │
│   │  └─ NO → Error Details?
│   │      ├─ 401 (INVALID_KEY) → ❌ 500 "Invalid Razorpay credentials"
│   │      ├─ 400 (Bad Request) → ❌ 400 "Invalid payment request"
│   │      └─ Other → ❌ 500 "Failed to create payment order: {error}"
│   │
│   └─ Log Details:
│       ├─ message
│       ├─ statusCode
│       ├─ code
│       └─ description

Signature Verification
│
├─→ Compute HMAC
│   └─ HMAC-SHA256(body, Key Secret)
│
├─→ Compare with Razorpay Signature
│   ├─ Match?
│   │  ├─ YES → Update Transaction & Create Donation ✅
│   │  └─ NO  → ❌ 400 "Payment verification failed"
│
└─→ All Errors Logged to Backend Console
```

---

## Environment Variables

```
server/.env
│
├─ Database
│  ├─ MONGODB_URI=mongodb+srv://...
│  └─ NODE_ENV=development
│
├─ JWT
│  ├─ JWT_SECRET=your_secret
│  └─ JWT_EXPIRE=7d
│
├─ Razorpay ⚠️ CRITICAL
│  ├─ RAZORPAY_KEY_ID=rzp_live_xxxxx
│  └─ RAZORPAY_KEY_SECRET=xxxxx
│
├─ Other Services
│  ├─ CLOUDINARY_CLOUD_NAME=...
│  ├─ GOOGLE_MAPS_API_KEY=...
│  └─ GEMINI_API_KEY=...
│
└─ CORS
   ├─ CORS_ORIGIN=http://localhost:5173
   └─ CLIENT_URL=http://localhost:5173
```

---

## Data Flow Summary

```
┌────────────┐
│   User     │
│  Frontend  │
└─────┬──────┘
      │
      ├─→ POST /payment/create-order
      │   Body: {amount, ngoId, isAnonymous, notes}
      │
      ├─→ Receive: {orderId, amount, key, transactionId}
      │
      ├─→ Open Razorpay Modal with orderId + key
      │
      ├─→ User enters payment details
      │
      ├─→ Razorpay processes payment
      │
      ├─→ POST /payment/verify
      │   Body: {order_id, payment_id, signature}
      │
      └─→ Receive: {transaction, donation, points, levelUp}

Backend Processing:
┌──────────────────┐
│  Controller      │
├──────────────────┤
│ ✅ Validate      │
│ ✅ Create Order  │
│ ✅ Save Record   │
│ ✅ Return Data   │
└────────┬─────────┘
         │
         ├─→ Razorpay Service
         │   ├─ Create Order
         │   └─ Verify Signature
         │
         └─→ Database
             ├─ Transaction Collection
             ├─ Donation Collection
             └─ User Collection (points)
```

---

## Success Criteria

```
✅ Credentials Configured
   └─ RAZORPAY_KEY_ID set (not placeholder)
   └─ RAZORPAY_KEY_SECRET set (not placeholder)

✅ Order Creation
   └─ Amount validated (> 0)
   └─ Razorpay API responds (orderId received)
   └─ Transaction record created in MongoDB
   └─ Frontend receives response with key

✅ Payment Modal
   └─ Razorpay SDK loads successfully
   └─ Modal opens with order details
   └─ User can select payment method
   └─ User can enter card details

✅ Payment Processing
   └─ User completes payment on Razorpay
   └─ Razorpay returns to app

✅ Verification
   └─ Signature verified successfully
   └─ Transaction status updated (pending → completed)
   └─ Donation record created
   └─ Points awarded to user

✅ Frontend Response
   └─ Success modal displays
   └─ Points earned shown
   └─ Level up notification (if applicable)
   └─ Auto-redirect to dashboard

✅ Database
   └─ Transaction record exists and completed
   └─ Donation record created
   └─ User points increased
   └─ Activity log updated
```

---

## Troubleshooting Map

```
❌ Problem: HTTP 500 Error
   ├─ Cause: Razorpay not configured
   ├─ Check: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
   └─ Fix: Update with real credentials, restart server

❌ Problem: Razorpay modal doesn't open
   ├─ Cause 1: Order creation failed
   │  ├─ Check: Backend logs for "Razorpay Order Error"
   │  └─ Fix: Debug backend error
   │
   └─ Cause 2: SDK not loaded
      ├─ Check: Browser console for "Razorpay SDK loaded"
      └─ Fix: Check internet connection, reload page

❌ Problem: Invalid amount error
   ├─ Cause: Amount < 1 or invalid
   └─ Fix: Enter amount ≥ ₹1

❌ Problem: Payment fails in Razorpay modal
   ├─ Cause: Card declined, insufficient funds, or test card used wrongly
   └─ Fix: Use correct test card details or real card

❌ Problem: Signature verification failed
   ├─ Cause: Backend received wrong signature from Razorpay
   └─ Fix: Check Key Secret in .env (must match Razorpay account)

❌ Problem: Transaction not created
   ├─ Cause 1: Database connection issue
   ├─ Cause 2: Missing required fields
   └─ Fix: Check MongoDB connection and error logs
```

---

## Timeline

```
User clicks Donate
      │
      ├─ < 1 second: Validate form
      │
      ├─ ~500ms: API call to create-order
      │
      ├─ ~100ms: Razorpay order creation
      │
      ├─ ~100ms: Database transaction creation
      │
      ├─ ~50ms: Response to frontend
      │
      ├─ < 100ms: Load Razorpay SDK (cached usually)
      │
      ├─ < 500ms: Open payment modal
      │
      ├─ 1-5 minutes: User enters payment details
      │
      ├─ ~2 seconds: Razorpay processes payment
      │
      ├─ ~1 second: Frontend calls verify endpoint
      │
      ├─ ~100ms: Signature verification
      │
      ├─ ~200ms: Create donation & update points
      │
      ├─ ~500ms: Send notifications
      │
      ├─ < 100ms: Return response to frontend
      │
      ├─ < 500ms: Show success modal
      │
      └─ 5 seconds: Auto-redirect to dashboard

Total: 1-5 minutes (mostly waiting for user input)
```

---

**Diagrams Last Updated:** November 30, 2025  
**Architecture Version:** 1.0
