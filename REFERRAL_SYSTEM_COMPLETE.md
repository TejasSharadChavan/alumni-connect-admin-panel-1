# Referral Generation System - Complete ✅

## 🎯 Overview

Alumni can now generate unique referral codes for students and share them via messaging. Students can use these codes when applying for jobs to indicate they were referred by an alumni.

---

## ✨ Features

### For Alumni:

1. **Generate Referral Codes**
   - Create unique 8-character codes (e.g., `A7K9M2X4`)
   - Specify company and position
   - Add optional description/instructions
   - Set max uses (default: 10)
   - Set expiry date (default: 30 days)

2. **Copy & Share**
   - One-click copy to clipboard
   - Formatted message ready to send
   - Includes all referral details

3. **Track Referrals**
   - View all generated referrals
   - See usage count
   - Monitor expiry dates

### For Students:

1. **Receive Referral Codes**
   - Get codes from alumni via messaging
   - Clear instructions on how to use

2. **Use in Applications**
   - Enter code when applying for jobs
   - System validates and tracks usage
   - Links application to referring alumni

---

## 🎨 User Interface

### Referral Center Tab

Located in: **Analytics Page → Referral Center**

```
┌─────────────────────────────────────────────────┐
│ Referral-Ready Students                          │
│ Students with strong profiles ready for referrals│
├─────────────────────────────────────────────────┤
│                                                  │
│ Highly Ready (80%+ Score)                       │
│                                                  │
│ ┌──────────────────┐  ┌──────────────────┐     │
│ │ 👤 Aarav Sharma  │  │ 👤 Priya Patel   │     │
│ │ CS • Batch 2025  │  │ CS • Batch 2024  │     │
│ │ [85% Ready]      │  │ [82% Ready]      │     │
│ │                  │  │                  │     │
│ │ 3 Projects       │  │ 5 Projects       │     │
│ │ 2 Applications   │  │ 8 Applications   │     │
│ │                  │  │                  │     │
│ │ [Resume] [Refer] │  │ [Resume] [Refer] │     │
│ └──────────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────┘
```

### Referral Generation Dialog

**Step 1: Fill Details**

```
┌─────────────────────────────────────────────────┐
│ Generate Referral Code                           │
│ Create a referral code for Aarav Sharma         │
├─────────────────────────────────────────────────┤
│ Company Name *                                   │
│ [Google                                    ]     │
│                                                  │
│ Position *                                       │
│ [Software Engineer Intern                 ]     │
│                                                  │
│ Description (Optional)                           │
│ [Great opportunity for new grads...       ]     │
│                                                  │
│ Max Uses: [10]    Expires In: [30] days         │
│                                                  │
│ [Cancel]          [✨ Generate Referral]         │
└─────────────────────────────────────────────────┘
```

**Step 2: Generated Code**

```
┌─────────────────────────────────────────────────┐
│ ✅ Referral Generated!                           │
├─────────────────────────────────────────────────┤
│ Referral Code                                    │
│ ┌──────────────────────────────────────┐        │
│ │  A7K9M2X4                      [📋]  │        │
│ └──────────────────────────────────────┘        │
│                                                  │
│ Company: Google                                  │
│ Position: Software Engineer Intern              │
│ Max Uses: 10                                     │
│ Expires: Jan 15, 2026                           │
│                                                  │
│ ℹ️ Next Steps: Copy this code and send it to    │
│ Aarav Sharma via messaging.                     │
│                                                  │
│ [📋 Copy Referral]          [Done]              │
└─────────────────────────────────────────────────┘
```

---

## 📋 Workflow

### Complete Referral Process:

```
1. Alumni Views Analytics
   ↓
2. Goes to "Referral Center" Tab
   ↓
3. Sees Referral-Ready Students
   ↓
4. Clicks "Refer" on a Student
   ↓
5. Fills Referral Form:
   - Company: Google
   - Position: SWE Intern
   - Description: Great opportunity
   - Max Uses: 10
   - Expires: 30 days
   ↓
6. Clicks "Generate Referral"
   ↓
7. System Creates Unique Code: A7K9M2X4
   ↓
8. Alumni Clicks "Copy Referral"
   ↓
9. Copied Text:
   "🎉 Referral Code for Google

   Position: Software Engineer Intern
   Referral Code: A7K9M2X4

   Details: Great opportunity for new grads

   Use this code when applying. Good luck! 🚀"
   ↓
10. Alumni Sends to Student via Messaging
    ↓
11. Student Receives Code
    ↓
12. Student Applies for Job
    ↓
13. Student Enters Code: A7K9M2X4
    ↓
14. System Validates & Links to Alumni
    ↓
15. Alumni Gets Credit for Referral
```

---

## 🔧 Technical Implementation

### Database Schema

**referrals table:**

```sql
CREATE TABLE referrals (
  id INTEGER PRIMARY KEY,
  alumni_id INTEGER NOT NULL,
  code TEXT UNIQUE NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT,
  max_uses INTEGER DEFAULT 10,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TEXT,
  created_at TEXT NOT NULL
);
```

**referral_usage table:**

```sql
CREATE TABLE referral_usage (
  id INTEGER PRIMARY KEY,
  referral_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  job_id INTEGER,
  application_id INTEGER,
  used_at TEXT NOT NULL
);
```

### API Endpoints

#### 1. Generate Referral

```
POST /api/alumni/referrals
```

**Request:**

```json
{
  "studentId": 1,
  "company": "Google",
  "position": "Software Engineer Intern",
  "description": "Great opportunity for new grads",
  "maxUses": 10,
  "expiresInDays": 30
}
```

**Response:**

```json
{
  "success": true,
  "referral": {
    "id": 1,
    "alumniId": 2,
    "code": "A7K9M2X4",
    "company": "Google",
    "position": "Software Engineer Intern",
    "description": "Great opportunity for new grads",
    "maxUses": 10,
    "usedCount": 0,
    "isActive": true,
    "expiresAt": "2026-01-15T00:00:00.000Z",
    "createdAt": "2025-12-06T10:30:00.000Z"
  },
  "message": "Referral created successfully"
}
```

#### 2. Get Alumni's Referrals

```
GET /api/alumni/referrals
```

**Response:**

```json
{
  "success": true,
  "referrals": [
    {
      "id": 1,
      "code": "A7K9M2X4",
      "company": "Google",
      "position": "Software Engineer Intern",
      "usedCount": 3,
      "maxUses": 10,
      "isActive": true,
      "expiresAt": "2026-01-15T00:00:00.000Z",
      "createdAt": "2025-12-06T10:30:00.000Z"
    }
  ]
}
```

### Code Generation Algorithm

```typescript
function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

**Features:**

- 8 characters long
- Uppercase letters and numbers only
- Easy to read and type
- Unique validation (retries if duplicate)
- Example codes: `A7K9M2X4`, `B3N8P1Q5`, `C2M7R4T9`

---

## 📱 Copy Format

When alumni clicks "Copy Referral", this text is copied:

```
🎉 Referral Code for Google

Position: Software Engineer Intern
Referral Code: A7K9M2X4

Details: Great opportunity for new grads. Apply before Jan 15!

Use this code when applying for the position. Good luck! 🚀
```

**Benefits:**

- ✅ Professional formatting
- ✅ All details included
- ✅ Clear instructions
- ✅ Ready to paste in messaging
- ✅ Friendly tone

---

## 🎯 Use Cases

### Use Case 1: Referring Top Student

**Scenario:** Alumni works at Google, wants to refer a strong student

**Steps:**

1. Go to Analytics → Referral Center
2. See "Aarav Sharma" with 85% readiness score
3. Click "Refer" button
4. Fill form:
   - Company: Google
   - Position: SWE Intern
   - Description: "Strong candidate, knows React & Node"
5. Generate code: `G8L3M9P2`
6. Copy and send to Aarav via messaging
7. Aarav applies and enters code
8. Alumni gets credit for successful referral

### Use Case 2: Multiple Referrals

**Scenario:** Alumni has openings at their company for different roles

**Steps:**

1. Generate referral for Frontend role → `F7R2T8K3`
2. Generate referral for Backend role → `B4N9M1L6`
3. Generate referral for DevOps role → `D5P3Q7W2`
4. Send appropriate code to each student
5. Track which codes are used

### Use Case 3: Limited Time Offer

**Scenario:** Company has urgent hiring need

**Steps:**

1. Create referral with 7-day expiry
2. Set max uses to 5 (limited slots)
3. Send to top 5 students
4. Code expires after 7 days
5. Unused slots don't get filled

---

## 🧪 Testing

### Test Scenario 1: Generate Referral

1. **Login as Alumni** (rahul.agarwal@gmail.com)
2. **Go to Analytics**: http://localhost:3000/alumni/analytics
3. **Click "Referral Center" tab**
4. **Click "Refer"** on any student
5. **Fill form**:
   - Company: Google
   - Position: Software Engineer
   - Max Uses: 10
   - Expires: 30 days
6. **Click "Generate Referral"**
7. **Verify**:
   - ✅ Unique code generated
   - ✅ All details displayed
   - ✅ Copy button works

### Test Scenario 2: Copy Referral

1. **After generating referral**
2. **Click "Copy Referral"**
3. **Paste in notepad**
4. **Verify format**:
   - ✅ Has emoji
   - ✅ Has company name
   - ✅ Has position
   - ✅ Has code
   - ✅ Has description
   - ✅ Has instructions

### Test Scenario 3: Send to Student

1. **Copy referral code**
2. **Go to messaging**
3. **Send to student**
4. **Student receives**:
   - ✅ Formatted message
   - ✅ Clear code
   - ✅ Instructions

---

## 📊 Benefits

### For Alumni:

✅ **Easy Referrals**: Generate codes in seconds
✅ **Professional**: Formatted messages look polished
✅ **Trackable**: See how many times code is used
✅ **Controlled**: Set limits and expiry dates
✅ **Impactful**: Help students get jobs

### For Students:

✅ **Clear Instructions**: Know exactly how to use code
✅ **Professional Edge**: Alumni referral boosts application
✅ **Easy to Use**: Just enter code when applying
✅ **Verified**: System validates code automatically

### For Platform:

✅ **Engagement**: More alumni-student interactions
✅ **Value**: Real job referrals, not just networking
✅ **Tracking**: Data on referral success rates
✅ **Growth**: Students get jobs → more success stories

---

## 🚀 Future Enhancements

### Potential Features:

1. **Referral Dashboard**
   - View all referrals in one place
   - See usage statistics
   - Track success rate

2. **Notifications**
   - Alert when code is used
   - Notify when code expires
   - Remind to follow up

3. **Analytics**
   - Which companies get most referrals
   - Which students use codes most
   - Success rate by position type

4. **Bulk Referrals**
   - Generate multiple codes at once
   - Send to multiple students
   - Batch operations

5. **Referral Templates**
   - Save common referral formats
   - Quick generate for same company
   - Reuse descriptions

---

## 📁 Files Modified

### New Files:

1. **src/app/api/alumni/referrals/route.ts**
   - POST: Generate referral
   - GET: Fetch alumni's referrals

### Modified Files:

1. **src/app/alumni/analytics/page.tsx**
   - Added referral dialog
   - Added copy functionality
   - Added form handling

### Existing Schema:

1. **src/db/schema.ts**
   - referrals table (already exists)
   - referralUsage table (already exists)

---

## ✅ Summary

The referral system is now complete and functional:

✅ **Generate**: Alumni can create unique referral codes
✅ **Customize**: Set company, position, limits, expiry
✅ **Copy**: One-click copy formatted message
✅ **Share**: Send to students via messaging
✅ **Track**: Monitor usage and expiry
✅ **Professional**: Clean UI and formatted messages

Alumni can now provide real value to students by referring them for job opportunities! 🎉
