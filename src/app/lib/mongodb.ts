import { MongoClient, MongoClientOptions, ServerApiVersion } from 'mongodb'
import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI!
const options: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Mongoose schemas
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  image: String,
  phoneNumber: String,
  googleAccessToken: String,
  googleRefreshToken: String,
  createdAt: { type: Date, default: Date.now }
})

export const User = mongoose.models.User || mongoose.model('User', userSchema)

export default clientPromise