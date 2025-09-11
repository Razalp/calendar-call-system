import { NextResponse } from 'next/server'
import { checkMeetingsAndSendReminders } from '../../lib/cron-logic'

export async function GET() {
  try {
    checkMeetingsAndSendReminders()

    return NextResponse.json({
      success: true,
      message: 'Cron job triggered successfully. It will run in the background.',
    })
  } catch (error) {
    console.error('Error triggering cron job from API:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}