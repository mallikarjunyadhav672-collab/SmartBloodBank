# Real Blood Banks & Donation Camps Implementation

## Overview
The system has been updated to display **real, verified blood banks and donation camps** from the database instead of dummy/test data. Only authenticated admins can create entries, and all data is marked as verified upon creation.

---

## Changes Made

### 1. **Backend Models** (`backend/models.py`)

#### New `BloodBank` Model
```python
class BloodBank(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    name = db.Column(db.String(200))
    city = db.Column(db.String(100))
    address = db.Column(db.String(200))
    phone = db.Column(db.String(50))
    verified = db.Column(db.Boolean, default=True)
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)
```

#### Updated `Camp` Model
Added fields:
- `userId`: Links camps to the admin who created them
- `verified`: Only verified camps appear in public lists

### 2. **Backend API** (`backend/app.py`)

#### Blood Banks Endpoint
**POST `/api/blood-banks`** - Admin only
- Create verified blood bank entry
- Admin check via `userId` role verification
- Returns full bank record with ID

**GET `/api/blood-banks`** - Public
- Returns only verified blood banks
- Filters by city if provided
- Empty list until admin adds entries

#### Camps Endpoint Updates
- **GET `/api/camps`** now filters `WHERE verified = True`
- **POST `/api/camps`** stores `userId` of creating admin
- **GET `/api/donation-camps`** alias updated to use new model

#### User Registration
- Added support for `role: "admin"` (in addition to "donor", "receiver")
- Allows blood bank staff to register as administrators

---

### 3. **Frontend API** (`frontend/src/app/api.ts`)

#### New Blood Bank Interface
```typescript
export interface BloodBank {
  id?: number;
  userId?: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  verified?: boolean;
}
```

#### Helper Functions
```typescript
listBloodBanks(city?: string)      // GET verified banks
createBloodBank(bank: BloodBank)   // POST new bank (admin)
updateBloodBank(bankId, updates)   // PUT bank (admin)
deleteBloodBank(bankId)            // DELETE bank (admin)
```

---

### 4. **Admin Dashboard** (`frontend/src/app/components/AdminDashboard.tsx`)

#### New Blood Bank Management Panel
- Form to add new blood banks
- Real-time list of verified banks
- Requires admin role to create
- Passes userId automatically from logged-in admin

#### Updated Camp Management
- Same real admin-only creation flow
- Both camps and banks are now database-backed

---

## Data Flow

### Creating a Blood Bank
1. Admin logs in (role = "admin")
2. Admin Dashboard loads with blood bank form
3. Admin fills: name, city, address, phone
4. Frontend sends POST to `/api/blood-banks` with `userId` and data
5. Backend verifies user role is "admin"
6. Bank saved to database with `verified=True`
7. Bank appears immediately in receivers' "Nearby Blood Banks" list

### Displaying Blood Banks to Receivers
1. Receiver submits blood request with location
2. Frontend calls `GET /api/blood-banks?city=<city>`
3. Backend returns only `verified=True` entries
4. Receiver sees real, admin-registered banks in their results

### Same Flow for Donation Camps
- Admin can create camps via AdminDashboard Camp form
- Only verified camps visible to receivers
- Full database persistence across requests

---

## Key Features

✅ **No Static Test Data**
- Old hardcoded `BLOOD_BANKS` array removed
- All data comes from database

✅ **Admin-Only Entries**
- Only users with `role="admin"` can create/edit/delete
- Authorization check on all POST/PUT/DELETE endpoints

✅ **Verified Flag**
- Future enhancement: non-auto-verified entries can be reviewed first
- Currently all admin submissions are automatically verified

✅ **User Association**
- Each bank/camp linked to creating admin via `userId`
- Audit trail for data management

✅ **City Filtering Enhanced**
- Both GET endpoints support `?city=<name>` filtering
- Filtering is fuzzy/hierarchical (village/mandal/district/state) for better coverage
- Enabled "nearest banks/camps" feature for receivers

✅ **Request & Response Tracking (new)**
- Receivers can view their own requests and see status updates if a donor has responded
- Donors can mark a request as "responded" when they contact a receiver
- Donors have a history panel on their dashboard with status and can mark "donated"
- Backend stores `donorId` on receiver records to link responses

✅ **Location scoring & distance display**
- Search endpoints compute a simple score based on matching location tokens
to approximate proximity
- Clients receive a `distance` integer and surface it in the UI (e.g. `2 token match`)
- This complements the fuzzy hierarchy matching and improves perceived "nearest" results

✅ **Notification stub**
- When a request status changes (pending ➜ matched ➜ donated) the server logs a notification
  to the requester's email address. This is a placeholder for real email/SMS integration.


---

## Testing Endpoints

### Register Admin
```bash
POST /api/auth/register
{
  "email": "admin@test.com",
  "password": "pwd",
  "fullName": "Admin",
  "role": "admin"
}
```

### Create Blood Bank
```bash
POST /api/blood-banks
{
  "userId": 1,
  "name": "City Medical Bank",
  "city": "Mumbai",
  "address": "123 Medical Lane",
  "phone": "9876543210"
}
```

### Get Verified Banks
```bash
GET /api/blood-banks                 # all verified banks
GET /api/blood-banks?city=Mumbai     # filtered by city
```

### Create Camp
```bash
POST /api/camps
{
  "userId": 1,
  "name": "Community Health Drive",
  "city": "Delhi",
  "address": "Community Center",
  "date": "2026-03-15"
}
```

### Get Verified Camps
```bash
GET /api/camps                       # all verified camps
GET /api/camps?city=Delhi            # filtered by city
GET /api/donation-camps              # backward compatible alias
```

---

## Database Schema

### BloodBank Table
| Column      | Type         | Notes                     |
|-------------|--------------|---------------------------|
| id          | Integer (PK) | Auto-generated            |
| userId      | Foreign Key  | Admin who created it      |
| name        | String(200)  | Bank name                 |
| city        | String(100)  | Location city             |
| address     | String(200)  | Full address              |
| phone       | String(50)   | Contact number            |
| verified    | Boolean      | Shows in public lists     |
| createdAt   | DateTime     | Creation timestamp        |

### Camp Table (Updated)
| Column      | Type         | Notes                     |
|-------------|--------------|---------------------------|
| id          | Integer (PK) | Auto-generated            |
| userId      | Foreign Key  | Admin who created it      |
| name        | String(200)  | Camp name                 |
| city        | String(100)  | Location city             |
| address     | String(200)  | Camp address              |
| date        | String(50)   | Camp date (YYYY-MM-DD)    |
| verified    | Boolean      | Shows in public lists     |
| createdAt   | DateTime     | Creation timestamp        |

---

## User Interface Changes

### Admin Dashboard
- **New**: "Manage Blood Banks" panel (mirror of Camps panel)
- **Updated**: Camp management now uses database with `verified` filter

### Receiver Request Page
- **Updated**: "Nearby Blood Banks" section now pulls real admin-registered banks
- **Updated**: "Upcoming Donation Camps" pulls verified camps only
- All changes automatic when admins add new entries

---

## Security & Data Integrity

✅ **Role-Based Access Control**
- Only `role="admin"` can POST/PUT/DELETE banks or camps
- 403 Unauthorized response if non-admin attempts creation

✅ **Data Persistence**
- All entries stored in SQLite database
- Survives server restarts

✅ **Verified Flag**
- Acts as publish switch for future admin review workflows
- Initially auto-verified for admin submissions

---

## Next Steps (Optional)

1. **Database-Backed Blood Inventory**: Similar model for blood type stock levels  
2. **Manual Verification**: Add admin review panel before auto-publish  
3. **Edit/Delete UI**: Expand AdminDashboard with edit/delete buttons  
4. **Notifications**: Alert system when new banks/camps are added  
5. **Image Uploads**: Store bank logo/camp photos  

---

## Deployment Notes

- **Database**: Fresh database is created on first run via `db.create_all()`
- **Initial State**: Database starts empty; admins must register and add entries
- **Migration**: If adding to existing database, run migrations or delete `smartblood.db` to reset
