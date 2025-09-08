This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Setting up the Cron Job

This application uses a cron job to check for upcoming calendar events and send phone call reminders. The cron job is implemented as an API endpoint at `/api/cron`. To make the application fully functional, you need to set up a cron job to call this endpoint periodically.

We recommend running the cron job every minute to ensure timely reminders.

### Vercel Cron Jobs

If you are deploying to Vercel, you can use [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) to schedule the cron job. You can add the following to your `vercel.json` file:

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "* * * * *"
    }
  ]
}
```

### Other Services

If you are using another hosting provider, you can use their cron job feature or a third-party service like [Cron-Job.org](https://cron-job.org/). You will need to set up a cron job to make a `GET` request to the `/api/cron` endpoint of your deployed application.

Here is an example of a `curl` command you can use:

```bash
curl -X GET https://your-deployment-url/api/cron
```

You should schedule this command to run every minute. The cron expression for running a job every minute is `* * * * *`.
