# Filter Debugging Guide 🔍

## Issue Reported

Filtering by categories other than "all" and "general" is not working.

## Debug Logging Added ✅

I've added comprehensive console logging to help identify the issue:

### Frontend Logs (Browser Console):

- Filter category selected
- API URL being called
- Number of posts received
- Categories of received posts

### Backend Logs (Server Console):

- Category filter being applied

---

## How to Debug

### Step 1: Run Seed Script (If Not Done)

Make sure you have posts in the database:

```bash
cd alumni-connect-admin-panel-1
bun run scripts/seed-posts.ts
```

This creates 15 posts with these categories:

- **achievements**: 3 posts
- **events**: 3 posts
- **career**: 3 posts
- **academic**: 2 posts
- **general**: 2 posts
- **announcements**: 2 posts

---

### Step 2: Open Browser Console

1. Go to `/feed`
2. Press **F12** (or right-click → Inspect)
3. Click **Console** tab
4. Clear console (trash icon)

---

### Step 3: Test Each Filter

Click each radio button and observe console output:

#### ✅ Test "All Posts":

**Expected Output:**

```
Fetching posts with filter: all
API URL: /api/posts
Received 15 posts for category: all
Posts categories: (15) ["achievements", "events", "career", ...]
```

#### ✅ Test "General":

**Expected Output:**

```
Fetching posts with filter: general
API URL: /api/posts?category=general
Received 2 posts for category: general
Posts categories: (2) ["general", "general"]
```

#### ❓ Test "Career":

**Expected Output:**

```
Fetching posts with filter: career
API URL: /api/posts?category=career
Received 3 posts for category: career
Posts categories: (3) ["career", "career", "career"]
```

**If you see 0 posts or wrong categories, there's an issue!**

#### ❓ Test "Events":

**Expected Output:**

```
Fetching posts with filter: events
API URL: /api/posts?category=events
Received 3 posts for category: events
Posts categories: (3) ["events", "events", "events"]
```

#### ❓ Test "Academic":

**Expected Output:**

```
Fetching posts with filter: academic
API URL: /api/posts?category=academic
Received 2 posts for category: academic
Posts categories: (2) ["academic", "academic"]
```

#### ❓ Test "Achievements":

**Expected Output:**

```
Fetching posts with filter: achievements
API URL: /api/posts?category=achievements
Received 3 posts for category: achievements
Posts categories: (3) ["achievements", "achievements", "achievements"]
```

#### ❓ Test "Announcements":

**Expected Output:**

```
Fetching posts with filter: announcements
API URL: /api/posts?category=announcements
Received 2 posts for category: announcements
Posts categories: (2) ["announcements", "announcements"]
```

---

## Diagnostic Script

Run this in browser console to check database:

```javascript
// Check all posts and their categories
fetch("/api/posts")
  .then((r) => r.json())
  .then((data) => {
    console.log("=== DATABASE CHECK ===");
    console.log("Total posts:", data.posts.length);

    // Count by category
    const counts = {};
    data.posts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    console.log("Category distribution:", counts);
    console.log(
      "Expected: achievements:3, events:3, career:3, academic:2, general:2, announcements:2"
    );
  });

// Test specific category filter
async function testFilter(category) {
  const response = await fetch(`/api/posts?category=${category}`);
  const data = await response.json();
  console.log(`\n=== FILTER TEST: ${category} ===`);
  console.log("Posts returned:", data.posts.length);
  console.log(
    "All match category?",
    data.posts.every((p) => p.category === category)
  );
  if (!data.posts.every((p) => p.category === category)) {
    console.log(
      "MISMATCH! Categories found:",
      data.posts.map((p) => p.category)
    );
  }
}

// Test all filters
["career", "events", "academic", "achievements", "announcements"].forEach(
  testFilter
);
```

---

## Common Issues & Solutions

### Issue 1: No Posts in Database

**Symptom**: "Received 0 posts for category: all"

**Solution**:

```bash
bun run scripts/seed-posts.ts
```

---

### Issue 2: Wrong Categories in Database

**Symptom**: Console shows posts but with unexpected categories

**Check Database**:

```sql
SELECT category, COUNT(*) as count
FROM posts
GROUP BY category;
```

**Solution**: Clear and re-seed

```bash
bun run scripts/clear-posts.ts
bun run scripts/seed-posts.ts
```

---

### Issue 3: API Not Filtering

**Symptom**: All filters return same 15 posts

**Check**: Server console (where `npm run dev` is running)

**Look for**: "Filtering by category: career"

**If missing**: API is not receiving category parameter

**Solution**: Check if URL includes `?category=...`

---

### Issue 4: Frontend Not Updating

**Symptom**: Clicking filters doesn't trigger new fetch

**Check**: Console for "Fetching posts with filter: ..."

**If missing**: RadioGroup not triggering state change

**Solution**: Verify `onValueChange` is connected to `setFilterCategory`

---

## Manual Database Check

If you have database access:

```sql
-- Check all posts
SELECT id, category, LEFT(content, 50) as content_preview
FROM posts
ORDER BY category;

-- Count by category
SELECT category, COUNT(*) as count
FROM posts
GROUP BY category
ORDER BY category;

-- Expected result:
-- academic: 2
-- achievements: 3
-- announcements: 2
-- career: 3
-- events: 3
-- general: 2
```

---

## What to Share

If filtering still doesn't work, share:

1. **Browser Console Output** when clicking each filter
2. **Server Console Output** (terminal where dev server runs)
3. **Database Query Result** (category counts)
4. **Network Tab** (F12 → Network → filter by "posts")

This will help identify exactly where the issue is!

---

## Expected Behavior

When working correctly:

1. Click "All Posts" → See 15 posts
2. Click "Career" → See 3 posts (only career)
3. Click "Events" → See 3 posts (only events)
4. Click "Academic" → See 2 posts (only academic)
5. Click "Achievements" → See 3 posts (only achievements)
6. Click "Announcements" → See 2 posts (only announcements)
7. Click "General" → See 2 posts (only general)

Each filter should show ONLY posts from that category!

---

## Quick Fix Checklist

- [ ] Seed script has been run
- [ ] Browser console shows correct API URLs
- [ ] Server console shows category filtering
- [ ] Database has posts with correct categories
- [ ] Network tab shows correct API responses
- [ ] Posts state is updating in React

Run through these steps and share the console output - we'll fix it!
