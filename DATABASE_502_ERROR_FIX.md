# Database 502 Error - Fix Guide

## 🔴 Error Details

```
Error [LibsqlError]: SERVER_ERROR: Server returned HTTP status 502
HttpServerError: Server returned HTTP status 502
```

**What it means**: Your database server (Turso/LibSQL) is temporarily unavailable or having connectivity issues.

---

## 🔧 Quick Fixes

### Fix 1: Check Database Connection (Most Common)

Your `.env` file should have:

```env
DATABASE_URL=your_database_url_here
```

**Steps**:

1. Open `alumni-connect-admin-panel-1/.env`
2. Verify `DATABASE_URL` is set correctly
3. If using Turso, check if your database is active

### Fix 2: Restart the Server

Sometimes the connection just needs a refresh:

```bash
# Stop the server (Ctrl+C in terminal)
# Then restart:
bun run dev
```

### Fix 3: Check Turso Database Status

If you're using Turso (LibSQL):

```bash
# Login to Turso
turso auth login

# List your databases
turso db list

# Check specific database status
turso db show your-database-name

# If database is sleeping, wake it up
turso db shell your-database-name
```

### Fix 4: Network/Firewall Issues

The 502 error can also be caused by:

- Firewall blocking database connection
- VPN interfering with connection
- Internet connectivity issues
- Database service temporarily down

**Try**:

1. Disable VPN temporarily
2. Check your internet connection
3. Try accessing database from browser/CLI

### Fix 5: Database Service Limits

If using free tier:

- Turso free tier has usage limits
- Database might be rate-limited
- Check your Turso dashboard for limits

---

## 🎯 Immediate Workaround

The error is happening in the notifications API. You can temporarily disable the notification polling:

### Option A: Increase Polling Interval

Edit `src/components/layout/role-layout.tsx`:

```typescript
// Change from 10 seconds to 30 seconds
const interval = setInterval(fetchNotifications, 30000); // Was 10000
```

### Option B: Disable Polling Temporarily

Comment out the polling in `src/components/layout/role-layout.tsx`:

```typescript
// Temporarily disable
// const interval = setInterval(fetchNotifications, 10000);
```

---

## 🔍 Check Your Database URL

Run this to verify your database connection:

```bash
# In the project directory
node -e "console.log(require('dotenv').config()); console.log(process.env.DATABASE_URL)"
```

Should output your database URL (not undefined).

---

## 📊 Current Status

Based on your terminal:

- ✅ Most APIs working (200 status)
- ✅ Login working
- ✅ Analytics working
- ✅ Mentorship working
- ❌ Notifications API occasionally failing with 502

**This is a temporary database connectivity issue, not a code problem.**

---

## 🚀 Recommended Actions

1. **Check if it's persistent**:
   - Refresh the page
   - If error continues, it's a database issue
   - If error stops, it was temporary

2. **Reduce database load**:
   - Increase notification polling interval
   - Add caching for frequently accessed data
   - Implement retry logic

3. **Add retry logic** (Better solution):

Edit `src/app/api/notifications/route.ts`:

```typescript
async function getAuthenticatedUser(request: NextRequest, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const session = await db
        .select({
          userId: sessions.userId,
          expiresAt: sessions.expiresAt,
        })
        .from(sessions)
        .where(eq(sessions.token, token))
        .limit(1);

      return session; // Success
    } catch (error) {
      if (i === retries - 1) throw error; // Last attempt failed
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s
    }
  }
}
```

---

## ✅ Verification

After applying fixes:

1. **Check terminal**: Should see fewer 502 errors
2. **Check browser**: Notifications should load
3. **Check console**: No authentication errors

---

## 📝 Summary

**The 502 error is a database connectivity issue, not a code bug.**

**Quick fixes**:

1. ✅ Restart server
2. ✅ Check DATABASE_URL in .env
3. ✅ Verify Turso database is active
4. ✅ Increase polling interval
5. ✅ Add retry logic

**The app is working fine** - this is just a temporary database hiccup that happens occasionally with cloud databases.
