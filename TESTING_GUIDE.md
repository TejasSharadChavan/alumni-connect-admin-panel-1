# 🧪 Testing Guide - Resume Upload & Referral System

## ✅ What's Ready to Test

All features have been implemented and the database has been migrated. You can now test:

1. **Resume Upload System**
2. **Referral Management (Alumni)**
3. **Enhanced Job Applications (Students)**
4. **Application Tracking (Students)**

---

## 🚀 Quick Start

### 1. Start the Development Server

```bash
cd alumni-connect-admin-panel-1
bun run dev
```

The app will be available at `http://localhost:3000`

---

## 👥 Test Accounts

Use these credentials to test different roles:

### Alumni Account

- **Email:** `alumni@test.com`
- **Password:** (your test password)

### Student Account

- **Email:** `student@test.com`
- **Password:** (your test password)

---

## 🧪 Test Scenarios

### Scenario 1: Alumni Creates Referral Codes

1. **Login as Alumni**
   - Go to `http://localhost:3000`
   - Login with alumni credentials

2. **Navigate to Referrals**
   - Click "Referrals" in the sidebar
   - You should see the referral management page

3. **Create a New Referral**
   - Click "Create Referral" button
   - Fill in the form:
     - Company: "Tesla"
     - Position: "Software Engineer"
     - Description: "Join our autonomous driving team"
     - Max Uses: 10
     - Expires At: (select a future date)
   - Click "Create Referral"
   - ✅ You should see a success message with the generated code

4. **View Your Referrals**
   - ✅ The new referral should appear in the list
   - ✅ You should see: code, company, position, usage count, status
   - ✅ Copy the referral code for the next test

5. **Test Referral Actions**
   - Click "Deactivate" on a referral
   - ✅ Status should change to "Inactive"
   - Click "Activate" to reactivate it
   - ✅ Status should change back to "Active"

---

### Scenario 2: Student Applies with Resume & Referral

1. **Login as Student**
   - Logout from alumni account
   - Login with student credentials

2. **Navigate to Jobs**
   - Click "Jobs" in the sidebar
   - Browse available jobs

3. **Apply for a Job**
   - Click "Apply" on any job posting
   - ✅ You should see the application dialog

4. **Upload Resume**
   - Click "Choose File" or drag & drop a resume
   - ✅ Supported formats: PDF, DOC, DOCX
   - ✅ Max size: 5MB
   - ✅ You should see upload progress
   - ✅ After upload, you should see the filename

5. **Enter Referral Code**
   - Paste the referral code from Scenario 1
   - Example: `GOOGLE-AB12` or `TESLA-XXXX`
   - ✅ The code should be auto-converted to uppercase

6. **Add Cover Letter (Optional)**
   - Write a brief cover letter

7. **Submit Application**
   - Click "Submit Application"
   - ✅ You should see a success message
   - ✅ The dialog should close

---

### Scenario 3: Student Tracks Applications

1. **Navigate to Applications**
   - Click "Applications" in the sidebar
   - ✅ You should see all your applications

2. **View Application Details**
   - ✅ Each application shows:
     - Job title and company
     - Application status (Applied, Interview, Accepted, Rejected)
     - Application date
     - Cover letter preview
   - ✅ You can filter by status using tabs

3. **Download Resume**
   - Click "Resume" button on any application
   - ✅ Your uploaded resume should download

4. **View Job Details**
   - Click "View Job" button
   - ✅ Opens the job posting in a new tab

---

### Scenario 4: Alumni Tracks Referral Usage

1. **Login as Alumni**
   - Switch back to alumni account

2. **Check Referral Usage**
   - Go to "Referrals" page
   - ✅ The referral you created should show:
     - Used Count: 1 (or more if you applied multiple times)
     - Status: Active
   - ✅ Usage count should increment each time a student uses it

---

## 🔍 What to Look For

### ✅ Resume Upload

- [ ] Only PDF, DOC, DOCX files are accepted
- [ ] Files over 5MB are rejected
- [ ] Upload progress is shown
- [ ] Filename is displayed after upload
- [ ] Submit button is disabled until resume is uploaded
- [ ] Resume is stored in `public/uploads/resumes/`

### ✅ Referral System

- [ ] Alumni can create referrals
- [ ] Codes are auto-generated (COMPANY-XXXX format)
- [ ] Codes are unique
- [ ] Alumni can activate/deactivate referrals
- [ ] Usage count updates when students apply
- [ ] Expired referrals are marked
- [ ] Max uses limit is enforced

### ✅ Job Applications

- [ ] Resume upload is mandatory
- [ ] Referral code is optional
- [ ] Invalid referral codes are rejected
- [ ] Valid referral codes are accepted
- [ ] Application is created successfully
- [ ] Referral usage is tracked

### ✅ Application Tracking

- [ ] All applications are listed
- [ ] Status filtering works
- [ ] Application details are shown
- [ ] Resume can be downloaded
- [ ] Job details can be viewed

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to upload file"

**Solution:** Check that the `public/uploads/resumes/` directory exists and has write permissions.

### Issue: "Invalid referral code"

**Solution:**

- Make sure the code is active
- Check that it hasn't expired
- Verify it hasn't reached max uses
- Ensure the code exists in the database

### Issue: "Resume not found"

**Solution:** Check that the file was uploaded successfully and exists in `public/uploads/resumes/`

### Issue: Applications not showing

**Solution:** Make sure you're logged in as the student who created the applications

---

## 📊 Database Verification

You can verify the data in the database:

```bash
# Open Drizzle Studio
cd alumni-connect-admin-panel-1
bun run drizzle-kit studio
```

Then check:

- `referrals` table - Should have your created referrals
- `referral_usage` table - Should track when students use codes
- `applications` table - Should have `resume_url` field populated

---

## 🎯 Success Criteria

All features are working if:

1. ✅ Alumni can create and manage referral codes
2. ✅ Students can upload resumes when applying
3. ✅ Students can use referral codes (optional)
4. ✅ Invalid referral codes are rejected
5. ✅ Referral usage is tracked correctly
6. ✅ Students can view all their applications
7. ✅ Students can download their resumes
8. ✅ Application status filtering works
9. ✅ No TypeScript errors
10. ✅ No console errors

---

## 📝 Test Data

Sample referral codes have been seeded:

- `GOOGLE-AB12` - Google Software Engineer
- `MICROSOFT-CD34` - Microsoft Product Manager
- `AMAZON-EF56` - Amazon Data Scientist

You can use these codes when testing student applications!

---

## 🚀 Next Steps

After testing, you can:

1. Add more job postings
2. Create more referral codes
3. Test with multiple students
4. Verify referral analytics
5. Test edge cases (expired codes, max uses, etc.)

---

**Happy Testing! 🎉**
