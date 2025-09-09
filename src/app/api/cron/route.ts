import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import clientPromise from '../../lib/mongodb'
import twilio from 'twilio'
import { ObjectId } from 'mongodb'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const users = await db.collection('users').find({
      phoneNumber: { $exists: true, $ne: null },
    }).toArray()

    for (const user of users) {
      const account = await db.collection('accounts').findOne({
        userId: new ObjectId(user._id)
      })

      if (!account || !account.refresh_token) {
        console.error('No account or refresh token for user:', user.email)
        continue
      }

      oauth2Client.setCredentials({
        refresh_token: account.refresh_token,
      })

      const { token: accessToken } = await oauth2Client.getAccessToken()

      if (!accessToken) {
        console.error('Failed to retrieve access token for user:', user.email)
        continue
      }

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      const now = new Date()
      const fourMinutesFromNow = new Date(now.getTime() + 4 * 60 * 1000)
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

      console.log(`Checking for events between ${fourMinutesFromNow.toISOString()} and ${fiveMinutesFromNow.toISOString()}`)

      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: fourMinutesFromNow.toISOString(),
        timeMax: fiveMinutesFromNow.toISOString(),
        maxResults: 1,
        singleEvents: true,
        orderBy: 'startTime',
      })

      if (res.data.items && res.data.items.length > 0) {
        const event = res.data.items[0]
        console.log(`Found event: ${event.summary}, placing call to ${user.phoneNumber}`)
        const eventStartTime = event.start && event.start.dateTime ? new Date(event.start.dateTime).toLocaleTimeString() : 'an unknown time'
        const message = `Hello, this is a reminder for your upcoming event: ${event.summary}. It starts at ${eventStartTime}.`

        await twilioClient.calls.create({
          to: user.phoneNumber,
          from: process.env.TWILIO_PHONE_NUMBER!,
          twiml: `<Response><Say>${message}</Say></Response>`,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
