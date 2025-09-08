import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'
import { User } from '../../lib/mongodb'
import clientPromise from '../../lib/mongodb'
import mongoose from 'mongoose'

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { phoneNumber } = await request.json()

  if (!phoneNumber) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
  }

  try {
    await clientPromise
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!)
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { phoneNumber: phoneNumber },
      { new: true, upsert: true }
    )

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Error saving phone number:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
