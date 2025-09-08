import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export async function GET() {
  const session = await getServerSession()
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const user = await db.collection('users').findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const account = await db.collection('accounts').findOne({
      userId: new ObjectId(user._id)
    })

    if (!account || !account.refresh_token) {
      return NextResponse.json({ error: 'No account or refresh token for user' }, { status: 400 })
    }

    oauth2Client.setCredentials({
      refresh_token: account.refresh_token,
    })

    const { token: accessToken } = await oauth2Client.getAccessToken()

    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to retrieve access token' }, { status: 500 })
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    const now = new Date()
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: oneWeekFromNow.toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    })

    return NextResponse.json(res.data.items)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
