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

  const client = await clientPromise
  const db = client.db()

  const users = await db.collection('users').find({
    phoneNumber: { $exists: true, $ne: null },
  }).toArray()

  console.log(`Found ${users.length} users with phone numbers`)

  for (const user of users) {
    console.log(`Processing user: ${user.email} with phone: ${user.phoneNumber}`)

    const account = await db.collection('accounts').findOne({
      userId: new ObjectId(user._id)
    })

    if (!account || !account.refresh_token) {
      console.log(`No account or refresh token for user: ${user.email}`)
      continue
    }

    try {
      oauth2Client.setCredentials({
        refresh_token: account.refresh_token,
      })

      const { token: accessToken } = await oauth2Client.getAccessToken()
      if (!accessToken) {
        console.error(`Failed to refresh access token for user: ${user.email}`)
        continue
      }

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      
      const now = new Date()
      // Check events starting between 4:45 and 5:15 minutes from now to account for timing variations
      const timeMin = new Date(now.getTime() + 4 * 60 * 1000 + 45 * 1000) // 4:45
      const timeMax = new Date(now.getTime() + 5 * 60 * 1000 + 15 * 1000) // 5:15

      console.log(`Checking events for user ${user.email} between ${timeMin.toISOString()} and ${timeMax.toISOString()}`)

      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        maxResults: 10, // Increased to catch potential overlapping events
        singleEvents: true,
        orderBy: 'startTime',
      })

      if (res.data.items && res.data.items.length > 0) {
        for (const event of res.data.items) {
          if (!event.id || !event.start || !event.start.dateTime) {
            console.log(`Skipping event with missing id or start time for user ${user.email}`)
            continue
          }

          const eventId = event.id
          const eventStartTime = new Date(event.start.dateTime)
          const timeToEvent = (eventStartTime.getTime() - now.getTime()) / 1000 / 60 // Minutes to event

          // Only process events that are approximately 5 minutes away (±15 seconds)
          if (Math.abs(timeToEvent - 5) <= 0.25) {
            // Check if a call has already been sent for this event
            const callRecord = await db.collection('call_records').findOne({
              userId: new ObjectId(user._id),
              eventId: eventId,
            })

            if (callRecord) {
              console.log(`Call already sent for event ${eventId} for user ${user.email}`)
              continue
            }

            // Convert to IST for the message
            const istTime = new Intl.DateTimeFormat('en-IN', {
              timeZone: 'Asia/Kolkata',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }).format(eventStartTime)
            
            const message = `Hello, this is a reminder for your upcoming event: ${event.summary || 'Untitled Event'}. It starts at ${istTime}.`

            const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER
            if (!twilioPhoneNumber) {
              console.error('TWILIO_PHONE_NUMBER environment variable is not set')
              continue
            }

            try {
              const call = await twilioClient.calls.create({
                to: user.phoneNumber,
                from: twilioPhoneNumber,
                twiml: `<Response><Say>${message}</Say></Response>`,
              })

              console.log(`Call initiated for user ${user.email}, event ${event.summary || 'Untitled Event'}, call SID: ${call.sid}, at ${new Date().toISOString()}`)

              // Record the call to prevent duplicates
              await db.collection('call_records').insertOne({
                userId: new ObjectId(user._id),
                eventId: eventId,
                callSid: call.sid,
                timestamp: new Date(),
              })
            } catch (twilioError) {
              console.error(`Twilio error for user ${user.email}, event ${eventId}:`, twilioError)
            }
          } else {
            console.log(`Event ${eventId} for user ${user.email} is ${timeToEvent.toFixed(2)} minutes away, skipping`)
          }
        }
      } else {
        console.log(`No events found for user ${user.email} in the time window`)
      }
    } catch (error) {
      console.error(`Error processing calendar for user ${user.email}:`, error)
    }
  }
}