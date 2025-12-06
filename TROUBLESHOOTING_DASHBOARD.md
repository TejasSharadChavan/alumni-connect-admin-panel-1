# 🔍 Dashboard Troubleshooting Guide

## Quick Diagnosis

If dashboard still shows "Failed to load dashboard data":

### Step 1: Check Browser Console

Open browser DevTools (F12) and look for errors.

**Common Errors:**

#### Error: "Unauthorized" or 401

**Solution:** You're not logged in properly

```bash
1. Logout
2. Login again
3. Refresh dashboard
```

#### Error: "Failed to fetch" or Network Error

**Solution:** Dev server not running

```bash
cd alumni-connect-admin-panel-1
bun run dev
```

#### Error: "Cannot read property 'connections' of undefined"

**Solution:** API response format issue (should be fixed now)

- Check that `/api/connections` returns `{ success: true, connections: [...] }`

### Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Refresh dashboard
3. Look for failed requests (red status)

**Expected API Calls:**

For **Student Dashboard:**

- ✅ GET `/api/connections`
- ✅ GET `/api/jobs/applications`
- ✅ GET `/api/events`
- ✅ GET `/api/connections/suggestions`
- ✅ GET `/api/events?myRsvps=true`

For **Alumni Dashboard:**

- ✅ GET `/api/connections`
- ✅ GET `/api/mentorship`
- ✅ GET `/api/jobs?posted=true`
- ✅ GET `/api/donations`

### Step 3: Verify Authentication

Check localStorage for auth token:

```javascript
// In browser console
localStorage.getItem("auth_token");
```

**If null or undefined:**

- Login again
- Check that login API sets the token

### Step 4: Check Database

Verify tables exist:

```bash
cd alumni-connect-admin-panel-1
bun run drizzle-kit studio
```

Check these tables:

- ✅ `users` - Has your user
- ✅ `connections` - Has some connections
- ✅ `applications` - Has some applications
- ✅ `events` - Has some events

### Step 5: Test Individual APIs

Test each API endpoint manually:

```bash
# Get your auth token first
TOKEN="your_token_here"

# Test connections
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/connections

# Test suggestions
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/connections/suggestions

# Test applications
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/jobs/applications

# Test events
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/events
```

## Common Issues & Solutions

### Issue 1: Empty Dashboard (No Data)

**Symptoms:** Dashboard loads but shows zeros everywhere

**Solution:** Seed sample data

```bash
cd alumni-connect-admin-panel-1
bun run scripts/seed-referrals.ts
# Or use the enhanced seed
```

### Issue 2: "Cannot find module" Error

**Symptoms:** Import errors in console

**Solution:** Reinstall dependencies

```bash
cd alumni-connect-admin-panel-1
rm -rf node_modules
bun install
```

### Issue 3: Database Schema Mismatch

**Symptoms:** SQL errors in console

**Solution:** Re-run migration

```bash
cd alumni-connect-admin-panel-1
bun run drizzle-kit push
```

### Issue 4: Slow Dashboard Loading

**Symptoms:** Dashboard takes forever to load

**Solution:** Check API performance

- Open Network tab
- Look for slow requests
- Check database indexes

### Issue 5: Recommended Mentors Not Showing

**Symptoms:** Empty recommendations section

**Solution:**

1. Ensure `/api/connections/suggestions` endpoint exists
2. Check that there are other users in database
3. Verify user has role and profile data

## API Response Format Check

All APIs should return consistent format:

**Success Response:**

```json
{
  "success": true,
  "connections": [...],  // or applications, events, etc.
}
```

**Error Response:**

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Debug Mode

Add this to your dashboard component to see what's happening:

```typescript
const fetchDashboardData = async () => {
  try {
    console.log("🔍 Fetching dashboard data...");

    const connectionsRes = await fetch("/api/connections", { headers });
    console.log("✅ Connections response:", await connectionsRes.json());

    // ... rest of fetches with console.logs
  } catch (error) {
    console.error("❌ Dashboard error:", error);
  }
};
```

## Still Not Working?

### Last Resort Checklist

1. **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

2. **Check .env file**
   - Ensure DATABASE_URL is correct
   - Verify all required env variables are set

3. **Restart everything**

   ```bash
   # Stop dev server (Ctrl+C)
   # Clear cache
   rm -rf .next
   # Restart
   bun run dev
   ```

4. **Check file permissions**
   - Ensure database file is readable/writable
   - Check uploads directory permissions

5. **Review recent changes**
   - Check git diff
   - Revert if needed

## Get Help

If none of these work:

1. **Check the logs**
   - Look at terminal where dev server is running
   - Note any error messages

2. **Provide details**
   - Which dashboard (student/alumni/faculty)?
   - What error message?
   - Which API call is failing?
   - Browser console screenshot

3. **Test with different user**
   - Try logging in as different role
   - See if issue is user-specific

## Success Indicators

Dashboard is working when you see:

- ✅ Stats display with numbers
- ✅ Recent activities list
- ✅ Recommended connections/mentors
- ✅ No error toasts
- ✅ No console errors
- ✅ Fast loading (< 2 seconds)

---

**Remember:** The fix has been applied. If you're still seeing issues, it's likely a caching or authentication problem!
