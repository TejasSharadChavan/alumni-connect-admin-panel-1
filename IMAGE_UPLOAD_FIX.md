# Image Upload Fix - Troubleshooting Guide

## 🔧 Fixes Applied

### 1. **Auto-Create Upload Directories**

The upload was failing because the directories didn't exist.

**Fix**: API now automatically creates directories if they don't exist.

```typescript
// Create directory if it doesn't exist
await mkdir(uploadDir, { recursive: true });
```

### 2. **Better Error Logging**

Added detailed error messages to help debug issues.

```typescript
console.error("File upload error:", error);
console.error("Error stack:", error.stack);
```

### 3. **Enhanced Error Messages**

Frontend now shows detailed error messages from the API.

```typescript
toast.error(error.error || error.details || "Failed to upload image");
```

---

## 🧪 Testing Steps

### Step 1: Check Browser Console

1. Open browser console (F12)
2. Try uploading an image
3. Look for error messages:
   - "Upload failed:" - Shows API error
   - "Upload successful:" - Shows upload data

### Step 2: Check Server Terminal

Look for these messages:

- ✅ "Directory already exists or created: ..."
- ✅ "File uploaded successfully: ..."
- ❌ "File upload error: ..."

### Step 3: Verify Upload Folders

Check if these folders exist:

```
public/
  uploads/
    profile-images/
    message-images/
    resumes/
```

If they don't exist, the API will create them automatically.

---

## 🔍 Common Issues & Solutions

### Issue 1: "No file provided"

**Cause**: File not being sent to API

**Solution**:

```typescript
// Make sure FormData is correct
const formData = new FormData();
formData.append("file", file); // Must be "file"
formData.append("type", "profile-image");
```

### Issue 2: "Invalid file type"

**Cause**: File type not allowed

**Allowed Types**:

- Images: JPEG, JPG, PNG, GIF, WebP
- Documents: PDF, DOC, DOCX

**Solution**: Select a valid image file

### Issue 3: "File too large"

**Cause**: File size > 5MB

**Solution**:

- Compress the image
- Use a smaller image
- Or increase limit in API

### Issue 4: "Unauthorized"

**Cause**: No auth token or invalid token

**Solution**:

```typescript
// Check if token exists
const token = localStorage.getItem("auth_token");
if (!token) {
  // User needs to login again
}
```

### Issue 5: "Upload failed" (500 error)

**Possible Causes**:

1. Directory permissions
2. Disk space full
3. File system error

**Solution**:

1. Check server terminal for detailed error
2. Verify write permissions on `public/uploads/`
3. Check disk space

---

## 🛠️ Manual Fix (If Needed)

If automatic directory creation fails, create them manually:

### Windows:

```bash
cd alumni-connect-admin-panel-1
mkdir public\uploads\profile-images
mkdir public\uploads\message-images
mkdir public\uploads\resumes
```

### Mac/Linux:

```bash
cd alumni-connect-admin-panel-1
mkdir -p public/uploads/profile-images
mkdir -p public/uploads/message-images
mkdir -p public/uploads/resumes
```

---

## 📊 Upload Flow

```
1. User selects image
   ↓
2. Frontend validates (type, size)
   ↓
3. Create FormData with file
   ↓
4. POST /api/files/upload
   ↓
5. API validates file
   ↓
6. API creates directory (if needed)
   ↓
7. API saves file to disk
   ↓
8. API returns file URL
   ↓
9. Frontend updates profile
   ↓
10. Success! ✅
```

---

## 🔍 Debug Checklist

When upload fails, check:

- [ ] Browser console for errors
- [ ] Server terminal for errors
- [ ] File type is valid (JPEG, PNG, GIF, WebP)
- [ ] File size < 5MB
- [ ] Auth token exists
- [ ] Upload directories exist
- [ ] Write permissions on directories
- [ ] Disk space available

---

## 📝 Test Upload

### Quick Test:

1. **Go to Profile**: http://localhost:3000/alumni/profile
2. **Open Console**: Press F12
3. **Click "Change Photo"**
4. **Select a small PNG image** (< 1MB)
5. **Watch console for**:
   - "Upload successful: { url: '...' }"
   - Or error message

### Expected Success Output:

**Browser Console**:

```
Upload successful: {
  success: true,
  url: "/uploads/profile-images/abc123-1234567890.png",
  filename: "abc123-1234567890.png",
  originalName: "my-photo.png",
  size: 123456
}
```

**Server Terminal**:

```
Directory already exists or created: /path/to/public/uploads/profile-images
File uploaded successfully: /path/to/public/uploads/profile-images/abc123-1234567890.png
```

---

## ✅ Verification

After the fix:

1. ✅ Directories auto-create
2. ✅ Detailed error messages
3. ✅ Console logging for debugging
4. ✅ Better error handling
5. ✅ Upload should work

---

## 🚀 If Still Failing

**Share these details**:

1. **Browser Console Error**:

   ```
   Copy the error message from console
   ```

2. **Server Terminal Error**:

   ```
   Copy the error from terminal
   ```

3. **File Details**:
   - File type: (e.g., PNG)
   - File size: (e.g., 2MB)
   - File name: (e.g., photo.png)

4. **Operating System**:
   - Windows / Mac / Linux

This will help identify the exact issue!

---

## 📌 Summary

**Fixes Applied**:

1. ✅ Auto-create upload directories
2. ✅ Better error logging
3. ✅ Enhanced error messages
4. ✅ Console debugging

**Try uploading again** and check the console/terminal for detailed error messages if it still fails.
