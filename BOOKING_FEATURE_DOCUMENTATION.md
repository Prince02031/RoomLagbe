# Visit Request (Booking) Feature Documentation

## Overview

The Visit Request feature allows students to schedule visits to apartments/rooms they're interested in. Owners can approve or reject these requests. The system enforces a 2-hour time blocking rule to prevent conflicts.

## Features Implemented

### 1. **Database Schema Updates**
- Added `visit_time` column to the `booking` table (TIMESTAMPTZ)
- Created indexes for efficient time conflict queries
- Migration file: `backend/src/config/migration-add-visit-time.sql`

### 2. **Backend Implementation**

#### Models (`backend/src/models/booking.model.js`)
- **`create`**: Creates new booking with visit_time
- **`checkTimeConflict`**: Validates 2-hour time blocking rule
  - Prevents bookings within 2 hours before/after approved visits
  - Returns conflicting booking details if found
- **`getApprovedVisitsForDate`**: Gets all approved visits for a listing on a specific date
- **`findByStudent`**: Includes owner contact information
- **`findByOwner`**: Includes student contact information

#### Services (`backend/src/services/booking.service.js`)
- **`createBooking`**: Creates visit request with validation
- **`updateBookingStatus`**: Approves/rejects requests with time conflict checking
  - Validates time conflicts before approving
  - Returns detailed error message if conflict exists
- **`getApprovedVisits`**: Gets approved visits for availability display

#### Controllers (`backend/src/controllers/booking.controller.js`)
- **POST `/bookings`**: Create new visit request (students only)
- **PATCH `/bookings/:id/status`**: Approve/reject request (owners only)
- **GET `/bookings/student`**: Get student's visit requests
- **GET `/bookings/owner`**: Get owner's visit requests
- **GET `/bookings/listing/:listingId/visits`**: Get approved visits (with date filter)

#### Routes (`backend/src/routes/booking.routes.js`)
All routes are protected with authentication middleware.

### 3. **Frontend Implementation**

#### Student Dashboard (`frontend/src/app/components/StudentDashboard.jsx`)
- **Visit Requests Section**: 
  - Shows all visit requests sent by the student
  - Displays status badges (pending, approved, rejected)
  - Shows owner contact details
  - Displays visit time and location
  - Link to view listing details

#### Owner Dashboard (`frontend/src/app/components/OwnerDashboard.jsx`)
- **Visit Requests Section**:
  - Shows all visit requests for owner's listings
  - Displays student contact information
  - Approve/Reject buttons for pending requests
  - Status badges for all requests
  - Visit time display

#### Listing Details Page (`frontend/src/app/pages/ListingDetailsPage.jsx`)
- **Request Visit Dialog**:
  - Date picker (prevents past dates)
  - Time picker
  - Combines date and time into visit_time
  - Loading state during submission
  - Success/error toast notifications
  - Only visible to students (not for own listings)

#### Booking Service (`frontend/src/app/services/booking.service.js`)
- **`create(bookingData)`**: Send visit request
- **`getMyBookings()`**: Get student's bookings
- **`getOwnerBookings()`**: Get owner's bookings
- **`updateStatus(bookingId, status)`**: Update booking status
- **`getApprovedVisits(listingId, date)`**: Get approved visits for a date

## How It Works

### Student Flow:
1. Student browses listings
2. Clicks "Request Visit" button
3. Selects preferred date and time
4. System creates booking with `status: 'pending'`
5. Request appears in student's dashboard
6. Student receives notification when owner responds

### Owner Flow:
1. Owner receives visit request notification
2. Views request in dashboard with student details
3. Clicks "Approve" or "Reject"
4. System validates time conflicts (for approvals)
5. If approved and no conflict, status updates to 'approved'
6. If conflict exists, owner sees error message
7. Status update appears in student's dashboard

### Time Blocking Logic:
```javascript
// When approving a visit at 8:30 AM:
// System blocks: 8:30 AM - 10:30 AM (2 hours forward only)
// Times before 8:30 AM remain available
// 
// Time Conflict Check:
// - Existing approved visit at time T
// - New request at time N
// - Conflict if: N >= T AND N < T+2h (new visit within 2 hours after existing)
// - OR: T >= N AND T < N+2h (existing visit within 2 hours after new)
```

## API Endpoints

### Create Visit Request
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "listing_id": "uuid",
  "visit_time": "2026-01-30T14:30:00.000Z",
  "start_date": "2026-01-30",
  "end_date": "2026-01-30"
}
```

### Update Booking Status
```http
PATCH /api/bookings/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved"  // or "rejected"
}
```

### Get Student's Bookings
```http
GET /api/bookings/student
Authorization: Bearer <token>
```

### Get Owner's Bookings
```http
GET /api/bookings/owner
Authorization: Bearer <token>
```

### Get Approved Visits
```http
GET /api/bookings/listing/:listingId/visits?date=2026-01-30
Authorization: Bearer <token>
```

## Database Migration

To apply the migration:

```bash
# Connect to your PostgreSQL database
psql -U your_username -d roomlagbe_db

# Run the migration
\i backend/src/config/migration-add-visit-time.sql
```

Or using Node.js:
```javascript
// backend/src/scripts/run-migration.js
import { pool } from '../config/db.js';
import fs from 'fs';

const migration = fs.readFileSync(
  './src/config/migration-add-visit-time.sql', 
  'utf8'
);

await pool.query(migration);
console.log('Migration completed successfully');
```

## Testing

### Test Scenarios:

1. **Create Visit Request**
   - Student selects future date/time
   - Request appears in both dashboards
   - Status is "pending"

2. **Approve Visit - No Conflict**
   - Owner approves request
   - Status changes to "approved"
   - Student sees updated status

3. **Approve Visit - With Conflict**
   - Existing approved visit at 2:00 PM
   - New request at 3:00 PM (within 2 hours)
   - System rejects approval with error message
   - Owner can reject request or ask student to reschedule

4. **Reject Visit**
   - Owner rejects request
   - Status changes to "rejected"
   - Student sees updated status

5. **View Approved Visits**
   - Query specific date
   - See all approved visits with times
   - Helps identify available slots

## UI Features

### Status Badges:
- 🟦 **Blue (Pending)**: Awaiting owner response
- 🟩 **Green (Approved)**: Visit confirmed
- 🟥 **Red (Rejected)**: Request declined

### Dashboard Sections:
- **My Listings**: Owner/Student's posted listings
- **Visit Requests**: Separate section for visit requests
- Clean, consistent UI between owner and student views
- Contact information visible for communication

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: 
   - Students can only create bookings
   - Owners can only approve/reject their own listing bookings
3. **Validation**: Time conflicts checked server-side
4. **Rate Limiting**: Consider adding to prevent spam bookings

## Future Enhancements

1. **Notifications**: 
   - Real-time notifications for new requests
   - Email notifications for status changes
   - Push notifications on mobile

2. **Calendar View**:
   - Visual calendar showing available slots
   - Blocked time slots highlighted
   - Easy date/time selection

3. **Automatic Rejection**:
   - Reject expired pending requests
   - Clean up old bookings

4. **Booking History**:
   - Track visit completion
   - Rating system after visit
   - Visit analytics

5. **Time Slot Suggestions**:
   - Suggest available time slots
   - Smart scheduling based on existing bookings

## Troubleshooting

### Common Issues:

1. **"Time conflict" error when approving**
   - Check existing approved visits
   - Ensure 2-hour gap between visits
   - Owner should reject conflicting request

2. **Visit request not appearing**
   - Verify authentication token
   - Check user role (student vs owner)
   - Refresh dashboard

3. **Cannot send visit request**
   - Ensure logged in as student
   - Cannot request own listings
   - Check listing availability status

## Code Quality

- ✅ Error handling at all levels
- ✅ Input validation
- ✅ SQL injection prevention (parameterized queries)
- ✅ Time zone handling (TIMESTAMPTZ)
- ✅ Indexed database queries
- ✅ RESTful API design
- ✅ Clean, maintainable code structure

## Performance Optimization

- Database indexes on `visit_time`, `listing_id`, `status`
- Efficient time conflict query (single query with conditions)
- Limited data fetching (only necessary fields)
- Client-side date validation before API call

---

**Last Updated**: January 28, 2026
**Version**: 1.0.0
**Author**: RoomLagbe Development Team
