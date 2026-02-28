# Smart Blood Bank Management System

## Project Overview

A complete, production-ready web application for blood bank management with emergency matching and predictive analytics. Designed for real social impact, especially in rural and semi-urban areas.

## Features

### Core Functionality
- **Multi-User Platform**: Separate interfaces for Donors, Receivers, and Administrators
- **Emergency Blood Matching**: Fast donor-receiver coordination with priority-based requests
- **Safe Donor Screening**: Medical questionnaire with auto-eligibility checking
- **Donor Dashboard**: Track donations, manage availability, respond to emergencies
- **Admin Dashboard**: Monitor operations, manage donors, track requests
- **Predictive Analytics**: Visual analytics for demand forecasting (future AI integration ready)
- **Terms & Conditions**: Comprehensive legal and safety documentation

### Pages Included
1. **Landing Page** - Hero section, statistics, awareness messaging
2. **User Registration** - Common registration for donors and receivers
3. **Donor Registration** - Detailed medical screening and eligibility check
4. **Receiver Request** - Emergency blood request with donor/blood bank matching
5. **Donor Dashboard** - Personal profile, donation history, emergency alerts
6. **Admin Dashboard** - System monitoring, donor/request management
7. **Terms & Conditions** - Legal compliance and safety disclaimers
8. **Predictive Analytics** - Data visualization and insights
9. **About Page** - Mission, features, social impact
10. **Login Page** - Multi-role authentication

## Technology Stack

### Frontend (Current Implementation)
- **React 18.3** - Component-based UI framework
- **React Router 7** - Client-side routing
- **Tailwind CSS 4** - Utility-first styling
- **Recharts** - Data visualization
- **Lucide React** - Icon library

### Backend Integration Ready
- **Flask** - Python web framework (to be connected)
- **MySQL** - Relational database (to be connected)
- **RESTful APIs** - For frontend-backend communication

## File Structure

```
/src
  /app
    /components
      - Navbar.tsx              # Site-wide navigation
      - Root.tsx                # Layout wrapper
      - LandingPage.tsx         # Homepage
      - UserRegistration.tsx    # Common registration
      - DonorRegistration.tsx   # Donor-specific registration
      - ReceiverRequest.tsx     # Blood request form
      - DonorDashboard.tsx      # Donor portal
      - AdminDashboard.tsx      # Admin portal
      - TermsConditions.tsx     # Legal terms
      - PredictiveAnalytics.tsx # Analytics dashboard
      - About.tsx               # About/mission page
      - Login.tsx               # Authentication
    - App.tsx                   # Main app component
    - routes.tsx                # Route configuration
  /styles
    - tailwind.css              # Tailwind imports
    - theme.css                 # Design tokens
    - index.css                 # Global styles
```

## Color Scheme

- **Primary**: Red (#dc2626, #ef4444) - Blood/medical theme
- **Secondary**: White, Gray shades - Clean, trustworthy
- **Accent Colors**: Green (success), Yellow (warnings), Orange (alerts)

## Backend Integration Guide

### API Endpoints to Create

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

#### Donors
- `GET /api/donors` - List all donors (admin)
- `GET /api/donors/:id` - Get donor details
- `POST /api/donors` - Register new donor
- `PUT /api/donors/:id` - Update donor info
- `GET /api/donors/eligible` - Get eligible donors for blood type

#### Requests
- `GET /api/requests` - List all blood requests
- `GET /api/requests/:id` - Get request details
- `POST /api/requests` - Create new blood request
- `PUT /api/requests/:id` - Update request status

#### Blood Banks
- `GET /api/bloodbanks` - List blood banks
- `GET /api/bloodbanks/:id` - Get blood bank details
- `GET /api/bloodbanks/:id/inventory` - Get inventory

#### Analytics
- `GET /api/analytics/demand` - Blood demand statistics
- `GET /api/analytics/locations` - High-demand locations
- `GET /api/analytics/trends` - Monthly trends

### Database Tables Needed

#### users
- id, email, password_hash, name, phone, city, user_type, created_at

#### donors
- id, user_id, age, gender, blood_group, weight, last_donation_date, availability_status, eligibility_status

#### medical_screening
- id, donor_id, chronic_illness, recent_surgery, medication, infection_history, doctor_advised

#### blood_requests
- id, user_id, patient_name, blood_group, units, emergency_level, hospital_name, location, status, created_at

#### donations
- id, donor_id, request_id, donation_date, units, hospital, status

#### blood_banks
- id, name, location, phone, email, created_at

#### inventory
- id, blood_bank_id, blood_group, units_available, last_updated

## How to Connect Frontend to Backend

### 1. Create API Service Layer
Create `/src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Authentication
  login: async (email: string, password: string, userType: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, userType })
    });
    return response.json();
  },

  // Donors
  registerDonor: async (donorData: any) => {
    const response = await fetch(`${API_BASE_URL}/donors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donorData)
    });
    return response.json();
  },

  // Add more endpoints as needed...
};
```

### 2. Update Components to Use API
Replace mock data with API calls:

```typescript
// Example in DonorRegistration.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await api.registerDonor(formData);
    if (response.success) {
      navigate('/donor-dashboard');
    }
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### 3. Add State Management (Optional)
Consider adding Context API or Redux for global state:
- User authentication state
- Current user profile
- Notifications

## Current Mock Data Locations

All components currently use mock/dummy data:
- **DonorDashboard**: Mock donor profile, requests, history (lines 8-65)
- **ReceiverRequest**: Mock matched donors and blood banks (lines 38-82)
- **AdminDashboard**: Mock statistics and records (lines 4-57)
- **PredictiveAnalytics**: Mock chart data (lines 6-50)

## Form Validation

All forms include client-side validation:
- Email format validation
- Phone number (10 digits)
- Password strength (min 6 characters)
- Age range (18-60)
- Required fields checking

## Security Considerations

### Before Production:
1. Implement proper authentication (JWT tokens)
2. Add HTTPS/SSL certificates
3. Sanitize all user inputs
4. Implement rate limiting on APIs
5. Add CORS configuration
6. Hash passwords (bcrypt)
7. Validate data on both frontend and backend

## Testing for Backend Integration

### Test Registration Flow:
1. User registers → POST to `/api/auth/register`
2. Redirect to login → POST to `/api/auth/login`
3. Store auth token → Use for subsequent requests

### Test Blood Request Flow:
1. Receiver submits request → POST to `/api/requests`
2. System finds matches → GET `/api/donors/eligible?bloodGroup=O+&location=Mumbai`
3. Display results → Show matched donors and blood banks

## Future Enhancements

- Real-time notifications (WebSocket/Firebase)
- SMS/Email integration for emergency alerts
- Mobile app (React Native)
- Geolocation-based donor matching
- AI/ML prediction models for demand forecasting
- Integration with government health databases
- QR code for donor verification
- Blood donation camps management

## Project Demonstration Tips

For final-year project presentation:
1. Start with landing page - explain mission
2. Show donor registration with eligibility checking
3. Demonstrate emergency request matching
4. Display donor dashboard features
5. Show admin monitoring capabilities
6. Present analytics dashboard
7. Explain Terms & Conditions (safety focus)
8. Discuss backend integration plan
9. Highlight social impact potential

## Contact & Support

This is a demonstration project designed for educational purposes and final-year project presentations. The UI is production-ready and can be connected to a Flask + MySQL backend.

## License

Educational Project - 2026
