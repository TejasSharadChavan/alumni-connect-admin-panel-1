# Feed Section - Debug Guide 🔍

## Changes Applied

### 1. ✅ Replaced Navbar with Back Button

- Removed full navigation bar
- Added simple back button with "Community Feed" title
- Cleaner, more focused UI

### 2. ✅ Added Console Logging

- Reactions now log request/response data
- Comments now log request/response data
- Error messages are more detailed

### 3. ✅ Fixed React Import

- Added `React` import for `createElement` function
- Prevents runtime errors

---

## How to Debug

### Step 1: Open Browser Console

1. Open the feed page: `http://localhost:3000/feed`
2. Press `F12` or right-click → "Inspect"
3. Go to "Console" tab

### Step 2: Test Reactions

1. Click any reaction button (Like, Celebrate, Support, Insightful)
2. Check console for these logs:
   ```
   Sending reaction: { postId: X, reactionType: "like" }
   Reaction response status: 200 or 201
   Reaction response data: { reaction: {...}, action: "added", reactions: {...} }
   ```

**If you see errors:**

- Look for the error message in console
- Check if it says "Authentication required" → Token issue
- Check if it says "Invalid reaction type" → API validation issue
- Check if it says "Post not found" → Post ID issue

### Step 3: Test Comments

1. Click "Comment" button on any post
2. Type a comment and press Enter
3. Check console for these logs:
   ```
   Sending comment: { postId: X, content: "..." }
   Comment response status: 201
   Comment response data: { comment: {...} }
   ```

**If you see errors:**

- Look for the error message in console
- Check if it says "Authentication required" → Token issue
- Check if it says "Content is required" → Empty comment
- Check if it says "Post not found" → Post ID issue

---

## Common Issues & Solutions

### Issue 1: "Authentication required" Error

**Cause**: No auth token or expired token

**Solution**:

1. Check if logged in: `localStorage.getItem("auth_token")`
2. If null, go to `/login` and log in
3. If exists but still fails, token might be expired → Log in again

### Issue 2: Reactions Don't Update UI

**Cause**: Response format mismatch

**Check Console For**:

```javascript
Reaction response data: { ... }
```

**Expected Format**:

```javascript
{
  reaction: { id, postId, userId, reactionType, createdAt },
  action: "added" | "updated",
  reactions: {
    like: 5,
    celebrate: 3,
    support: 2,
    insightful: 1
  }
}
```

### Issue 3: Comments Don't Appear

**Cause**: Response format mismatch or GET endpoint issue

**Check Console For**:

```javascript
Comment response data: { ... }
```

**Expected Format**:

```javascript
{
  comment: {
    id: number,
    postId: number,
    userId: number,
    userName: string,
    userRole: string,
    content: string,
    likes: 0,
    hasLiked: false,
    createdAt: string
  }
}
```

### Issue 4: "Invalid reaction type" Error

**Cause**: API doesn't accept the reaction type

**Check**:

- Frontend sends: `like`, `celebrate`, `support`, `insightful`
- API should accept all of these
- If not, check `src/app/api/posts/[id]/react/route.ts` line ~90

### Issue 5: Network Errors (500, 404, etc.)

**Cause**: Server-side error

**Solution**:

1. Check server console (where you ran `npm run dev`)
2. Look for error stack traces
3. Common issues:
   - Database connection error
   - Missing columns in database
   - Type mismatches

---

## Testing Checklist

### ✅ Reactions

- [ ] Click "Like" → Should see reaction count increase
- [ ] Click "Celebrate" → Should see reaction count increase
- [ ] Click "Support" → Should see reaction count increase
- [ ] Click "Insightful" → Should see reaction count increase
- [ ] Click same reaction again → Should toggle off (if implemented)
- [ ] Check console for logs
- [ ] Check for toast notification

### ✅ Comments

- [ ] Click "Comment" button → Dialog opens
- [ ] Type comment → Can type text
- [ ] Press Enter or click Send → Comment submits
- [ ] Comment appears in list → UI updates
- [ ] Comment count increases → Number updates
- [ ] Check console for logs
- [ ] Check for toast notification

### ✅ Post Menu

- [ ] Click three-dot menu on YOUR post → See Edit + Delete
- [ ] Click three-dot menu on OTHER'S post → See only Report
- [ ] Back button works → Goes to previous page

---

## API Endpoints Being Used

### GET /api/posts

- Fetches all posts with reactions and comments count
- Returns: `{ posts: [...] }`

### POST /api/posts/:id/react

- Adds/updates reaction to a post
- Body: `{ reactionType: "like" | "celebrate" | "support" | "insightful" }`
- Returns: `{ reaction: {...}, action: "added", reactions: {...} }`

### GET /api/posts/:id/comments

- Fetches all comments for a post
- Returns: `{ comments: [...], count: number }`

### POST /api/posts/:id/comments

- Adds a comment to a post
- Body: `{ content: string, parentId?: number }`
- Returns: `{ comment: {...} }`

### GET /api/auth/me

- Gets current user info
- Returns: `{ user: { id, name, email, ... } }`

---

## What to Share for Further Help

If issues persist, please share:

1. **Console Logs**: Copy all logs from browser console
2. **Network Tab**:
   - Open DevTools → Network tab
   - Filter by "Fetch/XHR"
   - Click failed request
   - Share Request Headers, Request Body, Response
3. **Server Logs**: Copy error messages from terminal where `npm run dev` is running
4. **Screenshots**: Show what you see vs what you expect

---

## Quick Fixes to Try

### Fix 1: Clear Cache & Reload

```javascript
// In browser console:
localStorage.clear();
location.reload();
```

Then log in again.

### Fix 2: Check Database

Make sure posts table has these columns:

- id, authorId, content, category, imageUrl, status, visibility, createdAt

Make sure postReactions table has:

- id, postId, userId, reactionType, createdAt

Make sure comments table has:

- id, postId, authorId, content, createdAt

### Fix 3: Restart Dev Server

```bash
# Stop server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Expected Behavior

### When Everything Works:

1. ✅ Click reaction → Toast shows "Reaction added!"
2. ✅ Reaction count increases immediately
3. ✅ Your reaction is highlighted
4. ✅ Click comment → Dialog opens
5. ✅ Type and send comment → Comment appears
6. ✅ Comment count increases
7. ✅ Toast shows "Comment added!"
8. ✅ Back button returns to previous page
9. ✅ Post menu shows correct options based on ownership

---

## Files Modified

1. `src/app/feed/page.tsx`
   - Replaced navbar with back button
   - Added console logging
   - Added React import
   - Fixed currentUserId tracking

2. `src/app/api/posts/[id]/react/route.ts`
   - Added all reaction types
   - Fixed response format

3. `src/app/api/posts/[id]/comments/route.ts`
   - Added GET endpoint
   - Fixed POST response format
   - Added status validation

---

## Next Steps

1. Open feed page
2. Open browser console (F12)
3. Try reactions and comments
4. Share console logs if issues persist

The console logs will tell us exactly what's failing!
