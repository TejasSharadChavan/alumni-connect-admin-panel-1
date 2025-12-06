# Debug AI Recommendations

## Issue: "Failed to load recommendations"

### Quick Fixes Applied ✅

1. **Removed status filter** - Was filtering for `status='active'`, but users might have `status='approved'`
2. **Added comprehensive logging** - Console logs at every step
3. **Added error handling** - Try-catch blocks to prevent crashes
4. **Fixed indentation** - Corrected code structure

---

## How to Debug

### Step 1: Check Server Console

When you navigate to the Network → AI Matches tab, check your **server console** (where `npm run dev` is running) for these logs:

```
=== ML Recommend Alumni API Called ===
Authenticated user: 1 Rahul Sharma student
Total alumni found: 5
Existing connections: 2
Available alumni (not connected): 3
Calculating activity scores...
Activity scores calculated for 3 alumni
Calculating match scores...
Total recommendations before filtering: 3
Sorted recommendations: 3
Top 3 match scores: [74, 65, 42]
=== Returning 3 recommendations ===
```

### Step 2: Check Browser Console

Open browser console (F12) and look for:

```
ML Recommendations Response: {
  recommendations: [...],
  total: 3,
  algorithm: "real-time-matching"
}
```

---

## Common Issues & Solutions

### Issue 1: "No alumni found in the system"

**Cause**: No alumni in database

**Solution**:

```bash
# Seed the database
POST http://localhost:3000/api/seed-enhanced
```

**Check**:

```sql
SELECT COUNT(*) FROM users WHERE role = 'alumni';
-- Should return > 0
```

---

### Issue 2: "You are already connected with all available alumni"

**Cause**: Student is connected to all alumni

**Solution**:

- Create more alumni users, OR
- Disconnect from some alumni, OR
- Login as a different student

**Check**:

```
Server console should show:
Total alumni found: 5
Existing connections: 5
Available alumni (not connected): 0
```

---

### Issue 3: "No relevant matches found"

**Cause**: Match scores are all 0 (no skills, no branch match, etc.)

**Solution**:

1. Add skills to student profile
2. Add skills to alumni profiles
3. Ensure branch is set

**Check**:

```
Server console should show:
Top 3 match scores: [0, 0, 0]
```

---

### Issue 4: Authentication Error

**Cause**: Token expired or invalid

**Solution**:

1. Logout and login again
2. Check localStorage for `auth_token`
3. Verify token in database

**Check**:

```
Server console should show:
Authentication failed
```

---

### Issue 5: Database Query Error

**Cause**: Database connection issue or schema mismatch

**Solution**:

1. Check database connection
2. Verify schema is up to date
3. Check for migration errors

**Check**:

```
Server console should show:
=== ML recommend error ===
Error: [specific database error]
```

---

## Manual Testing Steps

### 1. Verify Alumni Exist

```bash
# Check database
SELECT id, name, email, role, status, skills, branch
FROM users
WHERE role = 'alumni';
```

Expected: At least 3-5 alumni with:

- ✅ role = 'alumni'
- ✅ status = 'approved' or 'active'
- ✅ skills (JSON array)
- ✅ branch set

### 2. Verify Student Profile

```bash
# Check student
SELECT id, name, email, role, skills, branch
FROM users
WHERE email = 'rahul.sharma@student.terna.ac.in';
```

Expected:

- ✅ skills: ["React", "Node.js", "MongoDB", "Express", "TypeScript"]
- ✅ branch: "Computer Engineering"

### 3. Check Connections

```bash
# Check connections
SELECT * FROM connections
WHERE requesterId = 1 OR responderId = 1;
```

Expected: Some connections, but not all alumni

### 4. Test API Directly

```bash
# Test with curl
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/ml/recommend-alumni?limit=10
```

Expected response:

```json
{
  "recommendations": [...],
  "total": 3,
  "algorithm": "real-time-matching"
}
```

---

## What the Logs Tell You

### Good Logs (Working):

```
=== ML Recommend Alumni API Called ===
Authenticated user: 1 Rahul Sharma student
Total alumni found: 5
Existing connections: 1
Available alumni (not connected): 4
Calculating activity scores...
Activity scores calculated for 4 alumni
Calculating match scores...
Total recommendations before filtering: 4
Sorted recommendations: 4
Top 3 match scores: [74, 65, 42]
=== Returning 4 recommendations ===
```

### Bad Logs (No Alumni):

```
=== ML Recommend Alumni API Called ===
Authenticated user: 1 Rahul Sharma student
Total alumni found: 0
No alumni in database
```

**Fix**: Seed database

### Bad Logs (All Connected):

```
=== ML Recommend Alumni API Called ===
Authenticated user: 1 Rahul Sharma student
Total alumni found: 5
Existing connections: 5
Available alumni (not connected): 0
All alumni already connected
```

**Fix**: Add more alumni or disconnect some

### Bad Logs (No Matches):

```
=== ML Recommend Alumni API Called ===
Authenticated user: 1 Rahul Sharma student
Total alumni found: 5
Existing connections: 0
Available alumni (not connected): 5
Calculating activity scores...
Activity scores calculated for 5 alumni
Calculating match scores...
Total recommendations before filtering: 5
Sorted recommendations: 0
No relevant matches after filtering
```

**Fix**: Add skills to profiles

---

## Expected Match Scores

### High Match (70-90%):

- Same branch ✓
- 3+ common skills ✓
- 2-8 years experience ✓
- Active profile ✓

### Medium Match (40-69%):

- Same branch OR common skills
- Some activity
- Reasonable experience

### Low Match (1-39%):

- Different branch
- Few/no common skills
- Low activity

### No Match (0%):

- No skills at all
- No profile data

---

## Quick Fix Checklist

- [ ] Database seeded with alumni
- [ ] Alumni have skills in their profiles
- [ ] Student has skills in profile
- [ ] Not all alumni are connected
- [ ] Server is running
- [ ] No console errors
- [ ] Token is valid
- [ ] Database connection working

---

## Still Not Working?

### Check These:

1. **Server Console**: Any errors?
2. **Browser Console**: Any errors?
3. **Network Tab**: API call successful (200)?
4. **Database**: Alumni exist?
5. **Profile**: Student has skills?

### Get Help:

1. Copy server console logs
2. Copy browser console logs
3. Copy API response
4. Share for debugging

---

## Success Indicators

✅ Server logs show: "=== Returning X recommendations ==="
✅ Browser shows: AI match cards with percentages
✅ Match scores are > 0
✅ Common skills are listed
✅ Explanations make sense
