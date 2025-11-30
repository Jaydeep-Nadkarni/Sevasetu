# Event System - Quick Start Guide

## 🚀 Getting Started

The Event Management System has been fully integrated into your Sevasetu platform. Here's how to use it:

---

## 📋 Pre-Requisites

✅ Server dependencies installed:
```bash
npm install qrcode  # QR code generation
```

✅ Client dependencies installed:
```bash
npm install qrcode.react  # QR code React component
```

✅ Database models created:
- Event model (with approval workflow)
- QRAttendance model (with attendance tracking)

✅ Routes configured in server

✅ Components integrated in React frontend

---

## 🎯 Quick Test Scenarios

### Scenario 1: NGO Creates Event (Auto-Approved)

**Steps:**
1. Login as NGO Admin
2. Navigate to `/ngo/create-event`
3. Fill in event details:
   - Title: "Community Cleanup Drive"
   - Description: "Help us clean our community"
   - Category: "volunteer"
   - Date: Tomorrow's date
   - Time: 09:00
   - Location: Your city
   - Capacity: 50
4. Upload a banner image (optional)
5. Click "Create Event"

**Expected Result:**
- Event created with status `approved`
- Redirects to events page
- Event appears immediately in `/events` list

---

### Scenario 2: Individual Creates Event (Pending Approval)

**Steps:**
1. Login as Regular User
2. Navigate to `/user/create-event`
3. Notice the blue "Approval Required" banner
4. Fill in same details as above
5. Click "Submit Event for Approval"

**Expected Result:**
- Event created with status `pending_approval`
- Blue notification shows "Pending admin approval"
- Event does NOT appear in public events list
- Admin sees in pending events

---

### Scenario 3: User Registers for Event

**Steps:**
1. Navigate to `/events`
2. Browse or search for an event
3. Click on an event card → `/events/:id`
4. Click "Register Now"

**Expected Result:**
- QR code generated and displayed
- Button changes to "Show QR Code"
- User sees:
  - QR code image
  - Download QR button
  - Copy QR Data button
- Event capacity updates in real-time
- User can cancel registration

---

### Scenario 4: Admin Approves Individual Event

**Steps:**
1. Login as Admin
2. Call API endpoint: `GET /api/events/admin/pending`
3. Review pending event
4. Call API: `POST /api/events/:id/approve`
5. Event creator receives notification

**Expected Result:**
- Event status changes to `approved`
- Creator notified via Socket.IO
- Event now appears in public list

---

## 🔧 API Testing with curl/Postman

### Create Event (NGO)
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Community Event" \
  -F "description=Join us!" \
  -F "category=volunteering" \
  -F "eventDate=2024-12-25" \
  -F "eventTime=10:00" \
  -F "duration=120" \
  -F "location=Main Street" \
  -F "city=San Francisco" \
  -F "capacity=100" \
  -F "banner=@/path/to/image.jpg"
```

### List Events with Filters
```bash
curl "http://localhost:5000/api/events?category=volunteer&city=San%20Francisco&page=1"
```

### Register for Event
```bash
curl -X POST http://localhost:5000/api/events/EVENT_ID/join \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Scan QR Code (Mark Attendance)
```bash
curl -X POST http://localhost:5000/api/events/EVENT_ID/scan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qrData": "event_ID_user_ID_timestamp"}'
```

### Get Pending Events (Admin)
```bash
curl "http://localhost:5000/api/events/admin/pending?page=1" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Approve Event (Admin)
```bash
curl -X POST http://localhost:5000/api/events/EVENT_ID/approve \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 🧪 Frontend Routes for Testing

### Event Routes Available:

| Route | Role | Purpose |
|-------|------|---------|
| `/events` | Public | Browse all events |
| `/events/:id` | Public | View event details |
| `/ngo/create-event` | NGO Admin | Create new event |
| `/user/create-event` | User | Submit event for approval |
| `/ngo/event-management` | NGO Admin | Coming Soon |
| `/admin/event-approval` | Admin | Coming Soon |

---

## 📊 Testing Checklist

### Backend Functionality
- [ ] NGO can create event (status: approved)
- [ ] User can create event (status: pending_approval)
- [ ] Events list with filters works
- [ ] Event details load correctly
- [ ] User can register for event
- [ ] QR code generates correctly
- [ ] User can cancel registration
- [ ] Admin can view pending events
- [ ] Admin can approve event
- [ ] Admin can reject event with reason
- [ ] Capacity limits enforced
- [ ] Full capacity shows error

### Frontend UX
- [ ] Create event form validates required fields
- [ ] Image upload shows preview
- [ ] Location lookup works (coordinates fetched)
- [ ] Event list displays correctly
- [ ] Filters work (category, city, date)
- [ ] Pagination works
- [ ] Event detail page loads
- [ ] Register button generates QR
- [ ] QR code displays properly
- [ ] QR download works
- [ ] Cancel registration works
- [ ] Mobile responsive design

### Real-Time Features (Socket.IO)
- [ ] Event created notification sent to NGO
- [ ] Event pending notification sent to admin
- [ ] Registration notification sent to creator
- [ ] Attendance scanned notification sent to event room
- [ ] Approval notification sent to creator

---

## 🐛 Common Issues & Solutions

### Issue: QR Code Not Displaying
**Solution:**
- Check if `qrcode.react` package is installed
- Verify QR data is being returned from API
- Check browser console for errors

### Issue: Event Not Appearing in List
**Solution:**
- Check event status (must be 'approved' for public view)
- If individual event, ensure admin approved it
- Check filters aren't excluding the event

### Issue: Registration Fails with "Event Full"
**Solution:**
- Check event capacity in database
- Verify registeredCount is accurate
- Clear registrations if needed for testing

### Issue: Coordinates Not Found
**Solution:**
- Check location and city are entered correctly
- Verify Nominatim API is accessible
- Try different location format (e.g., full address)

### Issue: Admin Can't See Pending Events
**Solution:**
- Verify user has `admin` role in database
- Check JWT token includes admin role
- Ensure user is authenticated

---

## 📝 Sample Test Data

### Event to Create:
```json
{
  "title": "Tech Community Meetup",
  "description": "Join us for networking and learning about latest tech trends",
  "category": "workshop",
  "eventDate": "2024-12-20",
  "eventTime": "18:30",
  "duration": 120,
  "location": "123 Tech Street, Suite 100",
  "city": "San Francisco",
  "state": "CA",
  "zipcode": "94105",
  "capacity": 75,
  "isVirtual": false,
  "entryFee": 0,
  "contactPersonName": "John Doe",
  "contactPersonPhone": "+1-555-0123",
  "contactPersonEmail": "john@example.com"
}
```

---

## 🔗 Integration Points

### With Existing Systems:

✅ **Authentication:**
- Uses existing JWT token system
- User roles: user, ngo_admin, admin

✅ **Database:**
- MongoDB integration
- Collections: events, qr_attendance
- Proper indexing for performance

✅ **Image Upload:**
- Cloudinary integration
- Folders: events/banners, events/images
- Auto-cleanup on event deletion

✅ **Real-Time:**
- Socket.IO notifications
- Event rooms for broadcasts
- User rooms for personal notifications

✅ **UI Framework:**
- React + Redux
- Tailwind CSS styling
- Framer Motion animations
- Lucide React icons

---

## 📈 Performance Notes

### Database Indexes:
- Event queries optimized with 8 indexes
- Attendance queries optimized with 4 indexes
- Geospatial queries supported (2dsphere)

### API Performance:
- Pagination: 12 events per page
- Proper error handling
- Transaction support for critical operations

### Frontend Performance:
- Lazy loading images
- Component code splitting
- Memoization where needed
- Debounced search/filter

---

## 🔐 Security Features

✅ **Authorization:**
- Event creator can only edit own events
- Only admin can approve events
- QR scanning limited to creator/admin

✅ **Data Validation:**
- Server-side validation on all inputs
- Type checking & enum validation
- Range validation for capacity/duration

✅ **Image Security:**
- File type validation
- Size limits enforced
- Cloudinary security

✅ **Attendance Verification:**
- Unique QR codes per registration
- Timestamp tracking
- Verification by authorized users only

---

## 📞 Support & Documentation

### Files Created:
- `server/src/routes/eventRoutes.js` - API routes
- `server/src/controllers/eventController.js` - API handlers
- `client/src/pages/NGO/CreateEvent.jsx` - NGO form
- `client/src/pages/User/CreateEvent.jsx` - User form
- `client/src/pages/Events/EventList.jsx` - Event browser
- `client/src/pages/Events/EventDetail.jsx` - Event details
- `EVENT_SYSTEM_IMPLEMENTATION.md` - Full documentation

### Next Steps:
1. Run through all test scenarios above
2. Test with your own data
3. Check Socket.IO notifications in dev tools
4. Review API responses in Network tab
5. Test on mobile devices for responsive design

---

## ✨ What's Next?

**Phase 2.5 (Optional Enhancements):**
- [ ] NGO Event Management Dashboard
- [ ] Admin Event Approval Panel
- [ ] Event Analytics & Reports
- [ ] Attendee Feedback/Surveys
- [ ] Certificate Generation

**For Production:**
- [ ] Load testing with sample events
- [ ] Email notifications integration
- [ ] SMS reminders for upcoming events
- [ ] Payment integration (for paid events)
- [ ] Event refund workflow

---

Good luck testing! 🎉
