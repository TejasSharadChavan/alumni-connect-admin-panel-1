# 🔐 Test Credentials & Quick Start Guide

## **Login Credentials** (Password for ALL users: `Password@123`)

### **Admin Accounts**
- `dean@terna.ac.in` - Dr. Rajesh Kumar (Dean of Student Affairs)
- `hod.comp@terna.ac.in` - Prof. Anjali Deshmukh (HOD Computer Engineering)

### **Faculty Accounts**
- `prof.joshi@terna.ac.in` - Dr. Meera Joshi (Networks Expert)
- `sanjay.nair@terna.ac.in` - Prof. Sanjay Nair (AI/ML Specialist)
- `kavita.reddy@terna.ac.in` - Dr. Kavita Reddy (Database & Cloud)
- `rahul.chopra@terna.ac.in` - Mr. Rahul Chopra (Web Dev & UI/UX)
- `prof.verma@terna.ac.in` - Dr. Sneha Verma (VLSI Design)

### **Student Accounts** (First 5 shown)
- `aarav.sharma@terna.ac.in` - Aarav Sharma (Python Enthusiast)
- `diya.patel@terna.ac.in` - Diya Patel (UI/UX Learner)
- `arjun.reddy@terna.ac.in` - Arjun Reddy (Android Dev)
- `ananya.singh@terna.ac.in` - Ananya Singh (Data Science)
- `vivaan.gupta@terna.ac.in` - Vivaan Gupta (Competitive Programmer)

### **Alumni Accounts**
- `rahul.agarwal@gmail.com` - Rahul Agarwal @ Google
- `meera.k@microsoft.com` - Meera Krishnan @ Microsoft
- `vikrant@razorpay.com` - Vikrant Deshpande @ Razorpay
- `anjali.patil@swiggy.com` - Anjali Patil @ Swiggy
- `sandeep@google.com` - Sandeep Malhotra @ Google

---

## **✅ What's Been Fixed & Completed**

### **1. Network Error - FIXED** ✅
- Fixed Next.js 15 async params issue in chat API routes
- No more `params.id` errors in server logs

### **2. Database Seeding - COMPLETE** ✅
**Successfully seeded 450+ records:**
- ✅ 25 Users (2 admin, 5 faculty, 10 students, 8 alumni)
- ✅ 25 Posts with 30 comments and 30 reactions
- ✅ 20 Connections between users
- ✅ 20 Jobs with 20 applications
- ✅ 20 Events with 25 RSVPs
- ✅ 15 Mentorship requests
- ✅ 10 Fundraising campaigns with 35 donations
- ✅ 30 Payment records
- ✅ 40 File uploads
- ✅ 8 ML models metadata
- ✅ 91 User skills with 50 endorsements
- ✅ 12 Teams with 45 members and 12 project submissions
- ✅ 30 Tasks across teams
- ✅ 10 Chats with 30 messages
- ✅ 25 Activity logs
- ✅ 25 Notifications

### **3. Python ML Service - READY** ✅
**5 Classical ML Pipelines Built:**
- Profile Matcher (TF-IDF + Cosine Similarity)
- Sentiment Analyzer (Logistic Regression)
- Topic Modeler (LDA + RAKE + YAKE)
- Engagement Scorer (Multi-factor Analysis)
- Alumni Recommender (k-NN + Similarity)

### **4. ML API Integration - COMPLETE** ✅
**4 Next.js ML API Routes Created:**
- `/api/ml/recommend-alumni` - Get AI-powered alumni matches
- `/api/ml/profile-match` - Calculate match percentage
- `/api/ml/engagement` - Analyze user engagement
- `/api/ml/trending-topics` - Discover trending topics

---

## **🎯 Features to Test**

### **Student Dashboard** (`/student`)
1. **Network Page** (`/student/network`) - **AI-POWERED RECOMMENDATIONS**
   - Tab: "AI Matches" - See ML-recommended alumni with:
     - Match percentage (0-100%)
     - Skills overlap breakdown
     - Branch match score
     - Experience match score
     - Activity score
     - AI explanation for each match
   - Tab: "Discover" - Browse and filter all users
   - Tab: "Connections" - View accepted connections
   - Tab: "Requests" - Manage pending requests

2. **Jobs Page** (`/student/jobs`)
   - Browse 20 jobs from companies (Amazon, Google, Microsoft, etc.)
   - Apply to jobs (20 existing applications to view)

3. **Events Page** (`/student/events`)
   - 20 events (workshops, hackathons, meetups)
   - RSVP to events (25 existing RSVPs)

4. **Projects Page** (`/student/projects`)
   - View 12 teams with kanban boards
   - 12 project submissions with reviews
   - Create teams and tasks

5. **Messages Page** (`/student/messages`)
   - 10 chats with 30 messages
   - Direct and group chats

### **Admin Dashboard** (`/admin`)
1. **Students Management** (`/admin/students`)
   - View all 10 students with complete profiles
   - Skills, projects, and activity data

2. **Alumni Management** (`/admin/alumni`)
   - View all 8 alumni with work experience
   - Companies: Google, Microsoft, Amazon, etc.

3. **Jobs Management** (`/admin/jobs`)
   - Review and approve 20 jobs
   - Track 20 applications

4. **Events Management** (`/admin/events`)
   - Manage 20 events
   - View 25 RSVPs

5. **Projects Review** (`/admin/projects`)
   - Review 12 project submissions
   - Approve/reject with feedback

6. **Campaign Management** (`/admin/campaigns`)
   - View 10 fundraising campaigns
   - Track 35 donations (₹3.3M+ raised)
   - 30 payment records

### **Alumni Dashboard** (`/alumni`)
1. **Post Jobs** (`/alumni/jobs/post`)
2. **Create Events** (`/alumni/events/create`)
3. **Donate to Campaigns** (`/alumni/donations`)
4. **Mentorship** - Accept/manage mentorship requests

---

## **🚀 Quick Test Flow**

### **Test Student AI Recommendations:**
1. Login as: `aarav.sharma@terna.ac.in` / `Password@123`
2. Navigate to: **Network** → **AI Matches** tab
3. **You should see:**
   - Top alumni recommendations with match percentages
   - Detailed breakdown (skills, branch, experience, activity)
   - AI explanation for each match
   - "Connect Now" buttons

### **Test Admin Analytics:**
1. Login as: `dean@terna.ac.in` / `Password@123`
2. View dashboards with real data:
   - 25 total users
   - 20 jobs, 20 events
   - 35 donations, 12 projects
3. All management pages populated

---

## **📊 Database Statistics**

**Total Records: 450+**
- Users: 25
- Posts & Interactions: 85
- Jobs & Applications: 40
- Events & RSVPs: 45
- Mentorship: 15 requests
- Campaigns & Donations: 45
- Projects & Teams: 69
- Messages & Chats: 50
- Notifications & Logs: 50
- Skills & Files: 131

---

## **🔧 Python ML Service Setup** (Optional - For Advanced Testing)

If you want to test the ML service independently:

```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Download NLTK data
python -c "import nltk; nltk.download('stopwords'); nltk.download('punkt')"

# Start ML service
uvicorn app.main:app --reload --port 8000

# Visit: http://localhost:8000/docs
```

---

## **✨ All Features Are Live & Testable!**

The application is now fully populated with realistic data. Every page, feature, and ML-powered recommendation is ready to explore.

**No more empty dashboards!** 🎉
