# Smart Blood Bank - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### **Prerequisites**
- Python 3.7+
- Node.js & npm
- Git (optional)

---

## **Step 1: Start Backend** (Terminal 1)

```bash
cd "c:\Smart BloodBank\backend"

# Activate virtual environment
venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Run backend
python app.py
```

✅ **Backend running on:** http://localhost:5000

---

## **Step 2: Start Frontend** (Terminal 2)

```bash
cd "c:\Smart BloodBank\frontend"

# Install dependencies (first time only)
npm install

# Run frontend
npm run dev
```

✅ **Frontend running on:** http://localhost:3000

---

## **Step 3: Test the Application**

### **Test Donor Registration**
1. Go to http://localhost:3000
2. Click "Register"
3. Fill form:
   - Name: `John Donor`
   - Email: `john@example.com`
   - Password: `demo123`
   - Role: `Donor (Blood Donor)`
4. Click "Register Account"
5. Fill donor profile form
6. Click "Register as Donor"
7. You're now on **Donor Dashboard** ✅

### **Test Receiver Request**
1. Click Logout (Nav → Logout)
2. Click "Register" again
3. Fill form:
   - Name: `Hospital Admin`
   - Email: `hospital@example.com`
   - Password: `demo123`
   - Role: `Receiver (Blood Receiver / Hospital)`
4. Click "Register Account"
5. You're now on **Receiver Dashboard** ✅
6. Click "Create Blood Request"
7. Fill request form (same city as donor you registered)
8. Submit → See matching donors!

### **Test Blood Analytics**
1. Click "Analytics" in navbar
2. See real blood demand visualization based on your data ✅

---

## **Key User Flows**

### **Donor Flow**
```
Homepage → Register (role=Donor) → Complete Donor Profile → Donor Dashboard
```

**On Donor Dashboard:**
- See your profile
- See blood requests matching your blood type
- Click phone number to contact receivers

### **Receiver Flow**
```
Homepage → Register (role=Receiver) → Receiver Dashboard
```

**On Receiver Dashboard:**
- Create blood requests
- See list of matching donors
- Contact donors directly

### **Logout & Re-Login**
```
Any Dashboard → Click Logout (nav) → Click "Login"
→ Enter email & password → Auto-redirect to dashboard
```

---

## **🗄️ Database**

Database file: `c:\Smart BloodBank\backend\smartblood.db`

Delete this file to reset (will be recreated on next backend start):
```bash
rm backend/smartblood.db
```

---

## **📱 Testing Tips**

**Register Multiple Accounts** to test matching:
- Donor 1: Blood Group O+, City: Mumbai
- Donor 2: Blood Group A+, City: Delhi
- Receiver 1: Blood Group O+, City: Mumbai → Should see Donor 1

**Check Real Data:**
- Analytics page shows actual demand vs supply from your created records
- More requests/donors = better analytics data

---

## **🐛 Troubleshooting**

### **Backend won't start**
```
Error: "Address already in use"
→ Kill process on port 5000 or change port in app.py
```

### **Frontend shows blank page**
```
→ Check browser console (F12) for errors
→ Ensure backend is running (check http://localhost:5000/api/ping)
```

### **Can't login**
```
→ Use exact email/password you registered with
→ Check backend console for errors
```

### **Database errors**
```
→ Delete smartblood.db and restart backend
→ Run: python app.py (will recreate database)
```

---

## **📊 API Health Check**

Open in browser: http://localhost:5000/api/ping

Should show:
```json
{"message":"pong"}
```

---

## **🎯 Next Steps**

1. ✅ Register as Donor & Receiver
2. ✅ Test blood request matching
3. ✅ Explore Analytics dashboard
4. ✅ Check IMPLEMENTATION_GUIDE.md for full details

---

## **👨‍💻 Code Structure**

**Backend:**
```
backend/
├── app.py (All API endpoints)
├── models.py (Database models)
├── db.py (Database setup)
└── smartblood.db (SQLite database)
```

**Frontend:**
```
frontend/src/app/
├── App.tsx (Main wrapper with Auth)
├── api.ts (API client functions)
├── routes.tsx (Route definitions with protection)
├── contexts/AuthContext.tsx (Global auth state)
├── components/
│   ├── Login.tsx
│   ├── UserRegistration.tsx
│   ├── DonorRegistration.tsx
│   ├── DonorDashboard.tsx
│   ├── ReceiverRequest.tsx
│   ├── PredictiveAnalytics.tsx
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
```

---

## **✨ Features Working**

✅ User Authentication (Register/Login/Logout)
✅ Role-Based Access (Donor vs Receiver)
✅ Donor Profile Management
✅ Blood Request Creation
✅ Real-Time Donor Matching
✅ Blood Demand Analytics
✅ Direct Contact via Phone
✅ Persistent Database
✅ Protected Routes
✅ Auto-Redirect on Login

---

**Questions?** Check IMPLEMENTATION_GUIDE.md for detailed documentation!

**Version:** 1.0 - Ready for Production
**Last Updated:** December 2024
