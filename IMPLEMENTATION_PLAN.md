# 🎯 Implementation Plan - Critical Features

## Issues to Fix

### 1. Profile Loading Issue ⚠️

**Problem:** Profile shows "20% complete" instead of loading properly
**Priority:** HIGH
**Action:**

- Check profile data fetching
- Fix profile completion calculation
- Ensure data refreshes properly

### 2. Empty Dashboard Data ⚠️

**Problem:** Network connections and job applications showing empty
**Priority:** HIGH
**Action:**

- Verify data seeding
- Check API endpoints
- Fix data display logic

### 3. Resume Upload Feature 🆕

**Problem:** No resume upload when applying for jobs
**Priority:** HIGH
**Features Needed:**

- Resume upload component
- File storage (local/cloud)
- Resume viewing for alumni/admin only
- Link resume to job applications

### 4. Job Application Status 🆕

**Problem:** Applied jobs not showing in "Applied" category
**Priority:** MEDIUM
**Action:**

- Create "My Applications" section
- Show application status
- Track application progress

### 5. Referral System 🆕

**Problem:** No referral system for alumni to help students
**Priority:** MEDIUM
**Features Needed:**

- Alumni can create referral codes
- Students can use referrals when applying
- Track referral usage
- Show referral impact

---

## Quick Fixes (Immediate)

### Fix 1: Profile Loading

```typescript
// Check if user data is being fetched properly
// Ensure profile completion calculation is correct
// Add loading states
```

### Fix 2: Dashboard Empty Data

```typescript
// Verify seed data exists
// Check API responses
// Add empty state handling
```

---

## New Features (Phased Implementation)

### Phase 1: Resume Upload (Critical)

**Files to Create/Modify:**

1. `src/app/api/files/upload/route.ts` - File upload API
2. `src/app/student/jobs/[id]/apply/page.tsx` - Application form with resume
3. `src/components/resume-upload.tsx` - Resume upload component
4. Update `applications` table to include `resumeUrl`

**Implementation:**

```typescript
// 1. File upload API
POST /api/files/upload
- Accept file upload
- Validate file type (PDF, DOC, DOCX)
- Store file (public/uploads or cloud)
- Return file URL

// 2. Application form
- Add resume upload field
- Show uploaded resume
- Submit with application

// 3. View resume (alumni/admin only)
- Check user role
- Show download/view button
- Secure file access
```

### Phase 2: Referral System

**Files to Create:**

1. `src/app/api/referrals/route.ts` - Referral CRUD
2. `src/app/alumni/referrals/page.tsx` - Alumni referral management
3. `src/app/student/jobs/[id]/apply/page.tsx` - Add referral code field
4. Add `referrals` table to schema

**Database Schema:**

```sql
CREATE TABLE referrals (
  id INTEGER PRIMARY KEY,
  alumni_id INTEGER REFERENCES users(id),
  code TEXT UNIQUE,
  company TEXT,
  position TEXT,
  description TEXT,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TEXT,
  created_at TEXT
);

CREATE TABLE referral_usage (
  id INTEGER PRIMARY KEY,
  referral_id INTEGER REFERENCES referrals(id),
  student_id INTEGER REFERENCES users(id),
  job_id INTEGER REFERENCES jobs(id),
  application_id INTEGER REFERENCES applications(id),
  used_at TEXT
);
```

---

## Implementation Order

### Immediate (Today)

1. ✅ Fix profile loading issue
2. ✅ Fix empty dashboard data
3. ✅ Add proper error handling

### Short Term (This Week)

4. 🔨 Implement resume upload
5. 🔨 Add "My Applications" page
6. 🔨 Show application status tracking

### Medium Term (Next Week)

7. 🔨 Implement referral system
8. 🔨 Add referral management for alumni
9. 🔨 Add referral usage for students

---

## Technical Considerations

### File Upload

- **Storage:** Use `public/uploads/resumes/` for now
- **Security:** Validate file types, size limits
- **Access Control:** Check user role before serving files
- **Naming:** Use UUID + timestamp to avoid conflicts

### Referral System

- **Code Generation:** Use short, memorable codes (e.g., "GOOGLE-SWE-2024-ABC")
- **Validation:** Check expiry, usage limits
- **Tracking:** Log all referral usage
- **Analytics:** Show referral success rate

### Performance

- **File Size:** Limit resume to 5MB
- **Caching:** Cache user profile data
- **Lazy Loading:** Load applications on demand
- **Pagination:** Paginate job applications list

---

## Testing Checklist

### Profile Loading

- [ ] Profile loads on first visit
- [ ] Profile refreshes on data change
- [ ] Completion percentage accurate
- [ ] Loading states work

### Dashboard Data

- [ ] Connections show correctly
- [ ] Applications show correctly
- [ ] Empty states display
- [ ] Data refreshes

### Resume Upload

- [ ] File upload works
- [ ] File validation works
- [ ] Resume displays in application
- [ ] Alumni can view resume
- [ ] Students cannot view others' resumes

### Referral System

- [ ] Alumni can create referrals
- [ ] Students can use referrals
- [ ] Referral codes validate
- [ ] Usage tracking works
- [ ] Expiry works

---

## Next Steps

1. **Start with critical fixes** (profile, dashboard)
2. **Implement resume upload** (most requested)
3. **Add referral system** (unique feature)
4. **Test thoroughly**
5. **Document for users**

---

**Status:** Ready to implement
**Estimated Time:**

- Critical fixes: 2-3 hours
- Resume upload: 3-4 hours
- Referral system: 4-5 hours
  **Total:** 9-12 hours of development
