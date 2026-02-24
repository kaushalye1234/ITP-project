# ASSIGNMENT 2 - WEEK 6 COMPLETE DELIVERY PACKAGE
## On-Demand Skilled Worker Booking System
### IT2150: IT Project | Group: ITP_SE_01

---

## 📦 PACKAGE CONTENTS

This package contains **EVERYTHING** you need for Assignment 2 - Week 6 Presentation:

### ✅ **1. Database Schema** (`database_schema.sql`)
- **60+ tables** fully normalized (3NF)
- **Password Recovery System** (NEW requirement)
- **Equipment Late Fee System** (NEW requirement)
- **Stored Procedures** for late fee calculation and trust score updates
- **Triggers** for automatic calculations
- **Sample Data** inserts for categories and skills
- **Ready to Deploy** - Just run in MySQL Workbench

### ✅ **2. SWOT Analysis** (`SWOT_Analysis.md`)
- **Comprehensive SWOT** covering all aspects
- **Linked to Design Decisions** (shows faculty you thought it through)
- **Risk Mitigation Strategies** for each threat
- **Strategic Implications** (SO, ST, WO, WT matrix)
- **~2,800 words** - exceeds assignment requirements

### ✅ **3. 35% Implementation Roadmap** (`35_Percent_Implementation_Roadmap.md`)
- **Detailed checklist** for each member
- **Exact API endpoints** to implement
- **UI pages** required for 35%
- **Demo scripts** (3 minutes per member)
- **Testing checklist** before presentation
- **Deployment guide** (Render, Vercel, Railway)

---

## 🎯 WHAT YOU STILL NEED TO CREATE

I've created the **foundation** (SWOT, Database, Roadmap). Here's what each member needs to do **this week**:

### **ALL MEMBERS: BEFORE YOU CODE**

1. **Install Tools**
   ```bash
   # Backend
   - Java 17+
   - IntelliJ IDEA or VS Code
   - MySQL 8.0
   - Postman (for API testing)
   
   # Frontend
   - Node.js 18+
   - VS Code
   - React DevTools (browser extension)
   ```

2. **Setup Database**
   ```bash
   # In MySQL Workbench
   1. Open database_schema.sql
   2. Execute entire file (creates database + tables)
   3. Verify: Should see 60+ tables
   ```

3. **Create Spring Boot Project**
   ```bash
   # Go to https://start.spring.io
   - Project: Maven
   - Language: Java
   - Spring Boot: 3.2.2
   - Dependencies: Spring Web, Spring Data JPA, MySQL Driver, Spring Security, Lombok
   - Download and extract
   ```

4. **Create React Project**
   ```bash
   npm create vite@latest frontend -- --template react
   cd frontend
   npm install
   npm install axios react-router-dom tailwindcss
   ```

---

## 📋 IMPLEMENTATION PRIORITY (This Week)

### **MEMBER 1: User Management**
**Day 1-2:** Database + Backend APIs
- Create User entity, UserRepository, UserService
- Implement registration API (POST /api/auth/register)
- Implement login API with JWT (POST /api/auth/login)
- Implement password recovery (POST /api/auth/forgot-password)

**Day 3-4:** Frontend UI
- Create RegisterForm.jsx component
- Create LoginForm.jsx component
- Create ForgotPasswordForm.jsx component
- Test end-to-end flow

**Day 5:** Testing + Demo Prep
- Insert test data
- Practice demo (3 minutes)
- Take screenshots as backup

### **MEMBER 2: Job Posting**
**Day 1-2:** Database + Backend APIs
- Create Job entity, JobRepository, JobService
- Implement create job (POST /api/jobs)
- Implement list jobs (GET /api/jobs)
- Implement get job details (GET /api/jobs/{id})

**Day 3-4:** Frontend UI
- Create JobForm.jsx component
- Create JobList.jsx component
- Create JobCard.jsx component
- Display jobs in cards/grid

**Day 5:** Testing + Demo Prep
- Insert 10 sample jobs
- Practice filtering by district
- Prepare demo script

### **MEMBER 3: Booking Management**
**Day 1-2:** Database + Backend APIs
- Create Booking entity, BookingRepository, BookingService
- Implement create booking (POST /api/bookings)
- Implement accept booking (PUT /api/bookings/{id}/accept)
- Implement state transitions with validation

**Day 3-4:** Frontend UI
- Create BookingForm.jsx component
- Create BookingList.jsx component
- Create status badges (requested=yellow, accepted=green)
- Show action buttons based on status

**Day 5:** Testing + Demo Prep
- Insert 8 bookings in different states
- Practice state transition demo
- Show booking_status_history table

### **MEMBER 4: Reviews + Admin**
**Day 1-2:** Database + Backend APIs
- Create Review entity, ReviewRepository, ReviewService
- Implement submit review (POST /api/reviews)
- Implement get reviews (GET /api/reviews/worker/{id})
- Calculate average rating (stored procedure or service method)

**Day 3-4:** Frontend UI
- Create ReviewForm.jsx with star ratings
- Create ReviewList.jsx component
- Create simple ChatUI.jsx (polling, not real-time)
- Create ComplaintForm.jsx

**Day 5:** Testing + Demo Prep
- Insert 6 reviews for 2-3 workers
- Show average rating calculation
- Prepare admin login demo

### **MEMBER 5: Tool Rental**
**Day 1-2:** Database + Backend APIs
- Create Equipment entity, EquipmentRepository, EquipmentService
- Implement add equipment (POST /api/equipment)
- Implement list equipment (GET /api/equipment)
- Implement book equipment (POST /api/equipment/bookings)
- Implement late fee calculation (stored procedure already in schema)

**Day 3-4:** Frontend UI
- Create EquipmentCard.jsx component
- Create EquipmentBookingForm.jsx
- Create LateFeeDisplay.jsx
- Show booking details with late fee

**Day 5:** Testing + Demo Prep
- Insert 10 equipment items
- Create 2 overdue bookings
- Demonstrate late fee calculation
- Practice return flow

---

## 🎨 UI WIREFRAMES (Create This Week)

I recommend using **Figma** for wireframes. Here's a shortcut:

### **Option 1: Use Figma (Recommended)**
1. Go to https://www.figma.com (free account)
2. Create a new file: "Skilled Worker Booking UI"
3. Use these screen sizes: 1440×900 (desktop), 375×812 (mobile)
4. Create wireframes for:
   - Login/Register forms
   - Job list + Job details
   - Booking creation + Booking list
   - Review submission + Review display
   - Equipment list + Equipment booking

### **Option 2: Use HTML/CSS Wireframes (Faster)**
Since you're already coding React, just create your actual UI pages and call them "wireframes" for Assignment 2. They don't need to be fully functional — they can have static data.

Example:
```jsx
// JobCard.jsx (simple wireframe)
function JobCard({ job }) {
  return (
    <div className="border p-4 rounded shadow">
      <h3 className="text-lg font-bold">{job.title}</h3>
      <p className="text-gray-600">{job.district} • {job.urgency}</p>
      <p className="text-green-600 font-semibold">
        Rs. {job.budget_min} - {job.budget_max}
      </p>
      <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
        View Details
      </button>
    </div>
  );
}
```

Take screenshots of these pages and include in your presentation. Faculty will see you have UI designs ready.

---

## 📊 SYSTEM DIAGRAMS (Create This Week)

You need these diagrams for the presentation:

### **1. Use Case Diagram**
**Tool:** Draw.io (https://app.diagrams.net)

**Actors:**
- Customer
- Worker
- Supplier
- Admin

**Use Cases:**
- Register/Login
- Post Job
- Book Worker
- Submit Review
- Rent Equipment
- Verify Worker (Admin)

### **2. ER Diagram (Database)**
**Tool:** MySQL Workbench (Reverse Engineer)

**Steps:**
1. In MySQL Workbench: Database → Reverse Engineer
2. Select your database
3. It will auto-generate ER diagram
4. Export as PNG
5. Include in presentation

### **3. System Architecture Diagram**
**Tool:** Draw.io

**Components:**
- React Frontend (Client)
- Spring Boot REST API (Server)
- MySQL Database
- JWT Authentication
- File Storage

**Connections:**
- Frontend → REST API (HTTP/HTTPS)
- REST API → Database (JDBC)
- REST API → File Storage

---

## 🎤 WEEK 6 PRESENTATION STRUCTURE (20 mins max)

### **Slide Deck Outline:**

**Slides 1-3: Introduction (2 mins)**
1. Title: Project Name + Team
2. Agenda
3. Problem Statement

**Slides 4-6: SWOT Analysis (3 mins)**
4. Strengths + Opportunities
5. Weaknesses + Threats
6. Mitigation Strategies (linked to design decisions)

**Slides 7-9: System Design (3 mins)**
7. System Architecture Diagram
8. ER Diagram (high-level, not all 60 tables)
9. Use Case Diagram

**Slides 10-19: Individual Component Demos (10 mins)**
10. Member 1: User Management (2 mins)
11. Member 2: Job Posting (2 mins)
12. Member 3: Booking Management (2 mins)
13. Member 4: Reviews + Admin (2 mins)
14. Member 5: Tool Rental (2 mins)

**Slides 20-22: Conclusion (2 mins)**
20. Database Summary (60+ tables, triggers, stored procedures)
21. Next Steps (Sprint 2-4 plan)
22. Q&A

---

## ⚠️ CRITICAL REMINDERS

### **Before Presentation:**
1. ✅ **Rehearse as a team** (at least 2 times)
2. ✅ **Time yourselves** (each demo = 2 mins max)
3. ✅ **Test on presentation laptop** (not just your own)
4. ✅ **Prepare backup** (screenshots, Postman collections)
5. ✅ **Print meeting minutes** (show faculty you collaborated)

### **During Presentation:**
1. ✅ **Arrive 10 minutes early**
2. ✅ **Dress professionally** (business casual)
3. ✅ **Speak clearly** (use technical terms from assignment rubric)
4. ✅ **Show confidence** (you know your component)
5. ✅ **Answer questions honestly** (if you don't know, say "we'll research that")

### **Common Mistakes to Avoid:**
❌ **Don't** show code on slides (boring, wastes time)
❌ **Don't** read from slides (present, don't read)
❌ **Don't** exceed 20 minutes (will be cut off)
❌ **Don't** skip SWOT (it's 4% of marks)
❌ **Don't** forget to submit PDF (6 slides per page)

---

## 📞 NEED HELP?

If you get stuck during implementation:

1. **Database Issues:**
   - Check foreign key relationships are correct
   - Use MySQL Workbench's EER diagram to visualize

2. **Spring Boot Issues:**
   - Check application.properties has correct DB connection
   - Verify @Entity annotations are correct
   - Use Postman to test APIs before connecting frontend

3. **React Issues:**
   - Check axios base URL points to your backend
   - Use browser console to see errors
   - Test API calls in Postman first

4. **Integration Issues:**
   - Check CORS configuration in Spring Boot
   - Verify frontend and backend are both running
   - Use browser Network tab to see API calls

---

## 🎯 SUCCESS CRITERIA

To get **"Excellent"** (20+/25 marks):

✅ **SWOT Analysis (4%)**: Use the provided SWOT_Analysis.md (already exceeds expectations)
✅ **System Diagrams (4%)**: Create Use Case + ER + Architecture diagrams (1-2 hours work)
✅ **35% Implementation (4%)**: Follow the roadmap (5 days of coding)
✅ **Database Design (3%)**: Use the provided schema (already complete)
✅ **UI Mockups (4%)**: Create Figma wireframes or screenshot your React pages (2-3 hours)
✅ **Communication (3%)**: Practice your demo, use technical terms
✅ **Professionalism (2%)**: Arrive early, dress well, time management

**Total estimated effort**: 20-25 hours per member this week (achievable!)

---

## 📁 FILE ORGANIZATION

```
ITP_SE_01_Assignment2/
├── database_schema.sql          ← Run this in MySQL
├── SWOT_Analysis.md             ← Use in presentation
├── 35_Percent_Implementation_Roadmap.md  ← Implementation guide
├── README_Assignment2.md        ← This file
├── diagrams/
│   ├── use_case_diagram.png     ← Create this
│   ├── er_diagram.png           ← Create this
│   ├── architecture_diagram.png ← Create this
├── wireframes/
│   ├── login_wireframe.png      ← Create this
│   ├── job_list_wireframe.png   ← Create this
│   └── ... (more wireframes)
├── presentation/
│   └── Assignment2_Slides.pptx  ← Create this
└── code/
    ├── backend/ (Spring Boot)
    └── frontend/ (React)
```

---

## 🚀 QUICK START (Day 1)

**Morning (9am-12pm):**
1. Install all tools (Java, Node.js, MySQL)
2. Run database_schema.sql in MySQL
3. Create Spring Boot project from start.spring.io
4. Create React project with Vite

**Afternoon (1pm-5pm):**
1. Each member: Create your first entity (User, Job, Booking, Review, Equipment)
2. Each member: Create your first repository interface
3. Each member: Create your first REST controller with one endpoint

**Evening (6pm-8pm):**
1. Test your endpoint in Postman
2. If working: Commit to GitHub
3. If not working: Debug with team on Discord

**Repeat for 5 days**, and you'll have 35% done by Friday!

---

**Good luck with Assignment 2! You've got this! 🎉**

---

**Package Prepared By**: Claude (Anthropic AI)  
**For**: ITP_SE_01 Team  
**Assignment**: IT2150 Assignment 2 - Week 6  
**Date**: February 2026
