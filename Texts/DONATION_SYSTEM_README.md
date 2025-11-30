# 🎁 Donation System - Complete Implementation Guide

## Overview

This is an enterprise-grade donation management system for the NGO platform with real-time notifications, geospatial auto-assignment, and complete lifecycle management.

## Features

### ✨ Core Features

1. **Item Donation Creation** - Users can donate food, clothes, essentials, medical supplies, electronics, books, and more
2. **Geospatial Auto-Assignment** - Donations automatically assigned to the 3 nearest NGOs within 15km radius using MongoDB's geospatial queries
3. **Real-time Notifications** - Socket.IO integration for instant notifications when donations are accepted, completed, or cancelled
4. **NGO Management Interface** - NGOs can view available donations, accept/reject, manage pickups
5. **Donation History** - Users can track all their donations with detailed history and timeline
6. **Activity Logging** - Complete audit trail of all donation state changes
7. **Image Upload** - Support for up to 5 product images via Cloudinary
8. **Pickup Scheduling** - Flexible scheduling with preferred dates and flexible timing options
9. **Multi-Status Tracking** - Donations progress through: pending → accepted → in-progress → completed

## Architecture

### Backend Stack

- **Express.js 4.18.2** - REST API framework
- **Node.js** - Runtime environment
- **MongoDB** with **Mongoose 7.5.0** - Database with geospatial indexing
- **Socket.IO 4.x** - Real-time bidirectional communication
- **Cloudinary** - Image storage and management
- **JWT** - Authentication and authorization

### Frontend Stack

- **React 18.2.0** - UI library
- **Redux Toolkit** - State management
- **React Router v6** - Client-side routing
- **Socket.IO Client** - Real-time notifications
- **Tailwind CSS** - Styling with dark mode support
- **Framer Motion** - Animations and transitions
- **Axios** - HTTP client with auto-refresh

### Database Schema

#### ItemDonation Model

```javascript
{
  donor: ObjectId (User ref),
  items: [{
    category: 'food'|'clothes'|'essentials'|'medical'|'electronics'|'books'|'other',
    description: String,
    quantity: Number,
    unit: 'kg'|'lbs'|'pieces'|'boxes'|'items'|'liters'|'packs'|'count',
    qualityCondition: 'new'|'like-new'|'good'|'fair'|'used',
    expiryDate: Date (optional)
  }],
  location: {
    type: 'Point',
    coordinates: [longitude, latitude], // GeoJSON format
    address: String,
    city: String,
    state: String,
    zipcode: String
  },
  images: [{
    url: String (Cloudinary URL),
    publicId: String (Cloudinary ID for deletion)
  }],
  status: 'pending'|'accepted'|'in-progress'|'completed'|'cancelled'|'rejected',
  assignedNGOs: [{
    ngo: ObjectId (NGO ref),
    distanceKm: Number,
    assignedAt: Date,
    status: 'pending'|'accepted'|'rejected',
    acceptedAt: Date,
    completedAt: Date,
    notes: String,
    contactAttempts: Number
  }],
  primaryNGO: ObjectId (NGO ref),
  pickupSchedule: {
    preferredDate: Date,
    preferredTime: String,
    isFlexible: Boolean,
    actualPickupDate: Date
  },
  contactPerson: {
    name: String (required),
    phone: String (required),
    email: String
  },
  specialInstructions: String,
  accessInstructions: String,
  activityLog: [{
    action: 'created'|'accepted'|'rejected'|'completed'|'cancelled',
    ngo: ObjectId,
    timestamp: Date,
    message: String,
    changedBy: ObjectId (User ref)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes

```javascript
// Geospatial index for location-based queries
location.coordinates: '2dsphere'

// Query optimization indexes
donor + createdAt (compound)
assignedNGOs.ngo
status
items.category
createdAt
```

## API Endpoints

### User Routes (`/api/donations`)

#### Create Donation
```
POST /api/donations
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
{
  items: JSON.stringify([{category, description, quantity, unit, qualityCondition, expiryDate}]),
  location: JSON.stringify({coordinates: [lon, lat], address, city, state, zipcode}),
  contactPerson: JSON.stringify({name, phone, email}),
  pickupSchedule: JSON.stringify({preferredDate, preferredTime, isFlexible}),
  specialInstructions: "...",
  accessInstructions: "...",
  images: [File, File, ...]
}

Response:
{
  _id: "...",
  donor: {...},
  status: "pending",
  assignedNGOs: [{ngo, distanceKm, status}]
}
```

#### Get User's Donations
```
GET /api/donations/my
Headers: Authorization: Bearer <token>

Response:
{
  donations: [{...}, {...}],
  total: 10
}
```

#### Get Single Donation
```
GET /api/donations/:id
Headers: Authorization: Bearer <token>
```

#### Cancel Donation
```
DELETE /api/donations/:id
Headers: Authorization: Bearer <token>
```

### NGO Routes (`/api/donations`)

#### Get Available Donations
```
GET /api/donations/available
Headers: Authorization: Bearer <token>

Filters:
?category=food&status=pending&distance=15

Response: Array of donations in geospatial proximity
```

#### Get Assigned Donations
```
GET /api/donations/assigned
Headers: Authorization: Bearer <token>

Response: Array of donations assigned to this NGO
```

#### Accept Donation
```
PATCH /api/donations/:id/accept
Headers: Authorization: Bearer <token>

Body: {notes: "..."}

Socket Event Emitted:
donation:accepted {donationId, donorId, ngoId, ngoName}
```

#### Reject Donation
```
PATCH /api/donations/:id/reject
Headers: Authorization: Bearer <token>

Body: {reason: "..."}
```

#### Mark Complete
```
PATCH /api/donations/:id/complete
Headers: Authorization: Bearer <token>

Body: {actualPickupDate: "2024-01-20"}

Socket Event Emitted:
donation:completed {donationId, donorId, ngoId}
```

### Search Routes

#### List All Donations
```
GET /api/donations?category=food&status=pending&city=Delhi&page=1&limit=10
```

#### Search Donations
```
GET /api/donations/search?q="basmati rice"&category=food&status=pending&limit=50
```

## Geospatial Algorithm

### Auto-Assignment Process

1. **Location Extraction** - Extract donor's coordinates [longitude, latitude]
2. **Database Query** - Use MongoDB `$near` operator with 15km radius:
   ```javascript
   NGO.find({
     location: {
       $near: {
         $geometry: { type: 'Point', coordinates: [lon, lat] },
         $maxDistance: 15000 // meters
       }
     },
     isActive: true
   })
   ```
3. **Result Processing**
   - Take top 3 nearest NGOs
   - Calculate distance using Haversine formula (verification)
   - Assign scoring: 10 points (1st), 8 points (2nd), 6 points (3rd)

4. **Haversine Distance Calculation**
   ```javascript
   const R = 6371 // Earth's radius in km
   const dLat = ((lat2 - lat1) * Math.PI) / 180
   const dLon = ((lon2 - lon1) * Math.PI) / 180
   const a = Math.sin(dLat/2)*Math.sin(dLat/2) + 
             Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*
             Math.sin(dLon/2)*Math.sin(dLon/2)
   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
   return R * c // distance in km
   ```

### Configuration (Adjustable)

```javascript
const SEARCH_RADIUS_METERS = 15000  // 15km (change for different coverage)
const MAX_ASSIGNMENTS = 3            // Assign to top 3 NGOs
```

## Real-Time Notifications

### Socket.IO Architecture

#### Server Setup (`server/src/index.js`)

```javascript
import { Server } from 'socket.io'
import { createServer } from 'http'

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    credentials: true
  }
})

// User joins personal notification room
socket.on('user:join', userId => {
  socket.join(`user:${userId}`)
})

// NGO joins personal notification room
socket.on('ngo:join', ngoId => {
  socket.join(`ngo:${ngoId}`)
})
```

#### Events Emitted

1. **Donation Accepted**
   ```javascript
   io.to(`user:${donorId}`).emit('donation:accepted', {
     donationId,
     donorId,
     ngoId,
     ngoName
   })
   ```

2. **Donation Completed**
   ```javascript
   io.to(`user:${donorId}`).emit('donation:completed', {
     donationId,
     donorId,
     ngoId
   })
   ```

3. **Donation Cancelled**
   ```javascript
   io.to(`ngo:${ngoId}`).emit('donation:cancelled', {
     donationId
   })
   ```

#### Client Listener Setup

```javascript
import { io } from 'socket.io-client'

const socket = io('http://localhost:5000', {
  reconnection: true,
  reconnectionAttempts: 5,
  auth: { userId, userType }
})

socket.on('donation:accepted', (data) => {
  // Show notification to user
})

socket.on('donation:completed', (data) => {
  // Show notification to user
})
```

## Frontend Components

### 1. CreateDonation.jsx (`/user/create-donation`)

**Features:**
- Multi-item donation form
- Image upload (up to 5 images)
- GPS location detection with manual fallback
- Item categories dropdown
- Quantity/unit selection
- Quality condition selection
- Expiry date for perishables
- Pickup schedule with flexible timing
- Special instructions and access notes
- Real-time validation

**Key Functions:**
- `getLocation()` - Get user's GPS coordinates
- `handleItemChange()` - Update item fields
- `handleImagesSelected()` - Process image uploads
- `validateForm()` - Client-side validation
- `handleSubmit()` - Create donation via API

**Styling:**
- Responsive grid layout
- Dark mode support
- Framer Motion animations
- Tailwind CSS gradients

### 2. DonationHistory.jsx (`/user/donations`)

**Features:**
- Display user's donations in card grid
- Filter by status (all, pending, accepted, in-progress, completed, cancelled)
- Donation cards with:
  - Image preview
  - Status badge with icon
  - Items summary
  - Location display
  - Assigned NGOs count
- Detail modal showing:
  - Full item details with expiry dates
  - Location with access instructions
  - Assigned NGOs with distances
  - Activity timeline
  - Contact information
- Cancel donation with confirmation
- "Create New Donation" button

**State Management:**
- Local state for donations, filters, selected donation
- Redux integration for notifications

### 3. DonationManagement.jsx (`/ngo/donations`)

**Features:**
- Tabbed interface (Available, Accepted, In-Progress, Completed)
- Donation cards with:
  - Donor information
  - Distance calculation
  - Quick contact buttons (call/email)
  - Status badges
- Detail modal with:
  - Full donation items list
  - Donor contact info with clickable links
  - Pickup location and schedule
  - Special handling instructions
- Action buttons:
  - Accept donation with optional notes
  - Reject with reason modal
  - Mark complete with date picker
- Responsive layout with Tailwind CSS

**Key Functions:**
- `fetchDonations()` - Load donations by tab
- `handleAccept()` - Accept donation with API call
- `handleReject()` - Reject with reason
- `handleComplete()` - Mark pickup complete

### 4. Notifications.jsx (`client/src/components/Notifications.jsx`)

**Features:**
- Floating notification bell icon with unread count badge
- Toast notifications (top-right, auto-dismiss after 5s)
- Notification history panel
- Connection status indicator (green/red dot)
- Socket.IO automatic reconnection
- Personal room joining (`user:userId` or `ngo:ngoId`)
- Listen for donation events

**Socket Events Listened:**
- `donation:accepted` - NGO accepted donation
- `donation:completed` - Pickup completed
- `donation:cancelled` - Donation cancelled
- `ngo:contacted` - NGO contact message

**UI Components:**
- Bell icon button (bottom-right)
- Unread count badge
- Toast notification cards
- History panel (slide-out from right)
- Clear all notifications button
- Relative timestamps ("5m ago")

## Integration with App.jsx

```javascript
// Import components
import CreateDonation from './pages/User/CreateDonation'
import DonationHistory from './pages/User/DonationHistory'
import DonationManagement from './pages/NGO/DonationManagement'
import Notifications from './components/Notifications'

// Add routes
<Route path="/user/create-donation" element={<CreateDonation />} />
<Route path="/user/donations" element={<DonationHistory />} />
<Route path="/ngo/donations" element={<DonationManagement />} />

// Add notification component (inside Router, before Routes)
{isAuthenticated && user && (
  <Notifications 
    userId={user._id}
    userType={user.role === 'ngo_admin' ? 'ngo' : 'donor'}
  />
)}
```

## Testing Workflow

### 1. Create a Donation (User)
1. Navigate to `/user/create-donation`
2. Add item details (food, clothes, etc.)
3. Upload 1-5 product images
4. Click "Use My Current Location" or enter address manually
5. Fill contact information
6. Submit form
7. Should see success notification and redirect to donations history

### 2. Accept Donation (NGO)
1. Navigate to `/ngo/donations`
2. View "Available" tab (should see donations from nearby donors)
3. Click on a donation card
4. Click "Accept Donation"
5. Should see real-time notification on donor's account

### 3. Mark Complete (NGO)
1. After accepting, donation shows in "Accepted" tab
2. Click on donation, then "Mark as Complete"
3. Select actual pickup date
4. Donor receives real-time notification

### 4. Real-Time Notifications
1. User donates items in one browser/device
2. NGO accepts in another browser/device
3. User should see notification toast automatically
4. Check notification history by clicking bell icon

## Environment Setup

### Server Environment Variables

```bash
# .env file in server/
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ngo-platform
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
NODE_ENV=development
```

### Client Environment Variables

```bash
# .env.local file in client/
VITE_API_URL=http://localhost:5000
VITE_MODE=development
```

## Deployment Considerations

1. **Geospatial Index** - Ensure MongoDB has 2dsphere index on location.coordinates
2. **CORS Configuration** - Update CORS_ORIGIN for production domain
3. **Socket.IO** - Use Redis adapter for multi-server deployment
4. **Image Storage** - Cloudinary handles scaling automatically
5. **Database Backups** - Regular MongoDB backups recommended
6. **SSL/TLS** - Enable HTTPS and WSS for secure connections

## Performance Optimization

### Database Queries
- Geospatial queries use 2dsphere index (~50-100ms for 15km radius)
- Compound indexes on frequent filters
- Pagination on donation list (default 10 per page)

### Frontend
- Code splitting with React.lazy()
- Image lazy loading with Intersection Observer
- Socket.IO reconnection with exponential backoff
- Redux selectors for memoized state updates

### API Responses
- Populate only required fields
- Pagination limits (max 50 results per request)
- Compression middleware enabled

## Troubleshooting

### Issue: Socket.IO Connection Fails
**Solution:** Check CORS configuration in server/src/index.js matches client API URL

### Issue: Geospatial Queries Return Empty
**Solution:** Verify 2dsphere index exists:
```javascript
db.itemdonations.getIndexes()
// Should show: "location_2dsphere"
```

### Issue: Images Not Uploading
**Solution:** Verify Cloudinary credentials and check multer file size limits (default 5MB)

### Issue: NGO Distance Calculation Incorrect
**Solution:** Verify coordinates are [longitude, latitude] (GeoJSON standard)

## Future Enhancements

1. **Search Optimization** - Full-text search on item descriptions
2. **Rating System** - NGO ratings based on completion
3. **Impact Analytics** - Dashboard showing donation statistics
4. **Mobile App** - React Native version
5. **Payment Integration** - Monetary donations
6. **Bulk Donations** - API for organizational donations
7. **Custom Notifications** - User preference management
8. **Delivery Tracking** - Real-time location updates

## Support & Contribution

For issues, feature requests, or contributions, please refer to the project's GitHub repository.

---

**Created:** January 2024  
**Last Updated:** January 2024  
**Version:** 1.0.0
