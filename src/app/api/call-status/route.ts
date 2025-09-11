import { NextResponse } from 'next/server'
import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  if (!eventId) {
    return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const callRecord = await db.collection('call_records').findOne({ eventId })

    if (callRecord) {
      return NextResponse.json({ 
        status: `Call initiated at ${new Date(callRecord.timestamp).toLocaleString()}`, 
        callSid: callRecord.callSid 
      })
    } else {
      return NextResponse.json({ status: 'No call initiated yet' })
    }
  } catch (error: any) {
    console.error('Error fetching call status:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}