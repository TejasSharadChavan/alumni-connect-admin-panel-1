# 🔍 Image Display Debug Guide

## Issue: Images not displaying in messages

### Debug Steps:

#### 1. Open Browser Console

- Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- Go to the **Console** tab

#### 2. Check What's Being Logged

When you open a chat with images, you should see:

```
Fetched messages: [...]
Messages with images: [...]
Image loaded successfully: /uploads/message-images/xxx.jpg
```

OR if there's an error:

```
Failed to load image: /uploads/message-images/xxx.jpg
```

#### 3. Check the Image URL

Look at the console logs and check:

- Does the `imageUrl` field exist in the messages?
- What is the exact URL path?
- Example: `/uploads/message-images/a70f5822-5277-4ff1-b01a-d8dca45fa8f3-1764836062719.png`

#### 4. Test Image URL Directly

Copy the image URL from the console and try to access it directly:

- Example: `http://localhost:3000/uploads/message-images/a70f5822-5277-4ff1-b01a-d8dca45fa8f3-1764836062719.png`
- Paste this in your browser address bar
- Does the image load?

#### 5. Check Network Tab

In browser DevTools:

- Go to **Network** tab
- Filter by **Img**
- Reload the messages page
- Look for image requests
- Check if they return 200 (success) or 404 (not found)

---

## Common Issues & Solutions:

### Issue 1: imageUrl is null or undefined

**Symptom:** Console shows `imageUrl: null` or field is missing

**Solution:**

```bash
# Re-run the database migration
cd alumni-connect-admin-panel-1
bun run drizzle-kit push
```

### Issue 2: Image returns 404

**Symptom:** Network tab shows 404 for image requests

**Check:**

1. Does the file exist in `public/uploads/message-images/`?
2. Is the path correct (should start with `/uploads/...`)?

**Solution:**

```bash
# Check if images exist
dir public\uploads\message-images
```

### Issue 3: Images uploaded but not showing

**Symptom:** Upload succeeds but image doesn't display

**Check:**

1. Open browser console
2. Look for "Failed to load image" errors
3. Check the exact URL being used

**Solution:** The URL might be incorrect. Check the upload API response.

### Issue 4: CORS or security errors

**Symptom:** Console shows CORS or security errors

**Solution:** Images should be served from the same domain, no CORS issues expected.

---

## Manual Test:

### Step 1: Send a test image

```bash
# Start the app
cd alumni-connect-admin-panel-1
bun run dev
```

1. Login as: `aarav.sharma@terna.ac.in` / `password123`
2. Go to Messages
3. Select any chat
4. Click 📷 camera icon
5. Upload a small test image (PNG/JPG)
6. Send the message

### Step 2: Check the console

Look for these logs:

```
Fetched messages: [...]
Messages with images: [{..., imageUrl: "/uploads/message-images/xxx.jpg"}]
Image loaded successfully: /uploads/message-images/xxx.jpg
```

### Step 3: Click the image

- Click on the image
- Console should show: `Opening image: /uploads/message-images/xxx.jpg`
- Image should open in new tab

---

## What to Report:

If images still don't work, please share:

1. **Console logs** - Copy all messages from console
2. **Network tab** - Screenshot of image requests (404s, 200s, etc.)
3. **Image URL** - What URL is being used?
4. **File exists?** - Does the file exist in `public/uploads/message-images/`?

---

## Quick Fixes:

### Fix 1: Clear browser cache

```
Ctrl+Shift+Delete (Windows)
Cmd+Shift+Delete (Mac)
```

Clear cached images and files, then reload.

### Fix 2: Restart dev server

```bash
# Stop the server (Ctrl+C)
# Start again
bun run dev
```

### Fix 3: Check file permissions

```bash
# Make sure the uploads folder is writable
cd alumni-connect-admin-panel-1
dir public\uploads\message-images
```

---

## Expected Behavior:

✅ **Upload:**

- Click 📷 icon
- Select image
- See preview
- Click send
- Image uploads
- Message sent

✅ **Display:**

- Image appears in chat bubble
- Image is clickable
- Hover shows opacity change
- Click opens in new tab

✅ **Console:**

```
Fetched messages: [...]
Messages with images: [{id: 123, imageUrl: "/uploads/message-images/xxx.jpg"}]
Image loaded successfully: /uploads/message-images/xxx.jpg
Opening image: /uploads/message-images/xxx.jpg
```

---

**Please check the browser console and share what you see!** 🔍
