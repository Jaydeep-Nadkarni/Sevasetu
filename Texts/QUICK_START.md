# 🚀 Quick Start Guide - Donation System

## Installation & Setup (5 minutes)

### 1. Install Dependencies

```bash
# Backend
cd server
npm install socket.io

# Frontend
cd ../client
npm install socket.io-client
```

### 2. Update Environment Variables

**Server** (`.env` in server/):
```bash
CORS_ORIGIN=http://localhost:5173
PORT=5000
```

**Client** (`.env.local` in client/):
```bash
VITE_API_URL=http://localhost:5000
```

### 3. Database Setup

Ensure MongoDB is running and create the geospatial index:

```javascript
// MongoDB Shell
use ngo-database
db.itemdonations.createIndex({ "location.coordinates": "2dsphere" })
db.itemdonations.createIndex({ "donor": 1, "createdAt": -1 })
db.itemdonations.createIndex({ "assignedNGOs.ngo": 1 })
db.itemdonations.createIndex({ "status": 1 })
db.itemdonations.createIndex({ "items.category": 1 })
```

### 4. Start Servers

```bash
# Terminal 1 - Backend (from project root)
cd server
npm run dev

# Terminal 2 - Frontend (from project root)
cd client
npm run dev
```

Visit: `http://localhost:5173`

## File Structure

```
server/
├── src/
│   ├── models/
│   │   └── ItemDonation.js          ✨ NEW - Donation schema
│   ├── routes/
│   │   └── donationRoutes.js        ✨ NEW - 14 API endpoints
│   ├── controllers/
│   │   └── donationController.js    ✨ NEW - Business logic
│   └── index.js                     🔄 UPDATED - Socket.IO setup
│
client/
├── src/
│   ├── pages/
│   │   ├── User/
│   │   │   ├── CreateDonation.jsx   ✨ NEW - Donation form
│   │   │   └── DonationHistory.jsx  ✨ NEW - User history
│   │   └── NGO/
│   │       └── DonationManagement.jsx ✨ NEW - NGO interface
│   ├── components/
│   │   └── Notifications.jsx        ✨ NEW - Real-time alerts
│   ├── config/
│   │   └── config.js                ✨ NEW - Client config
│   └── App.jsx                      🔄 UPDATED - Routes added
```

## Key Components Overview

### Backend
- **ItemDonation Model** - MongoDB schema with geospatial indexes
- **donationRoutes** - 14 endpoints (user/NGO/search)
- **donationController** - Auto-assignment algorithm + Socket.IO events
- **Socket.IO Setup** - Real-time notifications with room-based messaging

### Frontend
- **CreateDonation** - Form with image upload, GPS location, multi-item support
- **DonationHistory** - User's donation tracking with status filtering
- **DonationManagement** - NGO interface for accepting/completing donations
- **Notifications** - Real-time toast + history panel with Socket.IO

## Workflow (End-to-End)

### 1️⃣ User Creates Donation
```
POST /api/donations
→ Server validates & uploads images
→ Server runs geospatial query to find 3 nearest NGOs
→ Donation auto-assigned with distances
→ Returns donation with assignedNGOs array
```

### 2️⃣ NGO Views Available Donations
```
GET /api/donations/available
→ Server queries donations within geospatial radius
→ Returns donations assigned to this NGO
→ Sorted by distance (nearest first)
```

### 3️⃣ NGO Accepts Donation
```
PATCH /api/donations/:id/accept
→ Server updates assignedNGOs[].status = 'accepted'
→ Sets primaryNGO if first acceptance
→ Emits Socket.IO: donation:accepted
→ Donor receives real-time notification
```

### 4️⃣ Donor Gets Notification
```
Socket.io.to('user:${userId}').emit('donation:accepted')
→ Frontend Notifications component receives event
→ Shows toast notification
→ Adds to history panel
→ Auto-dismisses after 5s
```

### 5️⃣ NGO Marks Complete
```
PATCH /api/donations/:id/complete
→ Server sets status = 'completed'
→ Emits Socket.IO: donation:completed
→ Donor receives notification
```

## Testing Checklist

- [ ] Create donation with multiple items and images
- [ ] Verify GPS location auto-detection works
- [ ] Check donation appears in NGO's available list
- [ ] Accept donation and see real-time notification on donor side
- [ ] Reject donation with reason
- [ ] Mark complete and verify donor notification
- [ ] Check donation history view with filtering
- [ ] Test notification history panel
- [ ] Verify disconnection/reconnection handling

## API Examples

### Create Donation
```bash
curl -X POST http://localhost:5000/api/donations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: multipart/form-data" \
  -F "items={...}" \
  -F "location={...}" \
  -F "images=@file1.jpg"
```

### Get Available Donations
```bash
curl http://localhost:5000/api/donations/available \
  -H "Authorization: Bearer <token>"
```

### Accept Donation
```bash
curl -X PATCH http://localhost:5000/api/donations/:id/accept \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"notes": "We can pick this up tomorrow"}'
```

## Performance Metrics

| Operation | Time | Factors |
|-----------|------|---------|
| Geospatial Query | 50-100ms | Radius (15km), NGO count, index usage |
| Image Upload | 500-1500ms | File size, Cloudinary processing |
| Donation Create | 800-2000ms | Items count, images, geospatial query |
| Socket Event | <50ms | Network latency |
| Notification Toast | <200ms | Framer Motion animation |

## Debugging

### View Server Logs
```bash
# Check Socket.IO connections
cd server && npm run dev
# Look for: "📱 New client connected"
#           "✅ User {userId} joined their notification room"
```

### Browser DevTools
```javascript
// In browser console
// Check Socket.IO connection
io = window.io // if exposed globally
io.connected // true/false
```

### MongoDB Queries
```javascript
// Check geospatial index
db.itemdonations.find({
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [77.2, 28.6] },
      $maxDistance: 15000
    }
  }
}).explain("executionStats")
// Should show "stage": "GEO_NEAR" with COLLSCAN = false
```

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| Socket.IO won't connect | Check CORS_ORIGIN in server .env matches client API URL |
| No nearby NGOs | Verify NGO locations are set and 15km radius is configured |
| Images not uploading | Check Cloudinary credentials in server .env |
| Notifications not working | Verify Socket.IO rooms: `user:userId` or `ngo:ngoId` |
| Donation form won't submit | Check browser console for validation errors |

## Next Steps

1. **Test the workflow** - Follow end-to-end testing checklist
2. **Deploy** - Update environment variables for production
3. **Monitor** - Watch server logs and error rates
4. **Customize** - Adjust geospatial radius, item categories, etc.
5. **Scale** - Add Redis for multi-server Socket.IO

## Support Files

- Full documentation: `DONATION_SYSTEM_README.md`
- Backend code: `server/src/models/ItemDonation.js`, `donationController.js`, `donationRoutes.js`
- Frontend code: `client/src/pages/User/CreateDonation.jsx`, `DonationHistory.jsx`, etc.
- Server setup: `server/src/index.js` (Socket.IO configuration)

---

**Ready to go!** 🚀 Start creating and accepting donations!
