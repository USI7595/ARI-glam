# Debug Media Upload Issues

## Step 1: Check the Error Message

When you try to upload, what **exact error message** do you see in the admin panel?

Common errors:
- "Media upload failed." (generic error)
- "No blob credentials found" 
- "File too large"
- Network errors

## Step 2: Check Browser Console

1. Open your deployed site
2. Go to Admin page (`/admin`)
3. Press **F12** to open DevTools
4. Go to **Console** tab
5. Try to upload a file
6. Look for any red error messages

**Share what you see in the console.**

## Step 3: Check Vercel Function Logs

1. Go to your Vercel dashboard
2. Click on your project
3. Go to **Functions** tab
4. Look for recent errors in `/api/media`
5. Check the error logs

## Step 4: Test the Debug Endpoint

I've added a debug endpoint. Visit this URL on your deployed site:

```
https://your-site.vercel.app/api/media?debug
```

This will show you:
- Whether you're on Vercel
- Whether you're in production mode
- Whether Blob Storage token is configured
- Body parser configuration

**Share what you see at that URL.**

## Step 5: Verify Vercel Blob Storage Setup

1. Go to Vercel Dashboard → Your Project
2. Click **Storage** tab
3. Do you see a **Blob** database listed?

**If NO:**
- You need to create one: Click "Create Database" → Select "Blob"
- Name it (e.g., "ari-glam-media")
- This automatically adds `BLOB_READ_WRITE_TOKEN` to your environment

**If YES:**
- Click on your Blob database
- Check if files are being uploaded there
- Verify the token is in Environment Variables

## Step 6: Check Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

You should have:
- ✅ `BLOB_READ_WRITE_TOKEN` (automatically added when you create Blob storage)
- ✅ `RESEND_API_KEY` (for booking emails)
- ✅ `BOOKING_TO_EMAIL`
- ✅ `BOOKING_FROM_EMAIL`

## Step 7: Test with Small File

Try uploading a very small image (under 100KB) to rule out size issues.

## Common Issues & Solutions

### Issue 1: "Blob upload failed: No blob credentials found"
**Solution:** You haven't set up Vercel Blob Storage yet. Follow Step 5 above.

### Issue 2: "Request Entity Too Large" 
**Solution:** The file is too large. The body parser is set to 8MB max. Try a smaller file.

### Issue 3: Upload succeeds but image doesn't show
**Solution:** Check if the URL stored in `data/media.json` is valid. The image might be stored as a data URL (huge string) instead of a blob URL.

### Issue 4: CORS errors
**Solution:** Shouldn't happen with same-origin API, but check console for details.

## Quick Fix Checklist

- [ ] Created Vercel Blob Storage in dashboard
- [ ] Redeployed after setting up Blob Storage
- [ ] Checked debug endpoint: `/api/media?debug`
- [ ] Verified `BLOB_READ_WRITE_TOKEN` exists in environment variables
- [ ] Checked browser console for errors
- [ ] Checked Vercel function logs

## What I Need From You

Please provide:
1. **Error message** from admin panel
2. **Console errors** from browser DevTools (F12)
3. **Debug endpoint result** from `/api/media?debug`
4. **Screenshot** of Vercel Storage tab (does it show Blob database?)

This will help me identify the exact issue and fix it quickly.