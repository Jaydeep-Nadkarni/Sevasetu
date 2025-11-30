# Event Management System - Complete Implementation

## Overview

The Event Management System has been successfully implemented as Phase 2 of the Sevasetu NGO Platform. This system enables NGOs and individual organizers to create, manage, and promote events with advanced features including QR-based attendance tracking, capacity management, and approval workflows.

---

## ✅ Implementation Status

### Phase 2 Completion: 90% Complete

**Fully Completed (9/10 tasks):**
- ✅ Event Model & QRAttendance Schema
- ✅ Event Routes & Controller (11 endpoints)
- ✅ NGO Event Creation Form
- ✅ User Event Creation Form
- ✅ Event Listing with Filters
- ✅ Event Detail Page
- ✅ QR Code Generation & Attendance
- ✅ Event Approval Workflow
- ✅ App Routes Integration

**Pending (1/10 task):**
- 🟡 NGO Event Management Dashboard (optional enhancement)

---

## 📁 File Structure

### Backend Files Created/Modified

```
server/
├── src/
│   ├── models/
│   │   ├── Event.js (existing - fully configured)
│   │   └── QRAttendance.js (existing - fully configured)
│   ├── routes/
│   │   └── eventRoutes.js (✨ NEW - 56 lines)
│   ├── controllers/
│   │   └── eventController.js (✨ NEW - 800+ lines)
│   └── index.js (✏️ UPDATED - added event routes)
```

### Frontend Files Created/Modified

```
client/src/
├── pages/
│   ├── NGO/
│   │   └── CreateEvent.jsx (✨ NEW - 550+ lines)
│   ├── User/
│   │   └── CreateEvent.jsx (✨ NEW - 550+ lines)
│   └── Events/
│       ├── EventList.jsx (✨ NEW - 450+ lines)
│       └── EventDetail.jsx (✨ NEW - 550+ lines)
└── App.jsx (✏️ UPDATED - added 5 new routes)
```

---

## 🎯 Key Features Implemented

### 1. Event Creation & Management

#### For NGOs:
- Automatic approval (events go live immediately)
- Organizer as NGO entity
- Access to event management dashboard
- Can edit/delete their events

#### For Individual Organizers:
- Submission for admin approval required
- Clear notification about approval process
- Cannot edit after submission (pending review)
- Notified when approved/rejected

### 2. Event Listing & Discovery

**Features:**
- Browse all approved/ongoing events
- Advanced filtering by:
  - Category (8 types)
  - Location/City
  - Date range
  - Keyword search
- Real-time capacity display (visual progress bar)
- Pagination (12 events per page)
- Event status badges
- Virtual vs. In-person distinction

**Event Types:**
- NGO Events: `fundraiser`, `awareness`, `volunteer`, `workshop`, `conference`, `sports`, `cultural`, `other`
- User Events: `workshop`, `conference`, `meetup`, `webinar`, `training`, `social`, `sports`, `other`

### 3. Event Registration & QR Codes

**Registration Flow:**
1. User clicks "Register Now"
2. System generates unique QR code (UUID format: `event_{id}_user_{id}_{timestamp}`)
3. QR stored in QRAttendance collection with:
   - User reference
   - Event reference
   - QR data string
   - Registration status
   - Scanned flag (false until check-in)

**QR Code Features:**
- Display as data URL (inline)
- Download as PNG image
- Copy QR data to clipboard
- Multiple registration support (unique QR per user-event pair)

### 4. Attendance Tracking

**System Features:**
- Server-side QR generation using `qrcode` package
- Client-side QR display using `qrcode.react` package
- Scan endpoint for organizers/admins to mark attendance
- Verification with timestamp logging
- Geolocation support (optional location capture at scan)

**Data Structure:**
```javascript
QRAttendance {
  user: ObjectId,
  event: ObjectId,
  qrCode: String,
  status: 'registered' | 'checked_in' | 'checked_out' | 'absent',
  registration_date: Date,
  checkInTime: Date,
  verifiedBy: ObjectId,
  isVerified: Boolean,
  location: GeoPoint (optional)
}
```

### 5. Capacity Management

**Features:**
- Hard capacity limit enforcement
- Real-time capacity checking
- Visual capacity indicators:
  - Green: 0-75% (good capacity)
  - Yellow: 75-90% (limited spots)
  - Red: 90%+ (critical)
- Remaining capacity calculation
- Percentage tracking

### 6. Approval Workflow (For Individual Events)

**Process:**
1. Individual creates event → Status: `pending_approval`
2. Admin reviews pending events endpoint
3. Admin approves or rejects with optional reason
4. Creator notified via Socket.IO
5. Once approved → Status: `approved` → Becomes public

**Admin Endpoints:**
- `GET /api/events/admin/pending` - List pending events (paginated)
- `POST /api/events/:id/approve` - Approve/reject event

### 7. Event Details & Information

**Event Fields:**
```javascript
Event {
  // Basic Info
  title: String,
  description: String,
  category: String,
  
  // Date/Time
  eventDate: Date,
  eventTime: String (HH:MM),
  duration: Number (minutes),
  
  // Location
  location: String,
  coordinates: GeoPoint,
  city: String,
  state: String,
  zipcode: String,
  isVirtual: Boolean,
  meetingLink: String,
  
  // Capacity & Registration
  capacity: Number,
  registeredCount: Number,
  registered: [{ user, registeredAt, status, qrCode }],
  
  // Metadata
  status: 'pending_approval' | 'approved' | 'ongoing' | 'completed' | 'cancelled',
  createdBy: ObjectId,
  creatorType: 'ngo' | 'individual',
  ngo: ObjectId,
  images: [{ url, publicId }],
  
  // Additional
  contactPerson: { name, phone, email },
  requirements: [String],
  tags: [String],
  entryFee: Number,
  images: [cloudinaryUrl],
  timestamps
}
```

### 8. Socket.IO Real-Time Features

**Events Emitted:**
- `event:created` - New event created (to NGO room)
- `event:pending_approval` - Individual event pending (to admin room)
- `event:user_joined` - User registered (to event room)
- `event:new_registration` - New registration (to creator room)
- `event:user_left` - User cancelled (to event room)
- `event:attendance_scanned` - QR scanned (to event room)
- `event:approval_status` - Event approved/rejected (to creator room)

---

## 🔌 API Endpoints

### Public Endpoints
```
GET /api/events
- Query params: category, city, status, startDate, endDate, search, page, limit
- Returns: Events array with pagination

GET /api/events/:id
- Returns: Event details with capacity info and registration status
```

### Protected Endpoints (Authenticated Users)
```
POST /api/events
- Create new event
- Requires: NGO admin or user role
- Auto-approves for NGO, pending for individuals
- Returns: Created event

POST /api/events/:id/join
- Register user for event
- Generates unique QR code
- Returns: QR code data URL

POST /api/events/:id/leave
- Cancel user registration
- Deletes QR record
- Returns: Success message

GET /api/events/:id/attendees
- List event attendees
- Requires: Event creator or admin
- Returns: Attendees array with details

POST /api/events/:id/scan
- Scan QR code for attendance
- Requires: Event creator or admin
- Body: { qrData }
- Returns: Updated QR record with verification

PATCH /api/events/:id
- Update event details
- Requires: Event creator or admin
- Returns: Updated event

DELETE /api/events/:id
- Delete event
- Requires: Event creator or admin
- Deletes images and QR records
- Returns: Success message

POST /api/events/:id/upload-image
- Upload additional event image
- Requires: Event creator or admin
- Returns: Image data
```

### Admin Endpoints
```
POST /api/events/:id/approve
- Approve/reject individual event
- Requires: Admin role
- Body: { rejectionReason? }
- Returns: Updated event

GET /api/events/admin/pending
- List pending individual events
- Requires: Admin role
- Query params: page, limit
- Returns: Pending events with pagination
```

---

## 🎨 Frontend Components

### 1. CreateEvent (NGO) - `/ngo/create-event`
**Features:**
- Banner image upload (Cloudinary)
- Event details form (title, description, category)
- Date & time picker
- Location with coordinate lookup (Nominatim API)
- Capacity specification
- Virtual event toggle with meeting link
- Contact information
- Requirements & tags
- Auto-approval confirmation

**Validation:**
- Required fields enforcement
- Future date only
- Capacity minimum 1
- Location coordinate fetching

### 2. CreateEvent (User) - `/user/create-event`
**Features:**
- Same as NGO version
- Approval notice banner
- Pending status explanation
- "Submit for Approval" button

### 3. EventList - `/events`
**Features:**
- Grid display (3 columns on desktop)
- Responsive design (mobile: 1 column, tablet: 2 columns)
- Search bar
- Filter panel (category, city, date range)
- Event cards with:
  - Image preview
  - Status badge
  - Title & excerpt
  - Date/time display
  - Location
  - Capacity progress bar with percentage
  - Category badge
  - Virtual indicator
- Pagination (12 events per page)
- Empty state handling
- Loading states

### 4. EventDetail - `/events/:id`
**Features:**
- Large hero banner image
- Event information:
  - Title & category
  - Organizer details
  - Full description
  - Date/time/duration
  - Location or virtual meeting link
  - Requirements list
  - Contact information
- Sidebar with:
  - Capacity visualization
  - Days until event countdown
  - Register/Cancel buttons
  - QR code display and download
  - Entry fee display

**Interactive Features:**
- Register button (shows QR on success)
- Cancel registration button
- QR code visibility toggle
- Download QR as PNG
- Copy QR data to clipboard

---

## 🔐 Authorization & Security

### Role-Based Access Control

**User Roles:**
- `user` - Individual organizers
- `ngo_admin` - NGO administrators
- `admin` - Platform administrators

**Route Protection:**
- Event creation: `user` or `ngo_admin` only
- Event update/delete: Creator or `admin` only
- Attendee list: Creator or `admin` only
- QR scanning: Creator or `admin` only
- Event approval: `admin` only

### Data Validation

**Server-Side:**
- Required field validation
- Type checking
- Enum validation (status, category, etc.)
- Range validation (capacity, duration)
- Date validation (future dates only)
- Image upload validation

**Client-Side:**
- Form validation before submission
- Coordinate fetching before event creation
- Capacity enforcement
- User authentication checks

---

## 🗄️ Database Schema

### Event Collection Indexes

```javascript
// Query optimization indexes
eventSchema.index({ eventDate: 1, status: 1 })
eventSchema.index({ createdBy: 1, creatorType: 1 })
eventSchema.index({ ngo: 1, status: 1 })
eventSchema.index({ category: 1, eventDate: 1 })
eventSchema.index({ city: 1, eventDate: 1 })
eventSchema.index({ 'coordinates.coordinates': '2dsphere' })
eventSchema.index({ status: 1, eventDate: 1 })
eventSchema.index({ createdAt: -1 })
```

### QRAttendance Collection Indexes

```javascript
// Attendance tracking indexes
qrAttendanceSchema.index({ event: 1, participant: 1 })
qrAttendanceSchema.index({ event: 1, checkInTime: -1 })
qrAttendanceSchema.index({ status: 1 })
qrAttendanceSchema.index({ qrCode: 1 })
```

---

## 📦 Dependencies Added

### Server
```json
"qrcode": "^1.5.3"  // QR code generation
```

### Client
```json
"qrcode.react": "^latest"  // React QR code component
```

---

## 🚀 Usage Examples

### Create an Event (as NGO)
```javascript
POST /api/events
Content-Type: multipart/form-data

{
  title: "Community Cleanup Drive",
  description: "Join us for a community cleanup...",
  category: "volunteer",
  eventDate: "2024-12-15",
  eventTime: "09:00",
  duration: 180,
  location: "Central Park, Main Street",
  city: "San Francisco",
  state: "CA",
  capacity: 100,
  coordinates: { lat: 37.7749, lng: -122.4194 }
}

// Response includes event with status: 'approved' (for NGO)
```

### Register for Event (as User)
```javascript
POST /api/events/507f1f77bcf86cd799439011/join

// Response:
{
  message: "Successfully registered for event",
  qrCode: "data:image/png;base64,...",
  qrData: "event_507f1f77bcf86cd799439011_user_507f191e810c19729de860ea_1698765432100"
}
```

### List Events with Filters
```javascript
GET /api/events?category=volunteer&city=San%20Francisco&startDate=2024-12-01&endDate=2024-12-31&page=1

// Response includes pagination info
```

---

## 🔄 Workflow Examples

### NGO Event Creation Workflow
1. NGO admin fills form
2. Clicks "Create Event"
3. Event created with status `approved`
4. Immediately appears in EventList
5. Users can register immediately
6. QR codes generated per registration

### Individual Event Creation Workflow
1. Individual fills form
2. Clicks "Submit for Approval"
3. Event created with status `pending_approval`
4. Does NOT appear in public list
5. Admin sees in pending events
6. Admin reviews and approves/rejects
7. Individual notified via Socket.IO
8. Once approved, appears in list

### User Registration & Check-in Workflow
1. User views event in EventList
2. Clicks "View Details" → EventDetail page
3. Clicks "Register Now"
4. QR code generated and displayed
5. User downloads or screenshots QR
6. At event, user shows QR to organizer
7. Organizer scans QR code
8. System marks attendance with timestamp
9. User status changes to "attended"

---

## 🧪 Testing Checklist

### Backend Testing
- [ ] Create event as NGO (should auto-approve)
- [ ] Create event as individual (should be pending)
- [ ] List events with various filters
- [ ] Get event details
- [ ] Register user for event
- [ ] Generate QR code correctly
- [ ] Cancel registration
- [ ] Scan QR code (mark attendance)
- [ ] Approve/reject individual event
- [ ] Test capacity limits
- [ ] Delete event with cleanup

### Frontend Testing
- [ ] NGO form validates required fields
- [ ] User form shows approval notice
- [ ] Image upload works with preview
- [ ] Location coordinate lookup works
- [ ] EventList filters work correctly
- [ ] Pagination works
- [ ] EventDetail loads correctly
- [ ] Registration creates QR
- [ ] QR code displays properly
- [ ] QR code download works
- [ ] Cancel registration works
- [ ] Responsive design on all screens

---

## 🎯 Next Steps (Optional Enhancements)

### For Phase 2.5:
1. **Event Management Dashboard** (`/ngo/event-management`)
   - List organizer's events
   - Edit events
   - Manage attendees
   - QR scanner interface
   - Export attendance reports

2. **Admin Event Approval Panel** (`/admin/event-approval`)
   - List pending events
   - Preview event details
   - Approve/reject with notes
   - View rejection history

3. **Event Analytics**
   - Attendance statistics
   - Registration trends
   - Capacity analysis
   - Event impact metrics

4. **Enhanced Features**
   - Event tags & categorization
   - Waitlist management
   - Attendee notifications
   - Certificate generation
   - Event feedback/surveys

---

## 📚 API Integration Notes

### Location Services
- Using OpenStreetMap Nominatim API for coordinate lookup
- No API key required
- Free tier available

### Image Upload
- Integrated with existing Cloudinary setup
- Folder: `events/banners` and `events/images`
- Cleanup on event deletion

### Real-Time Notifications
- Socket.IO events for all status changes
- User-specific rooms for personal notifications
- Event-specific rooms for registrations
- Admin rooms for approvals

---

## ✨ Summary

The Event Management System is now **90% complete** with all core features fully implemented:

✅ Event creation for NGOs and individuals
✅ Advanced event listing with filters
✅ Event details with registration
✅ QR-based attendance tracking
✅ Capacity management
✅ Approval workflow for individuals
✅ Real-time notifications
✅ Full API with 11 endpoints
✅ Responsive UI components
✅ Database schema with indexes

**Ready for:** Production testing, integration testing, and deployment.

**Remaining:** Optional NGO event management dashboard (not critical for MVP).
