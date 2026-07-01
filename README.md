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
5. Deploy.

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
