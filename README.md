# ARI Glam

React + Next.js website for ARI Glam Makeup Artistry, ready to deploy on Vercel.

## Run locally

Install Node.js first, then run:

```bash
npm install
npm run dev
```

Open the local URL Next.js prints in the terminal, usually:

```text
http://localhost:3000
```

## Deploy on Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose `Add New Project`.
3. Import the GitHub repository.
4. Keep the framework preset as `Next.js`.
5. Before deploying, set up Vercel Blob Storage (see below).
6. Deploy.

After deployment, Vercel gives you a temporary `.vercel.app` URL. You can connect a custom domain later from the Vercel project settings.

## Booking form

The booking form sends submissions to `/api/bookings`, which emails the request using Resend.

Set these environment variables in Vercel:

```text
RESEND_API_KEY=your_resend_api_key
BOOKING_TO_EMAIL=your_personal_email@example.com
BOOKING_FROM_EMAIL=ARI Glam <bookings@yourdomain.com>
```

For local testing, create a `.env.local` file with the same values. Resend can send from `onboarding@resend.dev` while testing, but a real custom domain should use a verified sender like `bookings@yourdomain.com`.

If email delivery is unavailable during local development, the API saves the booking in the `data/` folder. On Vercel, make sure the Resend variables are set with a verified sender address because serverless file storage is not a durable backup.

## Media uploads

### Local development
When running locally (`npm run dev`), uploaded media files are saved to `public/uploads/` and the paths are stored in `data/media.json`.

### Production (Vercel)
After deployment, media uploads use **Vercel Blob Storage** to store files. This is required because Vercel's serverless functions have read-only file systems.

#### Setup Vercel Blob Storage:

1. In your Vercel project dashboard, go to the **Storage** tab
2. Click **Create Database** and select **Blob**
3. Name your database (e.g., "ari-glam-media")
4. Vercel will automatically create the blob storage and add the `BLOB_READ_WRITE_TOKEN` environment variable to your project
5. Redeploy your application

The media upload system will now:
- Upload files to Vercel Blob Storage in production
- Store the blob URLs in `data/media.json`
- Display images and videos correctly on your portfolio

**Note:** If you don't set up Vercel Blob Storage, uploads will fall back to storing data URLs directly, which is less efficient but still functional.
