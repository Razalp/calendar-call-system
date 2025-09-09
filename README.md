📅 Calendar Call Reminder

A Next.js application that integrates with Google Calendar and Twilio to send phone call reminders for upcoming events.
The project is bootstrapped with create-next-app
.

🚀 Features

✅ Google Calendar integration with OAuth

✅ Automated phone call reminders using Twilio

✅ Cron job support for periodic event checks

✅ Authentication with NextAuth.js

✅ Ready for deployment on Vercel

🛠️ Tech Stack

Frontend/Backend: Next.js

Auth: NextAuth.js

Database: MongoDB (via MongoDB Atlas
)

Calls: Twilio API

Hosting: Vercel

⚡ Getting Started
1. Clone the Repository
git clone https://github.com/your-username/calendar-call-reminder.git
cd calendar-call-reminder

2. Install Dependencies
npm install
# or
yarn install
# or
pnpm install

3. Set Up Environment Variables

Create a .env.local file in the project root and add the following:

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_google_redirect_uri

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Twilio (Get from Twilio Console)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# App Settings
NODE_ENV=development

4. Run the Development Server
npm run dev


Then open http://localhost:3000
 in your browser.

⏰ Cron Job Setup

The app includes an API route at /api/cron that checks for upcoming events and sends reminders.

Option 1: Vercel Cron Jobs

If using Vercel, add this to your vercel.json:

{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "* * * * *"
    }
  ]
}

Option 2: External Service

If hosted elsewhere, use a service like Cron-Job.org
. Example command:

curl -X GET https://your-deployment-url/api/cron


Schedule it to run every minute (* * * * *).

📦 Deployment

The easiest way to deploy is via Vercel:

Push your code to GitHub

Import the repo into Vercel

Add your environment variables in the Vercel dashboard

Deploy 🚀

📚 Learn More

Next.js Documentation

NextAuth.js Docs

Twilio Voice API

Vercel Cron Jobs

🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open an issue
 or submit a PR.

📜 License

This project is licensed under the MIT License.