# Visit Request Feature - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Run the Database Migration

Choose one of these methods:

**Method A: Using Node Script (Recommended)**
```bash
cd backend
node src/scripts/run-visit-migration.js
```

**Method B: Using psql**
```bash
psql -U your_username -d roomlagbe_db -f backend/src/config/migration-add-visit-time.sql
```

### Step 2: Start the Backend Server
```bash
cd backend
npm install  # if not already done
npm start
```

### Step 3: Start the Frontend
```bash
cd frontend
npm install  # if not already done
npm run dev
```

## ✅ Verify Installation

### Check Database
```sql
-- Connect to your database and run:
\d booking

-- You should see:
--   visit_time | timestamp with time zone
```

### Test the Feature

1. **Login as Student**
   - Navigate to any listing
   - Click "Request Visit" button
   - Select date and time
   - Click "Send Request"
   - ✅ Success message should appear

2. **Check Student Dashboard**
   - Go to Dashboard
   - Click "Visit Requests" tab
   - ✅ Your request should appear with "pending" status

3. **Login as Owner**
   - Go to Dashboard
   - Click "Visit Requests" tab
   - ✅ Student's request should appear

4. **Approve Request**
   - Click "Approve" button
   - ✅ Status changes to "approved"
   - ✅ Student sees "approved" status in their dashboard

5. **Test Time Conflict**
   - Login as another student
   - Request visit at same listing between 8:30 AM and 10:30 AM (if first visit was at 8:30 AM)
   - Login as owner
   - Try to approve
   - ✅ Should see error: "Cannot approve: This time slot conflicts..."
   - Note: Times before the first approved visit (e.g., 6:30 AM) should work fine

## 📋 Feature Checklist

After installation, you should have:

- ✅ Students can send visit requests
- ✅ Owners receive requests in dashboard
- ✅ Owners can approve/reject requests
- ✅ 2-hour time blocking prevents conflicts
- ✅ Status updates appear in both dashboards
- ✅ Contact information visible on both sides

## 🎯 API Endpoints Available

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/bookings` | POST | Student | Create visit request |
| `/api/bookings/:id/status` | PATCH | Owner | Approve/reject |
| `/api/bookings/student` | GET | Student | My requests |
| `/api/bookings/owner` | GET | Owner | Requests for my listings |
| `/api/bookings/listing/:id/visits` | GET | Any | Approved visits |

## 🐛 Troubleshooting

### Migration Failed
```bash
# Check if booking table exists
psql -U your_username -d roomlagbe_db -c "\d booking"

# If column already exists, migration will show warning but continue
```

### Visit Request Not Sending
1. Check if logged in as student
2. Open browser console for errors
3. Verify backend is running on correct port
4. Check API endpoint in `frontend/src/app/services/api.js`

### Approval Not Working
1. Verify logged in as owner
2. Check if you own the listing
3. Look for time conflict error message
4. Check browser console and backend logs

### Time Conflict Not Working
1. Verify migration ran successfully
2. Check if `visit_time` column exists in booking table
3. Look at backend logs for SQL errors

## 📚 Documentation

For more details, see:
- **Complete Documentation**: `BOOKING_FEATURE_DOCUMENTATION.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`

## 💡 Tips

1. **Time Format**: The system uses 24-hour format (e.g., 14:30 for 2:30 PM)
2. **Timezone**: All times are stored in UTC but displayed in local timezone
3. **Date Validation**: Cannot select past dates when requesting visit
4. **Contact Info**: Phone and email shown after request is created
5. **Status Colors**: 
   - 🔵 Blue = Pending
   - 🟢 Green = Approved
   - 🔴 Red = Rejected

## 🎉 You're All Set!

The visit request feature is now fully functional. Students can send visit requests, owners can approve/reject them, and the system automatically prevents time conflicts.

**Happy Testing!** 🚀

---

Need help? Check the full documentation or contact the development team.
