# Help Request System Implementation

## Overview
I have successfully implemented the Help Request system, allowing users to post requests for assistance and NGOs to claim and fulfill them.

## 1. Backend Implementation
**Model:** `server/src/models/HelpRequest.js`
- Updated to include `visibility` (public/ngo_only) and `comments`.

**Controller:** `server/src/controllers/helpRequestController.js`
- `createHelpRequest`: Handles creation with image upload and visibility settings.
- `listHelpRequests`: Supports filtering by category, status, urgency, city, and visibility.
- `getHelpRequestById`: Fetches details with access control for private requests.
- `claimHelpRequest`: Allows NGOs to claim open requests (one NGO per request).
- `addComment`: Adds comments to the request.
- `updateStatus`: Updates status (e.g., to 'completed') and notifies parties.

**Routes:** `server/src/routes/helpRequestRoutes.js`
- Defined endpoints for all controller functions.
- Registered in `server/src/index.js`.

## 2. Frontend Implementation
**Create Request:** `client/src/pages/User/CreateHelpRequest.jsx`
- Form for users to submit requests with category, urgency, location, and images.

**List Page:** `client/src/pages/HelpRequests/HelpRequestList.jsx`
- Public listing with advanced filters (Category, Urgency, Status, City).
- Grid view of request cards.

**Detail Page:** `client/src/pages/HelpRequests/HelpRequestDetail.jsx`
- Shows full details, images, and status timeline.
- **NGOs:** "Claim Request" button (if open).
- **Requester/NGO:** "Mark Resolved" button.
- **Comments:** Integrated comment section for communication.

**NGO Dashboard:** `client/src/pages/NGO/HelpRequestManagement.jsx`
- Dashboard for NGOs to view:
  - **Active Claims:** Requests they are currently working on.
  - **New Opportunities:** Open requests available for claiming.

## 3. Real-time Notifications
- Integrated Socket.IO in the controller to emit events:
  - `help_request:created`: Notifies NGOs of new requests.
  - `help_request:claimed`: Notifies the requester when an NGO claims their request.
  - `help_request:comment`: Notifies relevant parties of new comments.
  - `help_request:status`: Notifies of status changes (e.g., resolved).

## How to Test
1. **User:** Go to `/user/create-help-request` to post a request.
2. **Public:** Go to `/help-requests` to browse listings.
3. **NGO:** 
   - Go to `/help-requests` or `/ngo/help-requests`.
   - Click a request -> "Claim Request".
   - Verify status changes to "In Progress".
4. **Communication:** Add comments on the detail page.
5. **Resolution:** Click "Mark Resolved" when done.
