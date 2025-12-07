# Referral System - Testing Guide

## 🔍 Why You Might Not See Students

The Referral Center only shows students with a **Readiness Score ≥ 50%**.

### Readiness Score Calculation:

| Criteria         | Points | Requirements                                               |
| ---------------- | ------ | ---------------------------------------------------------- |
| **Skills**       | 25     | 5+ skills = 25pts, 3-4 skills = 15pts, 1-2 skills = 5pts   |
| **Profile**      | 20     | Headline (5), Bio (5), Image (5), Resume (5)               |
| **Projects**     | 25     | 3+ projects = 25pts, 2 projects = 15pts, 1 project = 10pts |
| **Applications** | 15     | 5+ apps = 15pts, 3-4 apps = 10pts, 1-2 apps = 5pts         |
| **Year**         | 15     | Final year = 15pts, Pre-final = 10pts, Others = 5pts       |
| **TOTAL**        | 100    | Minimum 50 to show in Referral Center                      |

---

## 🧪 Quick Test

### Option 1: Check Current Students

1. **Open browser console** (F12)
2. **Login as alumni** (rahul.agarwal@gmail.com)
3. **Go to Analytics page**
4. **Look for console log**: `📊 Referral Ready Data:`
5. **Check the counts**:
   - If all are 0, no students meet the criteria

### Option 2: Run Check Script

```bash
# Get your auth token first
# 1. Login to app
# 2. Open console (F12)
# 3. Run: localStorage.getItem("auth_token")
# 4. Copy the token

node check-referral-ready.js YOUR_TOKEN_HERE
```

This will show you:

- How many students are referral-ready
- Their scores and details
- Why students don't qualify

---

## 🎯 Make a Student Referral-Ready

To test the referral system, you need at least one student with 50+ score.

### Quick Way: Update Existing Student

Run this in your database or create an API endpoint:

```sql
-- Update Aarav to be referral-ready
UPDATE users
SET
  skills = '["React", "Node.js", "Python", "JavaScript", "TypeScript", "MongoDB"]',
  headline = 'Full Stack Developer | MERN Stack',
  bio = 'Passionate developer with experience in web development',
  resumeUrl = 'https://example.com/resume.pdf'
WHERE email = 'aarav.sharma@example.com';

-- Add some projects (if projectSubmissions table exists)
-- This gives project points

-- Add some applications (if applications table exists)
-- This gives application points
```

### Manual Way: Complete Student Profile

1. **Login as a student**
2. **Go to profile settings**
3. **Add**:
   - 5+ skills
   - Headline
   - Bio
   - Profile image
   - Resume
4. **Create 2-3 projects**
5. **Apply for 3-5 jobs**

---

## 📊 Test the Referral Flow

Once you have a referral-ready student:

### Step 1: View Referral Center

```
1. Login as Alumni (rahul.agarwal@gmail.com)
2. Go to: http://localhost:3000/alumni/analytics
3. Click "Referral Center" tab
4. You should see students categorized by score:
   - Highly Ready (80%+)
   - Ready (65-80%)
   - Emerging (50-65%)
```

### Step 2: Generate Referral

```
1. Click "Refer" button on any student
2. Fill the form:
   - Company: Google
   - Position: Software Engineer Intern
   - Description: Great opportunity
   - Max Uses: 10
   - Expires: 30 days
3. Click "Generate Referral"
4. You'll see the generated code (e.g., A7K9M2X4)
```

### Step 3: Copy & Share

```
1. Click "Copy Referral" button
2. Paste in notepad to see formatted message:

   🎉 Referral Code for Google

   Position: Software Engineer Intern
   Referral Code: A7K9M2X4

   Details: Great opportunity

   Use this code when applying. Good luck! 🚀

3. Send this to student via messaging
```

### Step 4: Student Uses Code

```
1. Student receives referral code
2. Student applies for job
3. Student enters code: A7K9M2X4
4. System validates and links to alumni
```

---

## 🐛 Troubleshooting

### Issue: "No Referral-Ready Students Yet"

**Cause**: No students have 50%+ readiness score

**Solution**:

1. Check console log for actual scores
2. Update a student's profile to meet criteria
3. Or lower the threshold in the API (line 145 in referral-ready/route.ts):
   ```typescript
   .filter((s) => s.readinessScore >= 50) // Change to 30 or 20 for testing
   ```

### Issue: Refer Button Not Working

**Cause**: Dialog not opening

**Solution**:

1. Check browser console for errors
2. Verify Dialog component is imported
3. Check if handleReferStudent is defined

### Issue: Can't Generate Referral

**Cause**: API error or validation failure

**Solution**:

1. Check network tab for API errors
2. Verify all required fields are filled
3. Check server logs for errors

---

## 🎨 UI States

### Empty State (No Students)

```
┌─────────────────────────────────────────┐
│ 💼 No Referral-Ready Students Yet       │
│                                         │
│ Students are still building profiles   │
│                                         │
│ Students need: 5+ skills, complete     │
│ profile, projects, and applications    │
└─────────────────────────────────────────┘
```

### With Students

```
┌─────────────────────────────────────────┐
│ ✅ Highly Ready (80%+ Score)            │
│                                         │
│ ┌──────────────┐  ┌──────────────┐    │
│ │ Aarav Sharma │  │ Priya Patel  │    │
│ │ [85% Ready]  │  │ [82% Ready]  │    │
│ │ [Refer]      │  │ [Refer]      │    │
│ └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
```

### Referral Dialog

```
┌─────────────────────────────────────────┐
│ Generate Referral Code                  │
│ For: Aarav Sharma                       │
├─────────────────────────────────────────┤
│ Company: [Google              ]         │
│ Position: [SWE Intern         ]         │
│ Description: [Optional...     ]         │
│ Max Uses: [10]  Expires: [30] days     │
│                                         │
│ [Cancel]  [✨ Generate Referral]        │
└─────────────────────────────────────────┘
```

### Generated Code

```
┌─────────────────────────────────────────┐
│ ✅ Referral Generated!                  │
├─────────────────────────────────────────┤
│ Referral Code                           │
│ ┌────────────────────────┐             │
│ │  A7K9M2X4        [📋]  │             │
│ └────────────────────────┘             │
│                                         │
│ Company: Google                         │
│ Position: SWE Intern                    │
│ Max Uses: 10                            │
│ Expires: Jan 15, 2026                   │
│                                         │
│ [📋 Copy Referral]  [Done]              │
└─────────────────────────────────────────┘
```

---

## ✅ Verification Checklist

- [ ] Can see Referral Center tab
- [ ] Students appear (if any are referral-ready)
- [ ] Can click "Refer" button
- [ ] Dialog opens with form
- [ ] Can fill all fields
- [ ] Can generate referral code
- [ ] Code is unique (8 characters)
- [ ] Can copy referral
- [ ] Copied text is formatted correctly
- [ ] Can close dialog
- [ ] Can generate multiple referrals

---

## 🚀 Next Steps

After testing the referral generation:

1. **Implement Student Side**:
   - Add referral code field in job application form
   - Validate code when student applies
   - Track usage in referralUsage table

2. **Add Referral Dashboard**:
   - Show all alumni's referrals
   - Display usage statistics
   - Show which students used codes

3. **Add Notifications**:
   - Notify alumni when code is used
   - Remind about expiring codes
   - Alert when max uses reached

---

## 📝 Summary

The referral system is **fully implemented** on the alumni side:

- ✅ Generate unique codes
- ✅ Customize company/position
- ✅ Set limits and expiry
- ✅ Copy formatted message
- ✅ Professional UI

The only reason you might not see it working is if there are **no students with 50%+ readiness score** in your database.

Check the console logs or run the check script to see actual student scores!
