# 🎯 Referral System - Complete Guide

## ✅ System Status: IMPLEMENTED & WORKING

The referral system is fully implemented and allows alumni to create referral codes that students can use when applying for jobs.

## 🔄 How It Works

### For Alumni (Creating Referrals)

#### 1. Access Referrals Page

- Navigate to: `/alumni/referrals`
- Click "Create Referral" button

#### 2. Create New Referral

**Required Fields:**

- **Company:** Name of the company (e.g., Google, Microsoft)
- **Position:** Job title (e.g., Software Engineer, Data Scientist)

**Optional Fields:**

- **Description:** Additional details about the referral
- **Maximum Uses:** How many students can use this code (default: 10)
- **Expiry Date:** When the referral expires (optional)

#### 3. Generated Referral Code

- System automatically generates unique code: `COMPANY-XXXX`
- Example: `GOOGLE-A1B2`, `MICROSOFT-C3D4`
- Alumni can copy and share this code with students

### For Students (Using Referrals)

#### 1. Job Application Process

- Browse jobs at: `/student/jobs`
- Click on any job to view details
- Click "Apply Now" button

#### 2. Enter Referral Code

- In the application form, find "Referral Code (Optional)" field
- Enter the code provided by alumni (e.g., `GOOGLE-A1B2`)
- Code is automatically converted to uppercase

#### 3. Submit Application

- Complete other required fields (resume, cover letter)
- Submit application with referral code included

## 📊 Features

### Alumni Dashboard

- ✅ View all created referrals
- ✅ See usage statistics (used/total)
- ✅ Copy referral codes easily
- ✅ Track expiry dates
- ✅ Monitor active/inactive status

### Student Application

- ✅ Optional referral code field in job applications
- ✅ Automatic code validation and formatting
- ✅ Clear instructions for students

### System Tracking

- ✅ Referral usage tracking
- ✅ Application linking to referral codes
- ✅ Usage count management
- ✅ Expiry date enforcement

## 🧪 Testing the System

### Test as Alumni

1. **Login:** `rahul.agarwal@gmail.com` / `Password@123`
2. **Navigate:** `/alumni/referrals`
3. **Create Referral:**
   - Company: "Google"
   - Position: "Software Engineer"
   - Max Uses: 5
4. **Copy Code:** Use the generated code

### Test as Student

1. **Login:** `aarav.sharma@terna.ac.in` / `Password@123`
2. **Navigate:** `/student/jobs`
3. **Apply to Job:**
   - Click any job → "Apply Now"
   - Enter the referral code from alumni
   - Submit application

### Verify System

1. **Check Application:** Admin can see referral code in job applications
2. **Check Usage:** Alumni can see usage count increased
3. **Check Database:** Referral usage is tracked

## 📁 Technical Implementation

### Database Tables

#### 1. Referrals Table

```sql
referrals:
- id (primary key)
- alumniId (foreign key to users)
- code (unique referral code)
- company (company name)
- position (job position)
- description (optional details)
- maxUses (maximum usage limit)
- usedCount (current usage count)
- isActive (active/inactive status)
- expiresAt (expiry date)
- createdAt (creation timestamp)
```

#### 2. Job Applications Table

```sql
jobApplications:
- referralCode (text field for referral code)
- (other application fields...)
```

#### 3. Referral Usage Table

```sql
referralUsage:
- id (primary key)
- referralId (foreign key to referrals)
- studentId (foreign key to users)
- jobId (foreign key to jobs)
- usedAt (usage timestamp)
```

### API Endpoints

#### Alumni APIs

- `GET /api/referrals` - Get user's referrals
- `POST /api/referrals` - Create new referral

#### Student APIs

- `POST /api/jobs/[id]/apply` - Apply to job (includes referralCode field)

### Frontend Components

- `/alumni/referrals/page.tsx` - Alumni referral management
- `/student/jobs/[id]/page.tsx` - Student job application with referral field

## 🎯 Usage Examples

### Example 1: Google Referral

**Alumni Creates:**

- Company: "Google"
- Position: "Software Engineer Intern"
- Code Generated: `GOOGLE-X7Y9`

**Student Uses:**

- Applies to Google internship posting
- Enters code: `GOOGLE-X7Y9`
- Application submitted with referral link

### Example 2: Microsoft Referral

**Alumni Creates:**

- Company: "Microsoft"
- Position: "Product Manager"
- Max Uses: 3
- Expires: 2024-12-31
- Code Generated: `MICROSOFT-M4N8`

**Students Use:**

- 3 different students can use this code
- Code expires on December 31, 2024
- Usage tracked automatically

## 🔧 Current Status

### ✅ Working Features

- Alumni can create referrals
- Students can use referral codes in applications
- Usage tracking and limits
- Expiry date management
- Code generation and validation

### 🔄 API Status

- ✅ Referrals API: Fixed authentication
- ✅ Job Application API: Includes referral code handling
- ✅ Database Schema: Complete referral system tables

### 🎨 UI Status

- ✅ Alumni referral management interface
- ✅ Student referral code input in job applications
- ✅ Copy-to-clipboard functionality
- ✅ Usage statistics display

## 📈 Benefits

### For Alumni

- Help students get job opportunities
- Track referral success and usage
- Build stronger alumni-student connections
- Contribute to college placement success

### For Students

- Access to exclusive job opportunities
- Alumni network support in applications
- Higher chance of application success
- Direct connection to industry professionals

### For Companies

- Quality candidate referrals from trusted sources
- Alumni network validation
- Streamlined recruitment process
- Better candidate-company fit

## 🚀 Next Steps (Optional Enhancements)

1. **Referral Analytics:**
   - Success rate tracking
   - Application outcome monitoring
   - ROI analysis for referrals

2. **Notification System:**
   - Alert alumni when referral is used
   - Notify about application outcomes
   - Expiry reminders

3. **Referral Rewards:**
   - Points system for successful referrals
   - Alumni recognition program
   - Incentive mechanisms

4. **Advanced Features:**
   - Bulk referral creation
   - Referral templates
   - Company-specific referral programs

---

## 🎉 Summary

**The referral system is fully functional and ready to use!**

- ✅ Alumni can create and manage referral codes
- ✅ Students can use codes in job applications
- ✅ System tracks usage and enforces limits
- ✅ All APIs and UI components working
- ✅ Database schema complete

**Ready for production use!** 🚀
