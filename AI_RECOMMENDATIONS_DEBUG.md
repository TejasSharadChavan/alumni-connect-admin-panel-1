# AI Recommendations Debugging Guide

## Issue: "Failed to load AI recommendations"

The AI recommendations feature has been successfully implemented, but you're seeing this error. Here's how to debug and fix it:

## 1. Check API Endpoint

The new API endpoint `/api/ml/recommend-connections` has been created. Verify it's working:

```bash
# Test the API directly (replace YOUR_TOKEN with actual auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/ml/recommend-connections?limit=5
```

## 2. Check Database Data

The AI recommendations need users with profile data to work. Ensure you have:

- Multiple users with different roles (student, faculty, alumni)
- Users with skills data populated
- Users with profile information (headline, bio, etc.)

## 3. Check Browser Console

Open browser dev tools and check for:
- Network errors in the Network tab
- JavaScript errors in the Console tab
- The actual API response

## 4. Verify Authentication

Make sure you're logged in with a valid session token. The API requires authentication.

## 5. Test with Sample Data

If you don't have enough users, the API will return an empty recommendations array. You need:
- At least 2-3 users of different roles
- Users with some skills data
- Users not already connected to each other

## 6. Check API Logs

Look at the server console for detailed logs from the ML API:
- Authentication status
- User d