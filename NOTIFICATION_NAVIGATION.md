# ✅ Notification Navigation - How It Works

## Navigation Routes

### For Students:

| Notification Type | Redirects To            | What You See                       |
| ----------------- | ----------------------- | ---------------------------------- |
| **Job**           | `/student/jobs`         | Browse all available jobs          |
| **Application**   | `/student/applications` | Your applications with status tabs |
| **Connection**    | `/student/network`      | Your network connections           |

### For Alumni:

| Notification Type | Redirects To           | What You See                         |
| ----------------- | ---------------------- | ------------------------------------ |
| **Job**           | `/alumni/jobs`         | Jobs you posted                      |
| **Application**   | `/alumni/applications` | N/A (alumni don't have applications) |
| **Connection**    | `/alumni/network`      | Your network connections             |

---

## Application Status Sections

When you click an **application notification**, you go to `/student/applications` which has these tabs:

### Tabs Available:

1. **All** - See all your applications
2. **Applied** - Applications waiting for review
3. **Interview** - Applications shortlisted for interview
4. **Accepted** - Applications that were accepted ✅
5. **Rejected** - Applications that were rejected

---

## How to Use

### When You Get "Application Accepted" Notification:

1. **Click the notification**
   - Redirects to `/student/applications`

2. **Click "Accepted" tab**
   - See all accepted applications
   - View job details
   - Download your resume
   - See acceptance date

3. **View Application Details**
   - Company name
   - Job title
   - Location
   - Salary
   - Your cover letter
   - Application date

---

## Example Flow

```
1. Alumni accepts your application
   ↓
2. You receive notification:
   "Congratulations! Your application for Software Engineer has been accepted!"
   ↓
3. Click notification
   ↓
4. Redirected to /student/applications
   ↓
5. Click "Accepted" tab
   ↓
6. See your accepted application
   ↓
7. View details, download resume, etc.
```

---

## Status Badge Colors

- **Applied** - Blue badge
- **Interview** - Yellow badge
- **Accepted** - Green badge ✅
- **Rejected** - Red badge

---

## What Each Page Shows

### `/student/jobs`

- Browse all available jobs
- Filter by type, branch, application status
- Apply for new jobs
- See "Already Applied" on jobs you applied for

### `/student/applications`

- Track all your applications
- Filter by status (tabs)
- View application details
- Download your resume
- See cover letter
- View job details

### `/student/network`

- See your connections
- View connection requests
- Accept/reject requests
- Browse suggested connections

---

## Role-Based Access

### Students Can Access:

- ✅ `/student/jobs` - Browse jobs
- ✅ `/student/applications` - Track applications
- ✅ `/student/network` - Manage connections
- ❌ `/alumni/jobs` - Cannot access (alumni only)

### Alumni Can Access:

- ✅ `/alumni/jobs` - Manage posted jobs
- ✅ `/alumni/jobs/[id]/applicants` - View applicants
- ✅ `/alumni/network` - Manage connections
- ❌ `/student/applications` - Cannot access (student only)

---

## Current Implementation

### Notification Click Handler:

```typescript
onClick={() => {
  if (!notif.isRead) handleMarkAsRead(notif.id);

  // Navigate based on notification type and user role
  if (notif.type === "job") {
    router.push(`/${role}/jobs`);
  } else if (notif.type === "application") {
    router.push(`/${role}/applications`);
  } else if (notif.type === "connection") {
    router.push(`/${role}/network`);
  }
}
```

### Role Variable:

- For students: `role = "student"`
- For alumni: `role = "alumni"`
- For faculty: `role = "faculty"`
- For admin: `role = "admin"`

---

## Status

✅ **Navigation Working Correctly**
✅ **Role-Based Routes**
✅ **Status Tabs Available**
✅ **Access Control Working**

---

## Summary

**The navigation is already set up correctly!**

- Students clicking job notifications → Go to `/student/jobs`
- Students clicking application notifications → Go to `/student/applications`
- Applications page has tabs for each status (Applied, Interview, Accepted, Rejected)
- Role-based access prevents students from accessing alumni pages

**Everything is working as it should!** ✅

---

## Quick Test

1. Login as student: `aarav.sharma@terna.ac.in` / `password123`
2. Click bell icon
3. Click "Application accepted" notification
4. ✅ Redirected to `/student/applications`
5. Click "Accepted" tab
6. ✅ See your accepted application!
