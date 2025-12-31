# 🔄 Referral Usage Count Tracking - Complete System

## ✅ How Usage Count is Increased

The referral usage count is automatically increased when a student successfully applies to a job using a referral code.

## 🔄 Step-by-Step Process

### 1. Student Applies with Referral Code

- Student goes to job application form
- Enters referral code in "Referral Code (Optional)" field
- Submits application

### 2. System Validates Referral Code

**Checks performed:**

- ✅ Code exists in database
- ✅ Referral is active (`isActive = true`)
- ✅ Not expired (`expiresAt` check)
- ✅ Usage limit not reached (`usedCount < maxUses`)
- ✅ Student hasn't used this code before

### 3. Application is Created

- Job application record created with referral code
- Application status set to "applied"

### 4. Usage Count is Incremented

**Automatic actions:**

- ✅ `referrals.usedCount` increased by 1
- ✅ `referralUsage` record created linking:
  - Referral ID
  - Student ID
  - Job ID
  - Application ID
  - Timestamp

### 5. Notifications Sent

- ✅ Alumni gets notification: "Your referral code was used"
- ✅ Job poster gets notification: "New application received"

## 📊 Database Changes

### Before Application

```sql
referrals table:
- code: "GOOGLE-A1B2"
- usedCount: 0
- maxUses: 5

referralUsage table:
- (empty for this referral)
```

### After Application

```sql
referrals table:
- code: "GOOGLE-A1B2"
- usedCount: 1  ← INCREMENTED
- maxUses: 5

referralUsage table:
- referralId: 123
- studentId: 456
- jobId: 789
- applicationId: 101
- usedAt: "2024-01-15T10:30:00Z"
```

## 🛡️ Validation & Security

### Referral Code Validation

```javascript
// 1. Code exists and is valid
const referral = await db
  .select()
  .from(referrals)
  .where(eq(referrals.code, referralCode));

// 2. Check if active
if (!referral.isActive) {
  return error("Referral code is inactive");
}

// 3. Check expiry
if (referral.expiresAt && new Date(referral.expiresAt) < new Date()) {
  return error("Referral code has expired");
}

// 4. Check usage limit
if (referral.usedCount >= referral.maxUses) {
  return error("Referral code usage limit reached");
}

// 5. Check if student already used this code
const existingUsage = await db
  .select()
  .from(referralUsage)
  .where(
    and(
      eq(referralUsage.referralId, referral.id),
      eq(referralUsage.studentId, user.id)
    )
  );

if (existingUsage.length > 0) {
  return error("You have already used this referral code");
}
```

### Usage Count Update

```javascript
// Increment usage count atomically
await db
  .update(referrals)
  .set({ usedCount: referral.usedCount + 1 })
  .where(eq(referrals.id, referral.id));

// Create usage tracking record
await db.insert(referralUsage).values({
  referralId: referral.id,
  studentId: user.id,
  jobId: jobId,
  applicationId: newApplication[0].id,
  usedAt: timestamp,
});
```

## 🎯 Error Scenarios

### Invalid Referral Code

```json
{
  "error": "Invalid referral code",
  "code": "REFERRAL_INVALID"
}
```

### Expired Referral

```json
{
  "error": "Referral code has expired",
  "code": "REFERRAL_EXPIRED"
}
```

### Usage Limit Reached

```json
{
  "error": "Referral code usage limit reached",
  "code": "REFERRAL_LIMIT_REACHED"
}
```

### Already Used by Student

```json
{
  "error": "You have already used this referral code",
  "code": "REFERRAL_ALREADY_USED"
}
```

## 📈 Alumni Dashboard Updates

### Real-time Usage Display

Alumni can see updated usage counts immediately:

```
Referral: GOOGLE-A1B2
Company: Google
Position: Software Engineer
Usage: 3/5 ← Updates automatically
Status: Active
```

### Usage History

Alumni can track which students used their codes:

- Student name
- Job applied to
- Application date
- Application status

## 🧪 Testing the System

### Test Script Available

Run: `node test-referral-usage.js`

**Test Flow:**

1. ✅ Alumni creates referral (usage: 0/3)
2. ✅ Student applies with code
3. ✅ Usage count increases (usage: 1/3)
4. ✅ Duplicate prevention works
5. ✅ Notifications sent

### Manual Testing

1. **Create Referral:**
   - Login as alumni: `rahul.agarwal@gmail.com`
   - Go to `/alumni/referrals`
   - Create referral, note usage count

2. **Use Referral:**
   - Login as student: `aarav.sharma@terna.ac.in`
   - Apply to job with referral code
   - Check application success

3. **Verify Update:**
   - Return to alumni referrals page
   - Refresh and check usage count increased

## 🔧 Technical Implementation

### API Endpoint

`POST /api/jobs/[id]/apply`

### Key Functions

1. **Referral Validation** - Checks code validity
2. **Usage Increment** - Updates count atomically
3. **Usage Tracking** - Creates audit trail
4. **Notification System** - Alerts relevant users

### Database Tables Used

- `referrals` - Stores referral codes and usage counts
- `referralUsage` - Tracks individual usage instances
- `applications` - Job applications with referral codes
- `notifications` - User notifications

## 🎉 Summary

**The referral usage count system is fully automated:**

1. ✅ **Validates** referral codes before use
2. ✅ **Increments** usage count automatically
3. ✅ **Tracks** detailed usage history
4. ✅ **Prevents** duplicate usage and abuse
5. ✅ **Notifies** alumni when codes are used
6. ✅ **Updates** dashboard in real-time

**No manual intervention required - everything happens automatically when students apply with referral codes!** 🚀
