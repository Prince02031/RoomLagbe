# Backend-Frontend Integration Analysis

## Current Status

### Backend: ✅ 95% Complete
- All endpoints implemented and ready
- Database schema complete with migrations
- Authentication & authorization working
- Student room-share feature implemented
- Amenities system ready
- Auto-location creation with PostGIS
- Admin verification system
- Postman collection complete

### Frontend: ❌ 0% Integrated
- **No API service layer exists**
- All pages use mock data
- No axios/fetch configuration
- No JWT token management
- No error handling for API calls

---

## Integration Analysis Without Map

### ✅ Can Be Fully Integrated (70-80% of App)

#### 1. Authentication System 🟢
**Status:** Can be fully integrated without map
- Login/Register pages
- JWT token storage (localStorage)
- Protected routes
- User context management
- **Backend Endpoints:** `/api/auth/login`, `/api/auth/register`

#### 2. Browse/Search Listings 🟢
**Status:** Can be fully integrated without map
- View all apartments/room-shares
- Filter by: location (dropdown), price, women_only, listing_type
- Search by keywords
- Listing cards display
- **Works with existing locations in DB**
- **Backend Endpoints:** `/api/listings`, `/api/listings/:id`

#### 3. Listing Details Page 🟢
**Status:** Can be fully integrated without map
- View apartment/room details
- Display amenities
- Show price, availability
- Contact owner/student
- Booking functionality
- **Coordinates already exist, just display address**
- **Backend Endpoints:** `/api/apartments/:id`, `/api/amenities/apartment/:id`

#### 4. Wishlist 🟢
**Status:** Pure CRUD operations, no map needed
- Add/remove listings
- View wishlist page
- **Backend Endpoints:** 
  - POST `/api/wishlist`
  - GET `/api/wishlist`
  - DELETE `/api/wishlist/:listingId`

#### 5. Saved Searches 🟢
**Status:** Pure CRUD operations, no map needed
- Save filter criteria
- View saved searches
- **Backend Endpoints:**
  - POST `/api/saved-searches`
  - GET `/api/saved-searches`
  - DELETE `/api/saved-searches/:id`

#### 6. Bookings 🟢
**Status:** Fully functional without map
- Create booking requests
- View my bookings (student)
- Approve/reject bookings (owner)
- **Backend Endpoints:**
  - POST `/api/bookings`
  - GET `/api/bookings/student`
  - GET `/api/bookings/owner`
  - PATCH `/api/bookings/:id/status`

#### 7. Student/Owner Dashboards 🟢
**Status:** Fully functional without map
- View my listings
- View my bookings
- Analytics/stats
- **Backend Endpoints:**
  - GET `/api/apartments/owner/me`
  - GET `/api/listings` (filter by owner)
  - GET `/api/bookings/owner`

#### 8. User Profile 🟢
**Status:** Fully functional without map
- View/edit profile
- Change password
- **Backend Endpoints:**
  - GET `/api/users/me`
  - PUT `/api/users/me`

---

### ⚠️ Requires Map (20-30% of App)

#### 1. Create Apartment/Listing 🔴
**Issue:** Backend expects `latitude`, `longitude`, `area_name`

**Workarounds:**
- **Option A:** Location dropdown (select from 20 seeded IUT locations)
- **Option B:** Manual lat/lng input fields (temporary dev solution)
- **Option C:** Skip creation, use seeded test data for now

**Backend Endpoints:**
- POST `/api/apartments` (requires lat/lng)
- POST `/api/rooms`
- POST `/api/listings`

#### 2. Map View in Search 🔴
**Status:** Can defer - list view works fine
- Display listings as markers on map
- Cluster markers
- **Priority:** Low (nice-to-have feature)

#### 3. Location Display on Details Page 🟡
**Status:** Can show text address without map initially
- Show area_name, coordinates as text
- Add map view later
- **Priority:** Medium

---

## Recommended Integration Order

### Phase 1: Core Backend Integration (70%)
**Timeline:** 3-5 days

1. **API Service Layer Setup**
   - Create `frontend/src/app/services/api.js`
   - Configure axios with base URL (`http://localhost:5000/api`)
   - Add JWT token interceptor
   - Add error handling and response interceptors

2. **Authentication Integration**
   - Update `LoginPage.jsx` to call `/api/auth/login`
   - Update register functionality to call `/api/auth/register`
   - Store JWT token in localStorage
   - Update AppContext to manage auth state
   - Implement protected routes

3. **Listings API Integration**
   - Create `listingService.js`
   - Update `SearchPage.jsx` to fetch from `/api/listings`
   - Implement filters (location, price, women_only)
   - Update `ListingDetailsPage.jsx` to fetch single listing

4. **Amenities Integration**
   - Create `amenityService.js`
   - Fetch amenities from `/api/amenities`
   - Display amenities on listing details page
   - Update listing cards to show amenity tags

5. **Wishlist API Integration**
   - Create `wishlistService.js`
   - Update `WishlistPage.jsx` to use real API
   - Sync add/remove operations with backend

6. **Bookings API Integration**
   - Create `bookingService.js`
   - Update booking creation flow
   - Implement owner approval/rejection
   - Update dashboard to show real bookings

### Phase 2: Create Functionality with Workaround (15%)
**Timeline:** 2-3 days

1. **Location Dropdown Solution (Temporary)**
   - Fetch locations from `/api/locations`
   - Replace map picker with dropdown select
   - Display 20 IUT Boardbazar locations
   - Store selected location's coordinates

2. **Create Apartment (Owner/Student)**
   - Create `apartmentService.js`
   - Update `CreateListingPage.jsx`
   - Add amenity multi-select checkboxes
   - Send lat/lng from selected location

3. **Create Room (Student)**
   - Create `roomService.js`
   - Build room creation page
   - Link to student's apartment

4. **Create Listing with Amenities**
   - Update listing creation flow
   - Add amenity selection UI
   - Call `/api/amenities/apartment/:id/add/:amenityId`

### Phase 3: Map Integration (15%)
**Timeline:** 3-4 days

1. **Install Dependencies**
   ```bash
   npm install leaflet react-leaflet
   ```

2. **OpenStreetMap Location Picker**
   - Create `MapLocationPicker.jsx` component
   - Default center: IUT Boardbazar (23.9897, 90.4233)
   - Click to select location
   - Reverse geocoding for area_name
   - Replace dropdown with map picker

3. **Map View in Search**
   - Create `MapView.jsx` component
   - Display listings as markers
   - Cluster markers when zoomed out
   - Toggle between list/map view

4. **Map on Listing Details**
   - Show single apartment location
   - Display nearby universities
   - Show commute distances

---

## Missing Infrastructure Requirements

### Frontend Needs to Build:

#### 1. API Service Layer (`frontend/src/app/services/`)
```
services/
├── api.js              # Axios instance, interceptors
├── auth.service.js     # login, register, logout
├── listing.service.js  # CRUD listings
├── apartment.service.js # CRUD apartments
├── room.service.js     # CRUD rooms
├── booking.service.js  # CRUD bookings
├── wishlist.service.js # wishlist operations
├── amenity.service.js  # amenities operations
├── location.service.js # locations
└── user.service.js     # user profile
```

#### 2. API Configuration
```javascript
// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Add JWT token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### 3. Update All Pages
- Replace mock data imports with API service calls
- Add loading states
- Add error handling
- Add success/error toasts

---

## Verdict: 70-85% Can Be Done Without Map

### With Location Dropdown Workaround:
- ✅ Authentication
- ✅ Search/Browse
- ✅ Listing details
- ✅ Wishlist
- ✅ Bookings
- ✅ Dashboards
- ⚠️ Create listings (with dropdown)

### Recommended Approach:
**Start with Phase 1** - Build the API service layer and integrate:
1. Authentication system (2 days)
2. Listings + Search + Filters (2 days)
3. Wishlist + Bookings (1 day)

Then move to Phase 2 with location dropdown workaround, and finally Phase 3 for full map integration.

---

## Next Steps

1. ✅ Run `migration-add-creator-role.sql` in Supabase (DONE)
2. ✅ Run `seed-amenities.sql` in Supabase (DONE)
3. 🔄 Test backend endpoints in Postman
4. 🔜 Build API service layer (Phase 1)
5. 🔜 Integrate authentication
6. 🔜 Integrate listings + search
7. 🔜 Add location dropdown workaround
8. 🔜 Implement map integration

---

## Resources

- **Backend API:** `http://localhost:5000/api`
- **Postman Collection:** `backend/RoomLagbe-Postman-Collection.json`
- **Database:** Supabase (aws-1-ap-northeast-2)
- **Map Library:** Leaflet + react-leaflet
- **Map Provider:** OpenStreetMap (Free)
