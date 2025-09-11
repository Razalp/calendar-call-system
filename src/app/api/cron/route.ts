import { NextResponse } from 'next/server'
import { checkMeetingsAndSendReminders } from '../../lib/cron-logic'

export async function GET() {
  try {
    const result = await checkMeetingsAndSendReminders()
    return NextResponse.json({
      success: true,
      message: 'Cron job triggered successfully.',
      details: result,
    })
  } catch (error: any) {
    console.error('Error triggering cron job from API:', {
      message: error.message,
      stack: error.stack,
    })
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}