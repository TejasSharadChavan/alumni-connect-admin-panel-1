# Testing Alumni Analytics Page

## ✅ Files Verified

All required files are in place:

- ✅ `src/app/alumni/analytics/page.tsx` - Main analytics page
- ✅ `src/app/api/alumni/influence-score/route.ts` - Influence score API
- ✅ `src/app/api/alumni/recommended-students/route.ts` - Recommendations API
- ✅ `src/app/api/alumni/referral-ready/route.ts` - Referral ready API
- ✅ Navigation link added to sidebar

## 🔍 Troubleshooting Steps

### Step 1: Start the Development Server

```bash
cd alumni-connect-admin-panel-1
npm run dev
```

Wait for the server to start (usually at http://localhost:3000)

### Step 2: Login as Alumni

1. Go to: http://localhost:3000/login
2. Use any alumni credentials from your database

**Test Alumni Accounts** (from database):

- Dr. Rajesh Mehta (ID: 505)
- Anita Verma (ID: 506)
- Karan Joshi (ID: 507)
- Rahul Agarwal (ID: 490)
- Meera Krishnan (ID: 491)

### Step 3: Navigate to Analytics

**Option A**: Click "Analytics" in the left sidebar
**Option B**: Go directly to: http://localhost:3000/alumni/analytics

### Step 4: Verify Page Loads

You should see:

1. **Top Section**: Influence Score card with purple/blue gradient
2. **Three Tabs**:
   - Smart Recommendations
   - Students Needing Help
   - Referral Center

## 🐛 Common Issues & Solutions

### Issue 1: "Analytics" link not visible in sidebar

**Solution**:

1. Make sure you're logged in as an **alumni** user (not student/admin)
2. Refresh the page (Ctrl+R or Cmd+R)
3. Clear browser cache and reload

**Verify**:

```bash
# Check if navigation link exists
grep -n "Analytics.*alumni/analytics" src/components/layout/role-layout.tsx
```

### Issue 2: Page shows loading spinner forever

**Possible Causes**:

- API endpoints not responding
- Authentication token expired
- Database connection issue

**Solution**:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed API calls

**Test API Endpoints Manually**:

```bash
# Get your auth token from localStorage in browser console
# Then test:

# Test influence score
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/alumni/influence-score

# Test recommendations
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/alumni/recommended-students

# Test referral ready
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/alumni/referral-ready
```

### Issue 3: "Unauthorized" error

**Solution**:

1. Logout and login again
2. Make sure you're using an alumni account
3. Check if auth token is valid

**Verify in Browser Console**:

```javascript
// Check if token exists
localStorage.getItem("auth_token");

// Check user role
// Should show role: "alumni"
```

### Issue 4: No data showing (empty states)

**This is normal if**:

- Alumni has no mentorships yet (score will be low)
- No students match the alumni's profile
- No students are referral-ready

**To test with data**:
Use alumni accounts that have existing mentorships:

- Rahul Agarwal (ID: 490) - Has mentorship requests
- Meera Krishnan (ID: 491) - Has mentorship requests
- Dr. Meera Joshi (ID: 475) - Has mentorship requests

### Issue 5: Page not found (404)

**Solution**:

1. Verify the file exists:

   ```bash
   ls -la src/app/alumni/analytics/page.tsx
   ```

2. Restart the dev server:

   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   npm run dev
   ```

3. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

## 🧪 Manual Testing Checklist

### Test Influence Score:

- [ ] Score displays (0-100)
- [ ] Percentile shows (e.g., "Top 10%")
- [ ] Breakdown shows 5 categories
- [ ] Progress bars render
- [ ] Next milestone displays

### Test Smart Recommendations:

- [ ] High Priority section shows (if matches exist)
- [ ] Good Match section shows (if matches exist)
- [ ] Match percentage badges display
- [ ] Student cards show name, branch, skills
- [ ] "Offer Mentorship" button works

### Test Students Needing Help:

- [ ] List shows students with pending requests
- [ ] Student info displays correctly
- [ ] "Reach Out" button works
- [ ] Empty state shows if no students

### Test Referral Center:

- [ ] Highly Ready section shows (if students exist)
- [ ] Ready section shows (if students exist)
- [ ] Readiness score badges display
- [ ] Project/application counts show
- [ ] "Resume" and "Refer" buttons work

## 📊 Expected Data

Based on your database:

- **19 mentorship requests** exist
- **Multiple alumni** with different activity levels
- **Multiple students** with various skills

**Expected Results**:

- Influence scores should vary (0-100)
- Some alumni should have high-priority matches
- Some students should appear in "Needing Help"
- Some students should be referral-ready

## 🔧 Debug Mode

### Enable Detailed Logging:

1. **In Browser Console**:

```javascript
// Enable verbose logging
localStorage.setItem("debug", "true");
```

2. **Check API Responses**:

- Open DevTools → Network tab
- Filter by "Fetch/XHR"
- Click on API calls to see responses
- Look for status codes (200 = success, 401 = unauthorized, 500 = error)

3. **Check Console Logs**:

- Look for "Error fetching analytics" messages
- Check for "Failed to fetch" errors
- Note any CORS or network errors

## 🚀 Quick Test Script

Run this in your terminal to verify everything:

```bash
cd alumni-connect-admin-panel-1

# Check files exist
echo "Checking files..."
test -f src/app/alumni/analytics/page.tsx && echo "✅ Analytics page exists" || echo "❌ Analytics page missing"
test -f src/app/api/alumni/influence-score/route.ts && echo "✅ Influence API exists" || echo "❌ Influence API missing"
test -f src/app/api/alumni/recommended-students/route.ts && echo "✅ Recommendations API exists" || echo "❌ Recommendations API missing"
test -f src/app/api/alumni/referral-ready/route.ts && echo "✅ Referral API exists" || echo "❌ Referral API missing"

# Check navigation
echo ""
echo "Checking navigation..."
grep -q "Analytics.*alumni/analytics" src/components/layout/role-layout.tsx && echo "✅ Navigation link exists" || echo "❌ Navigation link missing"

# Check database
echo ""
echo "Checking database..."
npx tsx scripts/check-mentorship-data.ts
```

## 📞 Still Not Working?

### Collect This Information:

1. **Browser Console Errors**:
   - Screenshot of any red errors
   - Copy full error messages

2. **Network Tab**:
   - Which API calls are failing?
   - What are the status codes?
   - What are the error responses?

3. **Environment**:
   - Node version: `node --version`
   - npm version: `npm --version`
   - Browser: Chrome/Firefox/Safari?

4. **Server Logs**:
   - Any errors in terminal where dev server is running?
   - Any compilation errors?

### Share This:

```
Issue: Unable to see analytics section
Browser: [Your browser]
URL tried: [URL you accessed]
Error message: [Copy from console]
API status: [200/401/500/etc]
Logged in as: [alumni/student/admin]
```

## ✅ Success Indicators

When working correctly, you should see:

1. ✅ "Analytics" link in sidebar (2nd item after Dashboard)
2. ✅ Purple/blue gradient card at top with influence score
3. ✅ Three tabs: Smart Recommendations, Students Needing Help, Referral Center
4. ✅ Data loading within 1-2 seconds
5. ✅ No console errors
6. ✅ All API calls return 200 status

## 🎯 Next Steps

Once you can see the page:

1. Test each tab
2. Click on buttons to verify functionality
3. Check if data matches your database
4. Verify scores are calculated correctly
5. Test with different alumni accounts

---

**Need Help?** Share the specific error message or screenshot of what you're seeing!
