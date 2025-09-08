import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.email || !session.refreshToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    oauth2Client.setCredentials({
      refresh_token: session.refreshToken,
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
