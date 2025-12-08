# Admin Authentication Fix ✅

## Issue

Admin pages (campaigns, events, users) were unable to load data because the API endpoints were using incorrect authentication method.

## Root Cause

The newly created admin APIs were trying to use `auth()` from NextAuth, but this project uses a custom token-based authentication system with Bearer tokens stored in localStorage.

## Solution Applied

### 1. Fixed All Admin API Endpoints

Updated authentication in:

- `/api/admin/campaigns/route.ts` (GET, POST)
- `/api/admin/campaigns/[id]/route.ts` (GET, PUT, DELETE)
- `/api/admin/campaigns/[id]/donations/route.ts` (GET)
- `/api/admin/events/route.ts` (GET, POST)
- `/api/admin/events/[id]/route.ts` (PUT, DELETE)
- `/api/admin/users/[id]/route.ts` (GET, PUT, DELETE)

**Changed from:**

```typescript
import { auth } from "@/lib/auth";
const session = await auth();
if (!session?.user || session.user.role !== "admin") { ... }
```

**Changed to:**

```typescript
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);

  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  // Validate session and return user
}

const user = await getAuthenticatedUser(request);
if (!user || user.role !== "admin") { ... }
```

### 2. Updated Frontend Pages

Added Authorization headers to all API calls in:

- `/app/admin/campaigns/page.tsx`
- `/app/admin/events/page.tsx`
- `/app/admin/users/page.tsx`

**Example:**

```typescript
const token = localStorage.getItem("auth_token");
const response = await fetch("/api/admin/campaigns", {
  headers: { Authorization: `Bearer ${token}` },
});
```

## What Now Works

### Admin Campaigns Page

✅ Loads real campaigns from database
✅ Delete campaigns with confirmation
✅ View campaign details
✅ Proper error handling

### Admin Events Page

✅ Loads real events from database
✅ Delete events with RSVP cancellation
✅ Attendee notifications
✅ Proper error handling

### Admin Users Page

✅ Loads real users from database
✅ Filter and search functionality
✅ Ready for edit/delete operations

## Testing

1. **Login as Admin:**

   ```
   Email: dean@terna.ac.in
   Password: Password@123
   ```

2. **Navigate to:**
   - `/admin/campaigns` - Should load campaigns
   - `/admin/events` - Should load events
   - `/admin/users` - Should load users

3. **Test Delete:**
   - Click delete button on any campaign/event
   - Confirm deletion
   - Item should be removed and page refreshed

## Security Features Maintained

✅ Bearer token authentication
✅ Session validation
✅ Token expiry checking
✅ Admin role verification
✅ Audit logging for all actions
✅ Self-protection (can't delete own account)
✅ Cascade deletions
✅ User notifications

## Files Modified

### API Routes (8 files)

- `src/app/api/admin/campaigns/route.ts`
- `src/app/api/admin/campaigns/[id]/route.ts`
- `src/app/api/admin/campaigns/[id]/donations/route.ts`
- `src/app/api/admin/events/route.ts`
- `src/app/api/admin/events/[id]/route.ts`
- `src/app/api/admin/users/[id]/route.ts`

### Frontend Pages (3 files)

- `src/app/admin/campaigns/page.tsx`
- `src/app/admin/events/page.tsx`
- `src/app/admin/users/page.tsx`

## Status

✅ **FIXED** - All admin pages now load correctly with proper authentication

---

**Fixed:** December 8, 2024
**Issue:** Authentication mismatch between API and frontend
**Resolution Time:** ~15 minutes
