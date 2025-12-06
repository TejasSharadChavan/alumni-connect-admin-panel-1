# 🚨 Critical Fixes Summary

## Current Issues Identified

### 1. ✅ Analytics Error - FIXED

**Status:** RESOLVED
**Solution:** Aliased import to avoid naming conflict

### 2. ⚠️ Profile Loading Issue

**Problem:** Profile shows "20% complete" instead of actual data
**Likely Cause:**

- Profile data not fetching properly
- Completion calculation incorrect
- Cache issue

**Quick Fix:**

```bash
# Clear browser cache and localStorage
# Refresh page
# Check if user data exists in database
```

### 3. ⚠️ Empty Dashboard Data

**Problem:** Connections and applications showing empty
**Likely Cause:**

- No seed data for current user
- API returning empty arrays
- Display logic issue

**Quick Fix:**

```bash
# Re-seed database
Visit: http://localhost:3000/test-ml
Click: "Seed Enhanced Data"

# Or seed for specific user
POST /api/seed-enhanced
```

---

## Features to Implement

### Priority 1: Resume Upload (CRITICAL)

**What's Needed:**

1. File upload API endpoint
2. Resume upload component
3. File storage system
4. Access control (alumni/admin only can view)
5. Link to job applications

**Estimated Time:** 3-4 hours

**Files to Create:**

- `src/app/api/files/upload/route.ts`
- `src/app/api/files/[filename]/route.ts` (for serving files)
- `src/components/resume-upload.tsx`
- Update `src/app/student/jobs/[id]/apply/page.tsx`

### Priority 2: Application Tracking

**What's Needed:**

1. "My Applications" page
2. Application status display
3. Application history
4. Status updates

**Estimated Time:** 2-3 hours

**Files to Create:**

- `src/app/student/applications/page.tsx`
- Update navigation to include link

### Priority 3: Referral System (NEW FEATURE)

**What's Needed:**

1. Referral code generation
2. Alumni referral management page
3. Student referral usage
4. Referral tracking
5. Database schema updates

**Estimated Time:** 4-5 hours

**Files to Create:**

- `src/app/api/referrals/route.ts`
- `src/app/api/referrals/[id]/route.ts`
- `src/app/alumni/referrals/page.tsx`
- Update job application form
- Add referrals table to schema

---

## Immediate Actions Required

### Step 1: Fix Current Issues (30 minutes)

```bash
# 1. Clear cache
localStorage.clear()
sessionStorage.clear()

# 2. Re-seed database
Visit: /test-ml
Click: "Seed Enhanced Data"

# 3. Logout and login again
# 4. Check if data appears
```

### Step 2: Verify Data (15 minutes)

```sql
-- Check if user has connections
SELECT * FROM connections WHERE requester_id = [USER_ID] OR responder_id = [USER_ID];

-- Check if user has applications
SELECT * FROM applications WHERE applicant_id = [USER_ID];

-- Check user profile completeness
SELECT * FROM users WHERE id = [USER_ID];
```

### Step 3: Implement Resume Upload (3-4 hours)

See detailed implementation below

### Step 4: Implement Referral System (4-5 hours)

See detailed implementation below

---

## Detailed Implementation: Resume Upload

### 1. Create Upload API

```typescript
// src/app/api/files/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(
      process.cwd(),
      "public",
      "uploads",
      "resumes",
      filename
    );

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/resumes/${filename}`,
      filename,
    });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
```

### 2. Create Resume Upload Component

```typescript
// src/components/resume-upload.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, X } from "lucide-react";
import { toast } from "sonner";

export function ResumeUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onUpload(data.url);
        toast.success("Resume uploaded successfully");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to upload resume (PDF, DOC, DOCX)
          </p>
          <p className="text-xs text-muted-foreground mt-1">Max size: 5MB</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </div>
      </label>

      {file && (
        <div className="flex items-center gap-2 p-3 border rounded-lg">
          <File className="h-4 w-4" />
          <span className="text-sm flex-1">{file.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFile(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
```

### 3. Update Application Form

```typescript
// Add to job application form
const [resumeUrl, setResumeUrl] = useState("");

<ResumeUpload onUpload={setResumeUrl} />

// Include in application submission
const applicationData = {
  jobId,
  resumeUrl,
  coverLetter,
  // ... other fields
};
```

---

## Detailed Implementation: Referral System

### 1. Add Database Schema

```typescript
// Add to src/db/schema.ts
export const referrals = sqliteTable("referrals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  alumniId: integer("alumni_id")
    .notNull()
    .references(() => users.id),
  code: text("code").notNull().unique(),
  company: text("company").notNull(),
  position: text("position").notNull(),
  description: text("description"),
  maxUses: integer("max_uses").default(10),
  usedCount: integer("used_count").default(0),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").notNull(),
});

export const referralUsage = sqliteTable("referral_usage", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  referralId: integer("referral_id")
    .notNull()
    .references(() => referrals.id),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),
  jobId: integer("job_id").references(() => jobs.id),
  applicationId: integer("application_id").references(() => applications.id),
  usedAt: text("used_at").notNull(),
});
```

### 2. Create Referral API

```typescript
// src/app/api/referrals/route.ts
export async function POST(request: NextRequest) {
  // Create referral
  const { company, position, description, maxUses, expiresAt } =
    await request.json();

  // Generate unique code
  const code = `${company.toUpperCase()}-${Date.now().toString(36)}`;

  // Save to database
  const referral = await db.insert(referrals).values({
    alumniId: user.id,
    code,
    company,
    position,
    description,
    maxUses,
    expiresAt,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, referral });
}

export async function GET(request: NextRequest) {
  // Get user's referrals
  const userReferrals = await db
    .select()
    .from(referrals)
    .where(eq(referrals.alumniId, user.id));

  return NextResponse.json({ referrals: userReferrals });
}
```

### 3. Alumni Referral Management Page

```typescript
// src/app/alumni/referrals/page.tsx
"use client";

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState([]);

  const createReferral = async (data) => {
    const response = await fetch("/api/referrals", {
      method: "POST",
      body: JSON.stringify(data),
    });
    // Handle response
  };

  return (
    <div>
      <h1>My Referrals</h1>
      <Button onClick={() => setShowCreate(true)}>Create Referral</Button>

      {/* List of referrals */}
      {referrals.map(referral => (
        <Card key={referral.id}>
          <CardHeader>
            <CardTitle>{referral.company} - {referral.position}</CardTitle>
            <CardDescription>Code: {referral.code}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Used: {referral.usedCount} / {referral.maxUses}</p>
            <p>Expires: {referral.expiresAt}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## Testing Checklist

### Resume Upload

- [ ] Create uploads directory: `public/uploads/resumes/`
- [ ] Test file upload
- [ ] Test file validation
- [ ] Test file size limit
- [ ] Test resume display
- [ ] Test access control

### Referral System

- [ ] Run database migration
- [ ] Test referral creation
- [ ] Test referral code generation
- [ ] Test referral usage
- [ ] Test expiry validation
- [ ] Test usage limit

---

## Next Steps

1. **Fix immediate issues** (profile, dashboard)
2. **Implement resume upload** (critical for job applications)
3. **Implement referral system** (unique feature)
4. **Test thoroughly**
5. **Update documentation**

---

**Estimated Total Time:** 10-12 hours
**Priority Order:**

1. Fix current bugs (1 hour)
2. Resume upload (3-4 hours)
3. Referral system (4-5 hours)
4. Testing & polish (2 hours)
