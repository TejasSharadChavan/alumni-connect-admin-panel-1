# Debug Filter Issue 🔍

## Issue

Filtering by categories other than "all" and "general" is not working properly.

## Debug Steps Added

### 1. Frontend Logging (Feed Page)

Added console logs to track:

- What filter is selected
- What API URL is being called
- How many posts are received
- What categories the posts have

### 2. Backend Logging (API)

Added console log to track:

- What category filter is being applied

---

## How to Debug

### Step 1: Open Browser Console

1. Go to `/feed`
2. Press F12 to open DevTools
3. Go to Console tab

### Step 2: Test Each Filter

Click each filter option and check console:

#### Test "All Posts":

```
Expected Console Output:
Fetching posts with filter: all
API URL: /api/posts
Received 15 posts for category: all
Posts categories: ["achievements", "events", "career", "academic", "general", ...]
```

#### Test "Career":

```
Expected Console Output:
Fetching posts with filter: career
API URL: /api/posts?category=career
Received 3 posts for category: career
Posts categories: ["career", "career", "career"]
```

#### Test "Events":

```
Expected Console Output:
Fetching posts with filter: events
API URL: /api/posts?category=events
Received 3 posts for category: events
Posts categories: ["events", "events", "events"]
```

#### Test "Academic":

```
Expected Console Output:
Fetching posts with filter: academic
API URL: /api/posts?category=academic
Received 2 posts for category: academic
Posts categories: ["academic", "academic"]
```

#### Test "Achievements":

```
Expected Console Output:
Fetching posts with filter: achievements
API URL: /api/posts?category=achievements
Received 3 posts for category: achievements
Posts categories: ["achievements", "achievements", "achievements"]
```

#### Test "Announcements":

```
Expected Console Output:
Fetching posts with filter: announcements
API URL: /api/posts?category=announcements
Received 2 posts for category: announcements
Posts categories: ["announcements", "announcements"]
```

---

## Possible Issues & Solutions

### Issue 1: Posts Have Wrong Categories in Database

**Symptom**: Console shows posts but with different categories than expected

**Check**:

```sql
SELECT category, COUNT(*) FROM posts GROUP BY category;
```

**Solution**:

- Re-run seed script: `bun run scripts/seed-posts.ts`
- Or manually update post categories in database

---

### Issue 2: API Not Receiving Category Parameter

**Symptom**: API URL doesn't include `?category=...`

**Check**: Frontend console for API URL

**Solution**:

- Verify `filterCategory` state is updating
- Check RadioGroup `onValueChange` is working

---

### Issue 3: API Not Filtering Correctly

**Symptom**: API receives category but returns all posts

**Check**: Server console (where you ran `npm run dev`)

**Solution**:

- Check if category condition is being added
- Verify SQL query includes WHERE clause

---

### Issue 4: Case Sensitivity Mismatch

**Symptom**: Filter sends "Career" but database has "career"

**Check**: Console logs for exact category strings

**Solution**:

- Ensure consistent casing (lowercase)
- Update RadioGroup values to match database

---

## Quick Test Script

Run this in browser console to check current posts:

```javascript
// Fetch all posts
fetch("/api/posts")
  .then((r) => r.json())
  .then((data) => {
    console.log("Total posts:", data.posts.length);
    console.log("Categories:", [...new Set(data.posts.map((p) => p.category))]);
    console.log(
      "Category counts:",
      data.posts.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {})
    );
  });

// Test specific category
fetch("/api/posts?category=career")
  .then((r) => r.json())
  .then((data) => {
    console.log("Career posts:", data.posts.length);
    console.log(
      "All are career?",
      data.posts.every((p) => p.category === "career")
    );
  });
```

---

## Expected Post Distribution

Based on seed script:

| Category      | Count  |
| ------------- | ------ |
| achievements  | 3      |
| events        | 3      |
| career        | 3      |
| academic      | 2      |
| general       | 2      |
| announcements | 2      |
| **TOTAL**     | **15** |

---

## Verification Checklist

- [ ] Seed script has been run
- [ ] Database has 15 posts
- [ ] Posts have correct categories
- [ ] "All Posts" shows all 15 posts
- [ ] "General" shows 2 posts
- [ ] "Career" shows 3 posts
- [ ] "Events" shows 3 posts
- [ ] "Academic" shows 2 posts
- [ ] "Achievements" shows 3 posts
- [ ] "Announcements" shows 2 posts

---

## Next Steps

1. Open `/feed` in browser
2. Open browser console (F12)
3. Click each filter option
4. Share the console output
5. We'll identify the exact issue

The console logs will tell us exactly where the filtering is breaking!
