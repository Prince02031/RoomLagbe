# RoomLagbe — Comprehensive Update README (Newly Added Features)

This document summarizes all major features and improvements recently added across frontend and backend.

---

## 1) Admin Verification & Dashboard Improvements

### Added
- Admin dashboard now shows verification request overview:
	- Pending students
	- Pending owners
	- Pending apartments //need to add
	- Pending listings //need to add - after creating a listing let creator submit for verification - property documents for example
- Latest user verification requests list (student/owner)
- Refresh action for admin verification snapshot

### Key files
- `frontend/src/app/pages/DashboardPage.jsx`
- `frontend/src/app/services/admin.service.js`

---

## 2) Admin Role Support in Auth

### Added
- `admin` role selectable in signup flow
- Backend role validation updated to accept `admin`

### Key files
- `frontend/src/app/pages/LoginPage.jsx`
- `frontend/src/app/services/auth.service.js`
- `backend/src/controllers/auth.controller.js`

---

## 3) Verification Flow Upgrades (Profile + Admin)

### Added / Changed
- Verification apply moved from modal to full page
- Owner verification form UX improvements:
	- NID/Passport placeholder/help text
	- Document placeholder upload box
	- Selected file chip + remove action
- Student verification form now matches owner-style document UI:
	- Placeholder upload box
	- Selected file chip + remove action
- Terminology updated:
	- “Ownership Document” → “Verification Document” (UI wording)

### Key files
- `frontend/src/app/pages/ProfileVerificationPage.jsx`
- `frontend/src/app/pages/VerificationForm.jsx`
- `frontend/src/app/pages/ProfilePage.jsx`
- `frontend/src/app/pages/admin/AdminVerificationsPage.jsx`

---

## 4) Search Listings: OpenStreetMap + Radius + Map Enhancements

### Added
- OSM (Nominatim) autocomplete integrated into search bar
- Selecting a suggestion auto-focuses the map
- Radius-based nearby filtering around selected OSM place
- Radius circle rendered on map
- Marker popups include listing details + `View Details`
- Marker visibility fixes:
	- Supports both top-level and nested coordinates
	- Fallback geocoding for visible listings without coordinates
	- Auto-fit map bounds to show marker set

### Current behavior
- If an OSM place is selected, listings are filtered by distance radius (and other filters)
- If no OSM place is selected, text-based search works as before

### Key files
- `frontend/src/app/pages/SearchPage.jsx`
- `backend/src/models/listing.model.js` (coordinates exposed/used in list responses)

---

## 5) Listing Details: Commute Calculator (OSM + Route API)

### Added
- University/destination selection via OSM suggestions
- Commute uses route API (OSRM) for road-based estimates when available
- Fallback to straight-line estimate if route API unavailable
- Shows:
	- Distance
	- Walking time
	- Driving time
- Small map under commute results with:
	- Route polyline
	- Start/end markers
	- Auto-fit to route bounds

### Key files
- `frontend/src/app/pages/ListingDetailsPage.jsx`
- `frontend/src/app/lib/utils.js`

---

## 6) Rent Analytics Features

### User Analytics (`/analytics`)
- Rent heatmap page with:
	- OSM location search
	- Radius selection
	- Nearby listing stats
	- Fair-rent score (out of 5) based on selected radius distribution

### Admin Analytics (`/admin/analytics`)
- Dedicated admin analytics page (separate from normal analytics)
- Radius-wise rent calculations
- Highest-rent and lowest-rent area within selected radius
- Bar charts for area comparison
- All locations shown in graph (with horizontal scroll support)

### Routing / navigation changes
- Admin analytics route added: `/admin/analytics`
- Admin navbar + dashboard analytics buttons point to admin page

### Key files
- `frontend/src/app/pages/AnalyticsPage.jsx`
- `frontend/src/app/pages/admin/AdminAnalyticsPage.jsx`
- `frontend/src/app/App.jsx`
- `frontend/src/app/components/Navbar.jsx`
- `frontend/src/app/pages/DashboardPage.jsx`

---

## 7) Listing Photos & Create Listing Stabilization

### Added / Fixed
- Create listing page load/runtime issues fixed
- Photo upload pipeline hardened (frontend + backend)
- Placeholder-style image picker + preview + remove image support
- Listing API/model fixes so uploaded photos/thumbnails appear in listing views
- Supabase upload config improvements (bucket/key handling)

### Key files (major)
- `frontend/src/app/pages/CreateListingPage.jsx`
- `frontend/src/app/services/listing.service.js`
- `frontend/src/app/services/api.js`
- `backend/src/controllers/listing.controller.js`
- `backend/src/routes/listing.routes.js`
- `backend/src/models/listingPhoto.model.js`
- `backend/src/models/listing.model.js`
- `backend/src/config/env.js`
- `backend/src/config/supabase.js`

---

## 8) Verified Blue Tick (Poster Identity)

### Added
- Blue verification tick shown beside poster/contact name in listing views when verified

### Backend support
- Listing queries now expose poster verification fields:
	- `owner_verification_status`
	- `student_verification_status`
	- `poster_verification_status`

### Key files
- `frontend/src/app/components/ListingCard.jsx`
- `frontend/src/app/pages/ListingDetailsPage.jsx`
- `backend/src/models/listing.model.js`

---

## 9) Student Notification System (New)

### Notification events implemented
Students now receive notifications for:
1. Room visit request submitted
2. Verification request approved
3. Visit request approved

### Backend additions
- Notification data model + APIs
- Notification creation hooked into booking/admin flows

### Frontend additions
- Notification service
- Student notification UI moved to bell-triggered dropdown panel in navbar
- Unread count badge + mark read / mark all read

### Key files
- `backend/src/models/notification.model.js`
- `backend/src/controllers/notification.controller.js`
- `backend/src/routes/notification.routes.js`
- `backend/src/controllers/booking.controller.js`
- `backend/src/services/booking.service.js`
- `backend/src/controllers/admin.controller.js`
- `backend/src/app.js`
- `frontend/src/app/services/notification.service.js`
- `frontend/src/app/components/Navbar.jsx`

---

## 10) Database Migration Required (Notifications)

Before using notifications, run:

- `backend/src/config/migration-add-notifications.sql`

This creates:
- `notification` table
- indexes for user/time and unread lookup

---

## 11) Notification API Endpoints

Base: `/api/notifications`

- `GET /my` → student’s notifications
- `PATCH /:id/read` → mark one as read
- `PATCH /read-all` → mark all as read

Auth: student-only (authenticated)

---

## 12) Quick Validation Checklist

1. **Admin**
	 - Open dashboard, verify pending counts and latest requests
	 - Go to `/admin/verifications`, approve/reject flows
2. **Student Verification**
	 - Submit verification with student document upload UI
	 - Confirm admin approval updates status and sends notification
3. **Search + Map**
	 - Select OSM place, adjust radius, confirm nearby results + markers
	 - Open marker popup and navigate to listing details
4. **Commute**
	 - Pick OSM destination, calculate commute, verify mini route map
5. **Notifications**
	 - Open bell dropdown, verify unread count and mark-read actions

---

## 13) Notes

- Route APIs and OSM/Nominatim are external dependencies; if unavailable, fallback logic is used where implemented.
- Marker rendering depends on coordinates; fallback geocoding is included for listings missing direct lat/lng.
- Notifications rely on the new DB migration table.

---

