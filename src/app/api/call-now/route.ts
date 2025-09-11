import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'
import { User } from '../../lib/mongodb'
import clientPromise from '../../lib/mongodb'
import mongoose from 'mongoose'
import twilio from 'twilio'

export async function POST() {
  const session = await getServerSession()
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.error('Twilio environment variables are not set')
    return NextResponse.json({ error: 'Server is not configured for making calls.' }, { status: 500 })
  }

  try {
    await clientPromise
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!)
    }

    const user = await User.findOne({ email: session.user.email })

    if (!user || !user.phoneNumber) {
      return NextResponse.json({ error: 'Phone number not found. Please save a valid phone number.' }, { status: 404 })
    }

    try {
      const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
      const message = `Hello, this is a reminder for your upcoming event on your google calender`

      await twilioClient.calls.create({
        to: user.phoneNumber,
        from: TWILIO_PHONE_NUMBER,
        twiml: `<Response><Say>${message}</Say></Response>`,
      })

      return NextResponse.json({ success: true, message: "Test call initiated." })
    } catch (twilioError) {
      console.error('Twilio API error:', twilioError)
      const errorMessage = twilioError instanceof Error ? twilioError.message : 'Unknown Twilio error'
      return NextResponse.json({ error: `Failed to initiate call: ${errorMessage}` }, { status: 500 })
    }
  } catch (error) {
    console.error('Error initiating test call:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}