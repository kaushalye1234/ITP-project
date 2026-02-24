# 35% IMPLEMENTATION PROGRESS ROADMAP
## Assignment 2 - Week 6 Deliverables
### IT2150: IT Project | Group: ITP_SE_01

---

## 📊 WHAT DOES "35% OF PRODUCT COMPLETION" MEAN?

For **Assignment 2 - Week 6**, each member must demonstrate approximately **35% implementation** of their assigned component. This means:

✅ **Core database tables created and populated with test data**  
✅ **Basic CRUD operations working (Create, Read, Update, Delete)**  
✅ **At least 3-4 main API endpoints functional**  
✅ **Simple UI forms/pages displaying data**  
✅ **Basic validation and error handling**  

❌ **NOT Required for 35%:**
- Advanced features (real-time updates, complex workflows)
- Complete UI polish and styling
- Full integration with other members' components
- Production-ready error handling and security

---

## 👤 MEMBER 1: USER MANAGEMENT & AUTHENTICATION (35% Checklist)

### ✅ **What to Deliver by Week 6:**

#### **1. Database (10% of 35%)**
- [x] `users` table created with roles (customer, worker, supplier, admin)
- [x] `customer_profiles` table
- [x] `worker_profiles` table
- [x] `password_recovery` table (NEW requirement)
- [x] `email_verification` table
- [x] Sample test data: 5 customers, 5 workers, 1 admin

#### **2. Backend APIs (15% of 35%)**
**Must-Have Endpoints:**
```
POST /api/auth/register          → User registration
POST /api/auth/login             → User login (JWT token)
POST /api/auth/forgot-password   → Password recovery (NEW)
POST /api/auth/reset-password    → Reset password with token
GET  /api/users/profile          → Get logged-in user profile
PUT  /api/users/profile          → Update user profile
```

**Implementation Status:**
- ✅ Registration with email validation
- ✅ Login with JWT token generation
- ✅ Password reset token generation (24-hour expiry)
- ✅ BCrypt password hashing
- ⏳ Profile picture upload (optional for 35%)

#### **3. Frontend UI (10% of 35%)**
**Must-Have Pages:**
- ✅ Registration Form (with role selection)
- ✅ Login Form
- ✅ Forgot Password Form
- ✅ Reset Password Form
- ✅ Profile View Page (basic display)
- ⏳ Profile Edit Page (can show mockup)

**UI Requirements:**
- Basic forms with validation (email format, password strength)
- Success/error messages displayed
- Redirect after login to dashboard (placeholder page)

#### **4. Demonstration Script (Week 6 Presentation)**
```
DEMO FLOW (3 minutes):

1. Show Registration Form
   - Fill in: Email, Password, Role = "Worker"
   - Submit → Show success message
   - Show database: New user record created

2. Show Login Form
   - Enter credentials → Get JWT token
   - Show token in browser console
   - Redirect to profile page

3. Show Forgot Password Flow
   - Enter email → Show "Reset link sent" message
   - Show database: password_recovery table has token
   - Manually copy token, paste in reset form
   - Submit new password → Show success

4. Show Profile Page
   - Display user info from database
   - Show edit button (can be non-functional mockup)
```

---

## 💼 MEMBER 2: JOB POSTING MANAGEMENT (35% Checklist)

### ✅ **What to Deliver by Week 6:**

#### **1. Database (10% of 35%)**
- [x] `job_categories` table with 5 sample categories
- [x] `job_subcategories` table
- [x] `jobs` table
- [x] `job_attachments` table
- [x] Sample test data: 10 jobs (3 active, 2 completed, 5 drafts)

#### **2. Backend APIs (15% of 35%)**
**Must-Have Endpoints:**
```
POST /api/jobs                   → Create job
GET  /api/jobs                   → List all jobs (with filters)
GET  /api/jobs/{id}              → Get job details
PUT  /api/jobs/{id}              → Update job
DELETE /api/jobs/{id}            → Delete job
GET  /api/jobs/categories        → Get all categories
```

**Implementation Status:**
- ✅ Create job with title, description, category, budget
- ✅ List jobs with filters (by district, urgency, status)
- ✅ Get job details by ID
- ✅ Update job (edit title, description)
- ⏳ Image upload (can simulate with file path only)

#### **3. Frontend UI (10% of 35%)**
**Must-Have Pages:**
- ✅ Job Creation Form
- ✅ Job List Page (with cards/table)
- ✅ Job Details Page
- ⏳ Job Edit Form (can show mockup)

**UI Requirements:**
- Category dropdown (from database)
- Urgency level selector (emergency, urgent, standard)
- Budget range inputs (min/max)
- District/city dropdowns
- Job cards showing title, budget, location, urgency

#### **4. Demonstration Script (Week 6 Presentation)**
```
DEMO FLOW (3 minutes):

1. Show Job Creation Form
   - Select Category: "Electrical"
   - Enter Title: "Fix ceiling fan wiring"
   - Enter Description, Budget (Rs. 2000-3000)
   - Select District: "Colombo", Urgency: "Urgent"
   - Submit → Show success message

2. Show Job List Page
   - Display 10 jobs in cards (title, budget, location)
   - Apply filter: District = "Colombo" → Show 5 jobs
   - Click on a job card → Navigate to details page

3. Show Job Details Page
   - Display full job info (title, description, budget, category)
   - Show "Edit" and "Delete" buttons
   - Click delete → Confirm dialog → Job removed

4. Show database
   - Jobs table has 9 remaining jobs
```

---

## 📅 MEMBER 3: BOOKING MANAGEMENT & WORKFLOW (35% Checklist)

### ✅ **What to Deliver by Week 6:**

#### **1. Database (10% of 35%)**
- [x] `bookings` table with status enum
- [x] `booking_status_history` table
- [x] `worker_availability` table
- [x] Sample test data: 8 bookings in different states (2 requested, 2 accepted, 2 in-progress, 2 completed)

#### **2. Backend APIs (15% of 35%)**
**Must-Have Endpoints:**
```
POST /api/bookings               → Create booking
GET  /api/bookings               → List bookings (worker/customer view)
GET  /api/bookings/{id}          → Get booking details
PUT  /api/bookings/{id}/accept   → Worker accepts booking
PUT  /api/bookings/{id}/complete → Mark booking as completed
PUT  /api/bookings/{id}/cancel   → Cancel booking
```

**Implementation Status:**
- ✅ Create booking (link job + worker + customer)
- ✅ Accept booking (status: requested → accepted)
- ✅ State transition validation (can't complete if not accepted)
- ✅ Booking status history tracking
- ⏳ Conflict detection (optional for 35%)

#### **3. Frontend UI (10% of 35%)**
**Must-Have Pages:**
- ✅ Booking Request Form (for customer)
- ✅ Booking List Page (for worker/customer)
- ✅ Booking Details Page
- ⏳ Availability Calendar (can show mockup)

**UI Requirements:**
- Status badges (requested=yellow, accepted=green, completed=blue)
- Action buttons contextual to status (Accept/Reject if requested)
- Booking timeline showing status changes
- Scheduled date/time display

#### **4. Demonstration Script (Week 6 Presentation)**
```
DEMO FLOW (3 minutes):

1. Show Booking Request (Customer View)
   - Select a job from dropdown
   - Select a worker from dropdown
   - Pick scheduled date/time
   - Submit → Booking created with status "requested"

2. Show Worker Booking List
   - Display bookings with status badges
   - Click on "requested" booking
   - Show "Accept" and "Reject" buttons

3. Accept Booking
   - Click Accept → Status changes to "accepted"
   - Show booking_status_history table: transition logged

4. Complete Booking
   - Navigate to "accepted" booking
   - Click "Mark as Completed"
   - Status changes to "completed"
   - Show database: booking status updated
```

---

## ⭐ MEMBER 4: COMPLAINT, FEEDBACK & REVIEW + ADMIN (35% Checklist)

### ✅ **What to Deliver by Week 6:**

#### **1. Database (10% of 35%)**
- [x] `reviews` table
- [x] `review_ratings` table (multi-aspect)
- [x] `messages` table
- [x] `message_threads` table
- [x] `complaints` table
- [x] Sample test data: 6 reviews, 3 message threads, 2 complaints

#### **2. Backend APIs (15% of 35%)**
**Must-Have Endpoints:**
```
POST /api/reviews                → Submit review
GET  /api/reviews/worker/{id}    → Get worker reviews
POST /api/messages               → Send message
GET  /api/messages/thread/{id}   → Get message thread
POST /api/complaints             → Submit complaint
GET  /api/admin/complaints       → List complaints (admin)
```

**Implementation Status:**
- ✅ Submit review with multi-aspect ratings (quality, punctuality, etc.)
- ✅ Calculate average rating for worker
- ✅ Send message in thread
- ✅ Retrieve messages for a booking
- ✅ Submit complaint
- ⏳ Real-time messaging (can show simple chat UI, polling for 35%)

#### **3. Frontend UI (10% of 35%)**
**Must-Have Pages:**
- ✅ Review Submission Form
- ✅ Worker Profile with Reviews Display
- ✅ Simple Message Chat UI
- ✅ Complaint Submission Form
- ✅ Admin Complaint List (basic table)

**UI Requirements:**
- Star rating inputs (1-5 stars) for each aspect
- Review text area
- Message chat bubbles (sender on right, receiver on left)
- Complaint form with category dropdown

#### **4. Demonstration Script (Week 6 Presentation)**
```
DEMO FLOW (3 minutes):

1. Show Review Submission
   - Select completed booking
   - Rate: Quality=5, Punctuality=4, Professionalism=5
   - Enter review text: "Great work, on time!"
   - Submit → Review saved

2. Show Worker Profile
   - Display worker name, skills, average rating (4.7★)
   - Show 3 reviews with ratings and text
   - Demonstrate that avg rating was calculated

3. Show Simple Chat
   - Display message thread for a booking
   - Type message: "What time will you arrive?"
   - Send → Message appears in chat
   - Show database: messages table has new row

4. Show Admin Complaint Management
   - Login as admin
   - View complaints table (2 pending complaints)
   - Click on a complaint → Show details
   - Mark as "investigating" → Status updated
```

---

## 🔧 MEMBER 5: TOOL & EQUIPMENT RENTAL MANAGEMENT (35% Checklist)

### ✅ **What to Deliver by Week 6:**

#### **1. Database (10% of 35%)**
- [x] `supplier_profiles` table
- [x] `equipment_categories` table
- [x] `equipment_inventory` table
- [x] `equipment_bookings` table
- [x] `equipment_late_fees` table (NEW requirement)
- [x] Sample test data: 2 suppliers, 10 equipment items, 5 bookings (2 overdue)

#### **2. Backend APIs (15% of 35%)**
**Must-Have Endpoints:**
```
POST /api/equipment                      → Add equipment
GET  /api/equipment                      → List equipment
GET  /api/equipment/{id}                 → Get equipment details
POST /api/equipment/bookings             → Book equipment
GET  /api/equipment/bookings/{id}        → Get booking details
POST /api/equipment/bookings/{id}/return → Mark as returned
GET  /api/equipment/late-fees/{id}       → Calculate late fee
```

**Implementation Status:**
- ✅ Add equipment with name, category, rental price, deposit
- ✅ List available equipment (quantity > 0)
- ✅ Book equipment (reduces quantity_available)
- ✅ Calculate late fee (stored procedure)
- ✅ Mark as returned (restores quantity)
- ⏳ Conflict detection for quantity (optional for 35%)

#### **3. Frontend UI (10% of 35%)**
**Must-Have Pages:**
- ✅ Equipment List Page
- ✅ Equipment Booking Form
- ✅ Booking Details with Late Fee Display
- ⏳ Supplier Dashboard (can show mockup)

**UI Requirements:**
- Equipment cards showing name, price/day, deposit, availability
- Booking form with date pickers (start/end date)
- Late fee calculation displayed (if overdue)
- Status badges (reserved, rented_out, returned)

#### **4. Demonstration Script (Week 6 Presentation)**
```
DEMO FLOW (3 minutes):

1. Show Equipment List
   - Display 10 equipment items with prices
   - Filter by category: "Power Tools" → Show 5 items
   - Click on "Electric Drill" → Show details

2. Book Equipment
   - Select start date: Feb 20, 2026
   - Select end date: Feb 22, 2026 (2 days)
   - Show cost calculation: Rs. 500/day × 2 = Rs. 1000
   - Deposit: Rs. 2000
   - Submit → Booking created with status "reserved"

3. Demonstrate Late Fee Calculation
   - Show booking that should have been returned on Feb 18
   - Current date: Feb 21 (3 days overdue)
   - Call late fee API → Rs. 500/day × 10% = Rs. 50/day
   - Total late fee: Rs. 50 × 3 = Rs. 150
   - Show equipment_late_fees table: Record created

4. Return Equipment
   - Mark booking as "returned"
   - Quantity_available increases by 1
   - Show database: equipment inventory updated
```

---

## 🎯 SUMMARY: 35% COMPLETION METRICS

| Member | Component | Database Tables | API Endpoints | UI Pages | Demo Time |
|--------|-----------|-----------------|---------------|----------|-----------|
| 1 | User Management | 5/10 created | 6/12 working | 5/8 pages | 3 mins |
| 2 | Job Posting | 4/7 created | 6/10 working | 3/5 pages | 3 mins |
| 3 | Booking Management | 4/9 created | 6/10 working | 3/6 pages | 3 mins |
| 4 | Review & Admin | 6/16 created | 6/12 working | 5/10 pages | 3 mins |
| 5 | Tool Rental | 5/9 created | 7/10 working | 3/6 pages | 3 mins |

**Total Presentation Time:** 15-18 minutes (within 20-minute limit)

---

## 📋 TESTING CHECKLIST (Each Member)

Before Week 6 presentation, ensure:

✅ **Database:**
- [ ] Tables created without errors
- [ ] Sample test data inserted (at least 5-10 records per table)
- [ ] Foreign key relationships working

✅ **Backend:**
- [ ] APIs tested in Postman (save Postman collection)
- [ ] Endpoints return correct HTTP status codes (200, 201, 400, 404)
- [ ] Error messages are clear (not just stack traces)

✅ **Frontend:**
- [ ] Forms validate input (email format, required fields)
- [ ] Success/error messages displayed after API calls
- [ ] Loading indicators shown during API calls

✅ **Integration:**
- [ ] Frontend can call your backend APIs
- [ ] Data from database displays correctly in UI
- [ ] Create → Read flow works (e.g., create job, then view job list)

✅ **Demo Preparation:**
- [ ] Test data prepared in database
- [ ] Demo script practiced (rehearse 2-3 times)
- [ ] Screenshots taken as backup (in case demo fails)
- [ ] Backup plan: Show Postman API calls if UI fails

---

## 🚀 DEPLOYMENT CHECKLIST (Week 6)

**Backend Deployment (Spring Boot):**
1. Deploy to Render.com or Railway.app
2. Set environment variables (DB connection string, JWT secret)
3. Test deployed API with Postman
4. Share API base URL with team (e.g., https://your-app.onrender.com/api)

**Frontend Deployment (React):**
1. Deploy to Vercel or Netlify
2. Update API base URL to deployed backend
3. Test all pages load correctly
4. Share deployed URL (e.g., https://your-app.vercel.app)

**Database:**
1. Use Railway MySQL or PlanetScale (free tier)
2. Import schema.sql file
3. Insert test data
4. Share connection string with team (DO NOT commit to GitHub)

---

## ⏰ TIMELINE REMINDER

**Week 6 Presentation:** Next week!

**What to bring:**
1. Laptop with demo ready (local or deployed)
2. Postman collection (backup if demo fails)
3. Screenshots of UI (backup if demo fails)
4. This implementation guide (as speaker notes)
5. Database schema diagram (show table relationships)

**Rehearse:**
- Each member: Practice your 3-minute demo
- Full team: Run through entire 15-minute presentation
- Timing: Keep under 20 minutes total (leave buffer for Q&A)

---

**Document Prepared By**: ITP_SE_01 Team  
**Purpose**: Assignment 2 - Week 6 Presentation Guide  
**Status**: 35% Implementation Roadmap
