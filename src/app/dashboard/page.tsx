'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CalendarEvent {
  summary: string
  start: {
    dateTime: string
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
    if (status === 'authenticated') {
      fetchEvents()
    }
  }, [status, router])

  const fetchEvents = async () => {
    setEventsLoading(true)
    try {
      const response = await fetch('/api/calendar')
      const data = await response.json()
      if (response.ok) {
        setEvents(data)
        console.log(data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
    setEventsLoading(false)
  }

  const handleSavePhoneNumber = async () => {
    setIsLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      })
      const data = await response.json()
      if (response.ok) {
        setMessage('Phone number saved successfully!')
      } else {
        setMessage(data.error || 'Something went wrong.')
      }
    } catch (error) {
      setMessage('An error occurred.')
    }
    setIsLoading(false)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
              <Button onClick={() => signOut()}>Sign Out</Button>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Welcome, <strong>{session.user?.name}</strong> ({session.user?.email})
                </p>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <Button onClick={handleSavePhoneNumber} disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                  {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <p>Loading events...</p>
                ) : events.length > 0 ? (
                  <ul>
                    {events.map((event, index) => (
                      <li key={index} className="mb-2">
                        <strong>{event.summary}</strong> - {new Date(event.start.dateTime).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No upcoming events found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return null
}
