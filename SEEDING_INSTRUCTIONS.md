# Database Seeding Instructions

## Quick Seed via API

To quickly populate the database with sample jobs and events:

1. Make sure your development server is running:

   ```bash
   bun run dev
   ```

2. Call the seed API endpoint:

   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

   Or open your browser and use the browser console:

   ```javascript
   fetch("/api/seed", { method: "POST" })
     .then((r) => r.json())
     .then(console.log);
   ```

This will create:

- **10 sample jobs** (full-time, internships, various companies)
- **5 sample events** (workshops, meetups, webinars, conferences)

## What Was Fixed

### 1. Jobs & Events Visibility

- ✅ Jobs API now allows unauthenticated access (students can view jobs)
- ✅ Jobs API returns data in `{jobs: [...]}` format (consistent with frontend)
- ✅ Alumni and Admin can post jobs
- ✅ Students can apply for jobs
- ✅ All approved jobs and events are visible to everyone

### 2. Navigation Improvements

- ✅ Added back navigation buttons to:
  - `/jobs` page
  - `/events` page
- ✅ Feed page already has proper navigation

### 3. Permissions Summary

**Job Posting Rights:**

- ✅ Alumni - Can post jobs (requires approval if not admin)
- ✅ Admin - Can post jobs (auto-approved)
- ❌ Students - Cannot post jobs
- ❌ Faculty - Cannot post jobs (can be changed if needed)

**Job Application Rights:**

- ✅ Students - Can apply for jobs
- ✅ Alumni - Can apply for jobs
- ✅ Faculty - Can apply for jobs

**Event Creation Rights:**

- ✅ Alumni - Can create events (requires approval if not admin)
- ✅ Faculty - Can create events (requires approval if not admin)
- ✅ Admin - Can create events (auto-approved)
- ❌ Students - Cannot create events

## Sample Data Included

### Jobs:

1. Software Development Engineer - Amazon (Full-time)
2. Frontend Developer - Razorpay (Full-time)
3. Data Scientist - Google (Full-time)
4. DevOps Engineer - Swiggy (Full-time)
5. Full Stack Developer - Zomato (Full-time)
6. Mobile App Developer - CRED (Full-time)
7. Software Engineering Intern - Microsoft (Internship)
8. Data Science Intern - Flipkart (Internship)
9. UI/UX Designer - PhonePe (Full-time)
10. Product Manager - Freshworks (Full-time)

### Events:

1. React & Next.js Workshop (Workshop, Paid)
2. Python Programming & Data Science Bootcamp (Workshop, Paid)
3. Alumni Networking Meetup (Meetup, Free)
4. Career Guidance Webinar (Webinar, Free)
5. Tech Conference 2025 (Conference, Paid)

## Testing the System

1. **As a Student:**
   - Login as a student
   - Navigate to Jobs section
   - Browse and apply for jobs
   - View events and RSVP

2. **As Alumni:**
   - Login as alumni
   - Navigate to Jobs section
   - Click "Post Job" button
   - Fill in job details and submit
   - View your posted jobs in the alumni dashboard

3. **As Admin:**
   - Login as admin
   - View pending jobs/events in approvals section
   - Approve or reject content
   - All admin-posted content is auto-approved

## Notes

- The seed API uses the first alumni user found in the database
- If no alumni users exist, create one first before seeding
- All seeded jobs expire in 60 days
- All seeded events are scheduled for future dates
- You can run the seed API multiple times (it will create duplicates)
