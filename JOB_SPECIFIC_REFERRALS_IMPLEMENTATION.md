# 🔧 Job-Specific Referrals Implementation Guide

## Current Status: PARTIALLY IMPLEMENTED

The job-specific referral system has been implemented in code but requires a database migration to be fully functional.

## 🚨 Issue Identified

**Error:** `SQLite error: table referrals has no column named job_id`

**Cause:** The database schema was updated in code but the actual database table hasn't been migrated yet.

## 🔄 Implementation Steps

### Step 1: Run Database Migration

**Option A: Automatic Migration (Recommended)**

```bash
# Run the migration script
node run-migration.js
```

**Option B: Manual Migration**

```sql
-- Connect to your database and run:
ALTER TABLE referrals ADD COLUMN job_id INTEGER REFERENCES jobs(id);
```

### Step 2: Enable Job-Specific Features

After migration, update the API code:

**File:** `src/app/api/referrals/route.ts`

1. **Uncomment job validation:**

```javascript
// Remove the /* */ comments around the job validation code
if (jobId) {
  const jobResult = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.postedById, user.id)))
    .limit(1);

  if (jobResult.length === 0) {
    return NextResponse.json(
      {
        error:
          "Job not found or you don't have permission to create referrals for this job",
      },
      { status: 403 }
    );
  }
}
```

2. **Enable jobId in referral creation:**

```javascript
// Uncomment this line:
jobId: jobId || null,
```

3. **Enable job information in queries:**

```javascript
// Replace the simple query with the full join query:
const userReferrals = await db
  .select({
    id: referrals.id,
    alumniId: referrals.alumniId,
    jobId: referrals.jobId,
    code: referrals.code,
    company: referrals.company,
    position: referrals.position,
    description: referrals.description,
    maxUses: referrals.maxUses,
    usedCount: referrals.usedCount,
    isActive: referrals.isActive,
    expiresAt: referrals.expiresAt,
    createdAt: referrals.createdAt,
    jobTitle: jobs.title,
    jobStatus: jobs.status,
  })
  .from(referrals)
  .leftJoin(jobs, eq(referrals.jobId, jobs.id))
  .where(eq(referrals.alumniId, user.id))
  .orderBy(desc(referrals.createdAt));
```

## 🎯 Features After Migration

### For Alumni

#### 1. View Posted Jobs

- Navigate to `/alumni/referrals`
- See summary of jobs you've posted
- Create referrals for specific jobs

#### 2. Create Job-Specific Referrals

```
1. Select a job from dropdown (auto-fills company/position)
2. OR create general referral (manual entry)
3. Set usage limits and expiry
4. Get unique referral code
```

#### 3. Enhanced Referral Management

- See which referrals are linked to specific jobs
- Track job status (active/expired/filled)
- Monitor usage across different positions

### For Students

#### 1. Use Job-Specific Codes

- Apply to jobs with targeted referral codes
- System validates code matches the job
- Better tracking and analytics

#### 2. Enhanced Validation

- Referral codes work only for intended jobs
- Prevents misuse of referral codes
- Better alumni-student matching

## 🧪 Testing After Migration

### Test Script

```bash
# Run the comprehensive test
node test-job-specific-referrals.js
```

### Manual Testing

1. **Create Job (Alumni):**
   - Post a new job at `/alumni/jobs/post`
   - Note the job ID

2. **Create Job-Specific Referral:**
   - Go to `/alumni/referrals`
   - Select the job from dropdown
   - Create referral code

3. **Test Student Usage:**
   - Login as student
   - Apply to the specific job
   - Use the referral code

4. **Verify Tracking:**
   - Check referral usage count increased
   - Verify job-referral linkage

## 📊 Database Schema After Migration

### Referrals Table

```sql
CREATE TABLE referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alumni_id INTEGER NOT NULL REFERENCES users(id),
  job_id INTEGER REFERENCES jobs(id),  -- NEW COLUMN
  code TEXT NOT NULL UNIQUE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT,
  max_uses INTEGER DEFAULT 10,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TEXT,
  created_at TEXT NOT NULL
);
```

### Benefits of job_id Column

- **Targeted Referrals:** Link codes to specific job postings
- **Better Analytics:** Track which jobs get most referrals
- **Validation:** Ensure codes are used for intended positions
- **Alumni Control:** Only create referrals for own job postings

## 🔄 Migration Verification

After running migration, verify:

```javascript
// Check if migration worked
const tableInfo = await client.execute("PRAGMA table_info(referrals)");
console.log(tableInfo.rows.map((row) => row.name));
// Should include: ['id', 'alumni_id', 'job_id', 'code', 'company', ...]
```

## 🎉 Expected Workflow After Migration

### Alumni Creates Job-Specific Referral

1. Alumni posts job: "Senior Developer at TechCorp"
2. Creates referral for that specific job
3. System generates: `TECHCORP-X1Y2` linked to job ID 123
4. Alumni shares code with students

### Student Uses Referral

1. Student finds job posting (ID 123)
2. Applies with referral code `TECHCORP-X1Y2`
3. System validates code is for this specific job
4. Application processed with referral credit

### System Tracking

1. Referral usage count incremented
2. Job-specific analytics updated
3. Alumni notified of code usage
4. Better matching and success tracking

## 🚀 Ready for Production

After migration, the system will support:

- ✅ General referrals (company-wide)
- ✅ Job-specific referrals (position-specific)
- ✅ Alumni job ownership validation
- ✅ Enhanced tracking and analytics
- ✅ Better user experience

**Run the migration to unlock full job-specific referral functionality!** 🎯
