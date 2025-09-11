import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const timeMin = searchParams.get('timeMin')
  const timeMax = searchParams.get('timeMax')

  if (!email || !timeMin || !timeMax) {
    return NextResponse.json({ error: 'email, timeMin, and timeMax are required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const user = await db.collection('users').findOne({ email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const account = await db.collection('accounts').findOne({
      userId: new ObjectId(user._id)
    })

    if (!account || !account.refresh_token) {
      return NextResponse.json({ error: 'No refresh token found' }, { status: 400 })
    }

    oauth2Client.setCredentials({
      refresh_token: account.refresh_token,
    })

    const { token: accessToken } = await oauth2Client.getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to refresh access token' }, { status: 401 })
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    })

    return NextResponse.json({
      events: res.data.items?.map(event => ({
        id: event.id,
        summary: event.summary,
        start: event.start?.dateTime,
      })) || [],
    })
  } catch (error: any) {
    console.error('Error fetching debug events:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}