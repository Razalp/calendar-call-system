import { google } from 'googleapis'
import clientPromise from './mongodb'
import twilio from 'twilio'
import { ObjectId } from 'mongodb'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function checkMeetingsAndSendReminders() {
  console.log('Starting checkMeetingsAndSendReminders at', new Date().toISOString())
  const result = { usersProcessed: 0, eventsFound: 0, callsInitiated: 0, errors: [] as string[] }

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    const error = 'Missing Twilio environment variables'
    console.error(error)
    result.errors.push(error)
    return result
  }

  const client = await clientPromise
  const db = client.db()

  const users = await db.collection('users').find({
    phoneNumber: { $exists: true, $ne: null },
  }).toArray()

  console.log(`Found ${users.length} users with phone numbers:`, users.map(u => u.email))
  result.usersProcessed = users.length

  for (const user of users) {
    console.log(`Processing user: ${user.email} with phone: ${user.phoneNumber}`)

    if (!user.phoneNumber.startsWith('+')) {
      const error = `Invalid phone number format for user ${user.email}: ${user.phoneNumber}`
      console.error(error)
      result.errors.push(error)
      continue
    }

    const account = await db.collection('accounts').findOne({
      userId: new ObjectId(user._id)
    })

    if (!account || !account.refresh_token) {
      const error = `No account or refresh token for user: ${user.email}`
      console.error(error)
      result.errors.push(error)
      continue
    }

    try {
      oauth2Client.setCredentials({
        refresh_token: account.refresh_token,
      })

      const { token: accessToken } = await oauth2Client.getAccessToken()
      if (!accessToken) {
        const error = `Failed to refresh access token for user: ${user.email}`
        console.error(error)
        result.errors.push(error)
        continue
      }

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      
      const now = new Date()
      const timeMin = new Date(now.getTime() + 4 * 60 * 1000) // 4:00
      const timeMax = new Date(now.getTime() + 6 * 60 * 1000) // 6:00

      console.log(`Checking events for user ${user.email} between ${timeMin.toISOString()} and ${timeMax.toISOString()}`)

      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      })

      if (res.data.items && res.data.items.length > 0) {
        console.log(`Found ${res.data.items.length} events for user ${user.email}:`, 
          res.data.items.map(e => ({ id: e.id, summary: e.summary, start: e.start?.dateTime })))
        result.eventsFound += res.data.items.length

        for (const event of res.data.items) {
          if (!event.id || !event.start || !event.start.dateTime) {
            console.log(`Skipping event with missing id or start time for user ${user.email}`)
            continue
          }

          const eventId = event.id
          const eventStartTime = new Date(event.start.dateTime)
          const timeToEvent = (eventStartTime.getTime() - now.getTime()) / 1000 / 60

          console.log(`Event ${eventId}: ${event.summary}, starts at ${eventStartTime.toISOString()}, ${timeToEvent.toFixed(2)} minutes away`)

          if (Math.abs(timeToEvent - 5) <= 0.167) { 
            const callRecord = await db.collection('call_records').findOne({
              userId: new ObjectId(user._id),
              eventId: eventId,
            })

            if (callRecord) {
              console.log(`Call already sent for event ${eventId} for user ${user.email}`)
              continue
            }

            const istTime = new Intl.DateTimeFormat('en-IN', {
              timeZone: 'Asia/Kolkata',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }).format(eventStartTime)
            
            const message = `Hello, this is a reminder for your upcoming event: ${event.summary || 'Untitled Event'}. It starts at ${istTime}.`

            try {
              const call = await twilioClient.calls.create({
                to: user.phoneNumber,
                from: process.env.TWILIO_PHONE_NUMBER,
                twiml: `<Response><Say>${message}</Say></Response>`,
              })

              console.log(`Call initiated for user ${user.email}, event ${event.summary || 'Untitled Event'}, call SID: ${call.sid}, at ${new Date().toISOString()}`)
              result.callsInitiated++

              await db.collection('call_records').insertOne({
                userId: new ObjectId(user._id),
                eventId: eventId,
                callSid: call.sid,
                timestamp: new Date(),
              })
            } catch (twilioError: any) {
              const error = `Twilio error for user ${user.email}, event ${eventId}: ${twilioError.message} (Code: ${twilioError.code})`
              console.error(error)
              result.errors.push(error)
            }
          } else {
            console.log(`Event ${eventId} for user ${user.email} is ${timeToEvent.toFixed(2)} minutes away, skipping`)
          }
        }
      } else {
        console.log(`No events found for user ${user.email} in the time window`)
      }
    } catch (error: any) {
      const errMsg = `Error processing calendar for user ${user.email}: ${error.message}`
      console.error(errMsg)
      result.errors.push(errMsg)
    }
  }

  console.log(`Cron job completed: ${JSON.stringify(result)}`)
  return result
}