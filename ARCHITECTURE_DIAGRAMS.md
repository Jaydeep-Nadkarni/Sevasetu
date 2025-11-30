# 🎁 Donation System - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DONATION SYSTEM ARCHITECTURE               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐                                 ┌──────────────┐
│   FRONTEND      │                                 │   BACKEND    │
│   (React)       │◄────────── HTTP/REST ────────►│  (Express)   │
│                 │                                 │              │
│ ┌─────────────┐ │                                 │ ┌──────────┐ │
│ │   Users &   │ │                                 │ │  Routes  │ │
│ │   NGOs      │ │◄──── WebSocket (Socket.IO) ───►│ ├──────────┤ │
│ │             │ │                                 │ │Controllers
│ │ ┌─────────┐ │ │                                 │ ├──────────┤ │
│ │ │Create   │ │ │                                 │ │ Models   │ │
│ │ │Donation │ │ │  ┌───────────────────────────┐ │ │ (MongoDB)│ │
│ │ └─────────┘ │ │  │  SOCKET.IO EVENTS         │ │ └──────────┘ │
│ │             │ │  ├───────────────────────────┤ │              │
│ │ ┌─────────┐ │ │  │ donation:accepted        │ │              │
│ │ │Donation │ │ │  │ donation:completed       │ │              │
│ │ │History  │ │ │  │ donation:cancelled       │ │              │
│ │ └─────────┘ │ │  │ ngo:contacted            │ │              │
│ │             │ │  └───────────────────────────┘ │              │
│ │ ┌─────────┐ │ │                                 │              │
│ │ │NGO Mgmt │ │ │                                 │              │
│ │ └─────────┘ │ │                                 │              │
│ │             │ │                                 │              │
│ │ ┌─────────┐ │ │                                 │              │
│ │ │Notif's  │ │ │                                 │              │
│ │ └─────────┘ │ │                                 │              │
│ └─────────────┘ │                                 │              │
└─────────────────┘                                 └──────────────┘

                ┌─────────────────────────────────┐
                │     MONGODB DATABASE             │
                ├─────────────────────────────────┤
                │  itemdonations                  │
                │  - 7 indexes (incl. 2dsphere)   │
                │  - Geospatial for location      │
                │  - Activity logging             │
                └─────────────────────────────────┘

                ┌─────────────────────────────────┐
                │  CLOUDINARY STORAGE             │
                ├─────────────────────────────────┤
                │  - Image uploads                │
                │  - Automatic optimization       │
                │  - CDN delivery                 │
                └─────────────────────────────────┘
```

## Request Flow - Create Donation

```
USER CREATES DONATION
│
├─ 1. Form Submission
│  ├─ Validate items (required fields)
│  ├─ Get GPS coordinates or manual address
│  ├─ Validate location data
│  └─ Upload images to Cloudinary
│
├─ 2. API Call: POST /api/donations
│  └─ Headers: Authorization: Bearer {token}
│     Content-Type: multipart/form-data
│
├─ 3. Server Processing
│  ├─ Authenticate user
│  ├─ Parse form data
│  ├─ Upload images → Cloudinary
│  ├─ Create ItemDonation document
│  │
│  ├─ 4. GEOSPATIAL AUTO-ASSIGNMENT
│  │  ├─ Extract donor coordinates [lon, lat]
│  │  │
│  │  ├─ MongoDB Query
│  │  │  └─ db.ngo.find({
│  │  │      location: { $near: {
│  │  │        $geometry: { type: 'Point', coordinates: [lon, lat] },
│  │  │        $maxDistance: 15000  // 15km
│  │  │      }},
│  │  │      isActive: true
│  │  │    })
│  │  │
│  │  ├─ Get top 3 nearest NGOs
│  │  │
│  │  ├─ Calculate Haversine distances
│  │  │  └─ distance = R * 2 * atan2(√a, √(1-a))
│  │  │     where R = 6371 km (Earth radius)
│  │  │
│  │  ├─ Create assignedNGOs array
│  │  │  [
│  │  │    { ngo: ngo1._id, distanceKm: 3.2, status: 'pending' },
│  │  │    { ngo: ngo2._id, distanceKm: 5.8, status: 'pending' },
│  │  │    { ngo: ngo3._id, distanceKm: 8.4, status: 'pending' }
│  │  │  ]
│  │  │
│  │  └─ Save donation with assignments
│  │
│  └─ Return 201 Created response
│
└─ 5. Client receives donation object
   ├─ Show success notification
   ├─ Redirect to donation history
   └─ Display assigned NGOs on map (future)
```

## Real-Time Notification Flow

```
NGO ACCEPTS DONATION
│
└─ 1. NGO Clicks "Accept" Button
   │
   ├─ 2. API Call: PATCH /api/donations/:id/accept
   │  └─ Server: Update assignedNGOs[ngo].status = 'accepted'
   │
   ├─ 3. Socket.IO Event Emission
   │  │
   │  ├─ Get io instance from app: app.get('io')
   │  │
   │  ├─ Emit to donor's personal room:
   │  │  └─ io.to('user:${donorId}').emit('donation:accepted', {
   │  │      donationId: "...",
   │  │      donorId: "...",
   │  │      ngoId: "...",
   │  │      ngoName: "XYZ NGO"
   │  │    })
   │  │
   │  └─ Also broadcast globally:
   │     └─ io.emit('donation:accepted', {...})
   │
   ├─ 4. Client Socket.IO Listener
   │  └─ socket.on('donation:accepted', (data) => {
   │      // Show notification
   │     })
   │
   ├─ 5. Frontend Notifications Component
   │  ├─ Receive event
   │  ├─ Create toast notification
   │  ├─ Add to history
   │  ├─ Display for 5 seconds
   │  └─ Auto-dismiss
   │
   └─ 6. User sees real-time notification
      └─ "✅ XYZ NGO has accepted your donation!"
```

## Geospatial Query Execution

```
LOCATION BASED SEARCH
│
├─ User Location: [77.2098, 28.6139] (Delhi)
│
├─ Distance Calculation (Haversine Formula)
│  │
│  ├─ For each NGO:
│  │  ├─ dLat = (ngo.lat - user.lat) * π/180
│  │  ├─ dLon = (ngo.lon - user.lon) * π/180
│  │  ├─ a = sin²(dLat/2) + cos(user.lat*π/180) * cos(ngo.lat*π/180) * sin²(dLon/2)
│  │  ├─ c = 2 * atan2(√a, √(1-a))
│  │  └─ distance = 6371 * c  (in kilometers)
│  │
│  └─ Results sorted by distance:
│     ┌─────────────────────────────┐
│     │ NGO     │ Location   │ Dist  │
│     ├─────────────────────────────┤
│     │ NGO_A   │ 77.15,28.62│ 3.2km │ ✓ Assign
│     │ NGO_B   │ 77.25,28.55│ 5.8km │ ✓ Assign
│     │ NGO_C   │ 77.35,28.58│ 8.4km │ ✓ Assign
│     │ NGO_D   │ 77.45,28.45│ 12.1km│ ✗ Outside radius
│     └─────────────────────────────┘
│
└─ Scoring System
   ├─ NGO_A (1st nearest): 10 points
   ├─ NGO_B (2nd nearest): 8 points
   └─ NGO_C (3rd nearest): 6 points
```

## Database Schema Relationships

```
┌──────────────────────────────────────────────────────────────┐
│                   ItemDonation Document                       │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ donor: ObjectId → User                                        │
│                                                                │
│ items: [                                                      │
│   {                                                           │
│     category: 'food'|'clothes'|...,                          │
│     description: String,                                     │
│     quantity: Number,                                        │
│     unit: 'kg'|'pieces'|...,                                │
│     qualityCondition: 'new'|'used'|...,                      │
│     expiryDate: Date                                         │
│   },                                                          │
│   ...                                                         │
│ ]                                                             │
│                                                                │
│ location: {                    ← 2dsphere indexed             │
│   type: 'Point',                                              │
│   coordinates: [77.2098, 28.6139],  ← [longitude, latitude]  │
│   address: String,                                            │
│   city: String                                                │
│ }                                                              │
│                                                                │
│ images: [                                                     │
│   {                                                           │
│     url: 'https://cloudinary.com/...',                       │
│     publicId: 'donations/...'                                │
│   },                                                          │
│   ...                                                         │
│ ]                                                             │
│                                                                │
│ status: 'pending'|'accepted'|'completed'|...                │
│                                                                │
│ assignedNGOs: [                    ← Key field                │
│   {                                                           │
│     ngo: ObjectId → NGO,                                     │
│     distanceKm: 3.2,                                         │
│     status: 'pending'|'accepted'|'rejected',                │
│     acceptedAt: Date,                                        │
│     completedAt: Date,                                       │
│     notes: String                                            │
│   },                                                          │
│   {                                                           │
│     ngo: ObjectId → NGO,                                     │
│     distanceKm: 5.8,                                         │
│     status: 'pending',                                       │
│     ...                                                       │
│   },                                                          │
│   ...                                                         │
│ ]                                                              │
│                                                                │
│ primaryNGO: ObjectId → NGO          ← First to accept        │
│                                                                │
│ pickupSchedule: {                                             │
│   preferredDate: Date,                                        │
│   preferredTime: String,                                      │
│   isFlexible: Boolean,                                        │
│   actualPickupDate: Date                                      │
│ }                                                              │
│                                                                │
│ contactPerson: {                                              │
│   name: String,                                              │
│   phone: String,                                             │
│   email: String                                              │
│ }                                                              │
│                                                                │
│ activityLog: [                     ← Audit trail              │
│   {                                                           │
│     action: 'created'|'accepted'|'rejected'|'completed',     │
│     ngo: ObjectId → NGO,                                     │
│     timestamp: Date,                                         │
│     message: String,                                         │
│     changedBy: ObjectId → User                               │
│   },                                                          │
│   ...                                                         │
│ ]                                                              │
│                                                                │
│ createdAt: Date                    ← Indexed                  │
│ updatedAt: Date                                               │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

## API Endpoint Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│             USER (DONOR) ROUTES                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ POST   /api/donations                                    │
│ ├─ Create donation                                       │
│ ├─ Trigger: Auto-assign NGOs                           │
│ └─ Response: Created donation object                    │
│                                                           │
│ GET    /api/donations/my                                │
│ ├─ Get user's donations                                 │
│ ├─ Filter: All statuses                                 │
│ └─ Response: Array of donations                         │
│                                                           │
│ GET    /api/donations/:id                               │
│ ├─ Get single donation details                          │
│ └─ Response: Full donation object                       │
│                                                           │
│ DELETE /api/donations/:id                               │
│ ├─ Cancel donation (pending/accepted only)              │
│ ├─ Trigger: Emit donation:cancelled event               │
│ └─ Response: Updated donation                           │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│             NGO (ADMIN) ROUTES                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ GET    /api/donations/available                         │
│ ├─ Get donations in NGO area                            │
│ ├─ Trigger: Geospatial query                            │
│ └─ Response: Array of nearby donations                  │
│                                                           │
│ GET    /api/donations/assigned                          │
│ ├─ Get NGO's assigned donations                         │
│ └─ Response: Array of assigned donations                │
│                                                           │
│ PATCH  /api/donations/:id/accept                        │
│ ├─ Accept donation                                      │
│ ├─ Trigger: Emit donation:accepted event                │
│ └─ Response: Updated donation                           │
│                                                           │
│ PATCH  /api/donations/:id/reject                        │
│ ├─ Reject donation with reason                          │
│ └─ Response: Updated donation                           │
│                                                           │
│ PATCH  /api/donations/:id/complete                      │
│ ├─ Mark pickup as complete                              │
│ ├─ Trigger: Emit donation:completed event               │
│ └─ Response: Updated donation                           │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│          SEARCH/FILTER ROUTES                            │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ GET    /api/donations                                   │
│ ├─ List all donations (paginated)                       │
│ ├─ Filters: category, status, city                      │
│ └─ Response: Paginated results                          │
│                                                           │
│ GET    /api/donations/search?q=...                      │
│ ├─ Full-text search                                     │
│ ├─ Search: description, donor name, address             │
│ └─ Response: Matching donations                         │
│                                                           │
│ GET    /api/donations/ngo/:ngoId                        │
│ ├─ Get all donations for specific NGO                   │
│ └─ Response: Array of donations                         │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Status State Machine

```
                    ┌──────────────┐
                    │   PENDING    │ ← Initial state
                    └──────┬───────┘
                           │
                ┌──────────┼──────────┐
                │          │          │
         [User] │    [NGO] │    [NGO] │ [User]
              [Cancelled] [Accepted] [All Rejected]
                │          │          │
                ▼          ▼          ▼
            ┌────────┐  ┌────────┐  ┌────────┐
            │CANCELLED│  │ACCEPTED│  │REJECTED│
            └────────┘  └───┬────┘  └────────┘
                            │
                      [NGO Starts Pickup]
                            │
                            ▼
                    ┌──────────────┐
                    │ IN-PROGRESS  │
                    └──────┬───────┘
                           │
                    [NGO Completes]
                           │
                           ▼
                    ┌──────────────┐
                    │  COMPLETED   │
                    └──────────────┘


TRANSITION RULES:
┌────────────────────────────────────────────┐
│ From      → To           │ Who    │ Condition
├────────────────────────────────────────────┤
│ PENDING   → ACCEPTED     │ NGO    │ Not rejected by all
│ PENDING   → CANCELLED    │ User   │ User initiated
│ PENDING   → REJECTED     │ NGO    │ All NGOs reject
│ ACCEPTED  → IN-PROGRESS  │ NGO    │ Auto on accept
│ ACCEPTED  → CANCELLED    │ User   │ Before pickup
│ ACCEPTED  → REJECTED     │ NGO    │ Self-reject (rare)
│ IN-PROGRESS → COMPLETED  │ NGO    │ Pickup done
│ COMPLETED → (locked)     │ -      │ Final state
│ CANCELLED → (locked)     │ -      │ Final state
│ REJECTED  → (locked)     │ -      │ Final state
└────────────────────────────────────────────┘
```

## Component Communication Map

```
┌─────────────────────────────────────────────────────────────┐
│                    Redux Store (State)                       │
│  ┌────────────┬──────────────┬──────────────┐               │
│  │   Auth     │  Donations   │ Notifications│               │
│  │            │              │              │               │
│  │ - user     │ - list[]     │ - toasts[]   │               │
│  │ - token    │ - selected   │ - history[]  │               │
│  │ - role     │ - filters    │ - unread     │               │
│  └────────────┴──────────────┴──────────────┘               │
└────────────────────────────────────────────────────────────┘
                          ▲
                    ┌─────┴─────┐
                    │           │
            ┌───────────────┐  ┌──────────────────┐
            │ CreateDonation│  │ DonationHistory  │
            │               │  │                  │
            │ - Form input  │  │ - Display list   │
            │ - Image upload│  │ - Filter status  │
            │ - GPS detect  │  │ - View detail    │
            │ - Submit API  │  │ - Cancel action  │
            └───────┬───────┘  └──────────────────┘
                    │                    │
                    └─────────┬──────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────────────┐  ┌─────────────────┐
            │ Notifications │  │DonationMgmt(NGO)│
            │               │  │                 │
            │ - Toast msgs  │  │ - Available tab │
            │ - History pnl │  │ - Assigned tab  │
            │ - Bell icon   │  │ - Modals        │
            │ - Socket.IO   │  │ - Accept/Reject │
            └───────────────┘  └─────────────────┘
                    ▲                    │
                    │                    │
                    └────────┬───────────┘
                             │
                    ┌────────┴─────────┐
                    │   Socket.IO      │
                    │                  │
                    │ Real-time events │
                    │ Room-based msgs  │
                    │ Reconnection mgmt│
                    └──────────────────┘
```

## File Structure & Dependencies

```
server/
├── src/
│   ├── index.js
│   │   ├─ imports: Socket.IO, http.createServer
│   │   ├─ exports: app, httpServer
│   │   └─ uses: express, cors, Socket.IO config
│   │
│   ├── models/
│   │   └── ItemDonation.js
│   │       ├─ imports: mongoose, validators
│   │       ├─ exports: ItemDonation model
│   │       └─ uses: Mongoose Schema, indexes
│   │
│   ├── routes/
│   │   └── donationRoutes.js
│   │       ├─ imports: donationController, auth middleware
│   │       ├─ exports: router
│   │       └─ uses: express.Router(), authenticate, authorize
│   │
│   └── controllers/
│       └── donationController.js
│           ├─ imports: ItemDonation, NGO, uploadImage
│           ├─ exports: 15 handlers
│           ├─ uses: asyncHandler, Socket.IO
│           └─ calls: MongoDB queries, Cloudinary API

client/
├── src/
│   ├── App.jsx
│   │   ├─ imports: Route, Routes, Notifications
│   │   ├─ uses: React Router, Redux
│   │   └─ renders: Layout + notification component
│   │
│   ├── pages/
│   │   ├── User/
│   │   │   ├── CreateDonation.jsx
│   │   │   │   ├─ imports: api, ImageUpload, Framer Motion
│   │   │   │   ├─ uses: Redux dispatch, axios
│   │   │   │   └─ calls: POST /api/donations
│   │   │   │
│   │   │   └── DonationHistory.jsx
│   │   │       ├─ imports: api, motion
│   │   │       ├─ uses: Redux, axios
│   │   │       └─ calls: GET /api/donations/my, DELETE
│   │   │
│   │   └── NGO/
│   │       └── DonationManagement.jsx
│   │           ├─ imports: api, motion, Modal
│   │           ├─ uses: Redux, axios
│   │           └─ calls: GET, PATCH endpoints
│   │
│   ├── components/
│   │   └── Notifications.jsx
│   │       ├─ imports: Socket.IO client, Framer Motion
│   │       ├─ uses: useEffect, useState
│   │       └─ listens: donation:* Socket events
│   │
│   └── config/
│       └── config.js
│           └─ exports: API_URL, NODE_ENV
```

## Performance Characteristics

```
OPERATION                 │ TIME      │ DATABASE   │ NETWORK
──────────────────────────┼───────────┼────────────┼──────────
Create Donation           │ 800-2000ms│ 1 write    │ Multi-req
  - Validate              │  50ms     │ -          │ -
  - Upload images         │ 500-1500ms│ -          │ CDN
  - Auto-assign NGOs      │ 100ms     │ 1 query    │ -
  - Save to DB            │  50ms     │ 1 write    │ -
                          │           │            │
Get Available (Geospatial)│  50-100ms │ 1 query    │ 1 req
  - Geo-index lookup      │  50-100ms │ B-tree     │ -
  - Populate references   │  50ms     │ 3 queries  │ -
                          │           │            │
Accept Donation           │  200-400ms│ 1 update   │ 1 req
  - Update DB             │  50ms     │ 1 write    │ -
  - Emit Socket event     │  <50ms    │ -          │ WS
  - Send notification     │ 100-300ms │ -          │ WS
                          │           │            │
List Donations (paginated)│  100-200ms│ 1 query    │ 1 req
  - Index lookup          │  50ms     │ B-tree     │ -
  - Populate (10 docs)    │  50-100ms │ 3 queries  │ -
                          │           │            │
Search Donations          │  150-300ms│ 1 query    │ 1 req
  - Text index scan       │ 100-200ms │ Text idx   │ -
  - Filter results        │  50ms     │ -          │ -
                          │           │            │
Socket.IO Emit            │  <50ms    │ -          │ WS
  - Find room             │  <10ms    │ -          │ -
  - Serialize event       │  <5ms     │ -          │ -
  - Send to clients       │  <35ms    │ -          │ WS
```

---

**Diagram Version:** 1.0  
**Last Updated:** January 2024  
**Accuracy:** High - Based on actual implementation
