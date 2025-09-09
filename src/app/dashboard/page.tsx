'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import 'react-phone-number-input/style.css'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'

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
  const [callNowLoading, setCallNowLoading] = useState(false)
  const [callNowMessage, setCallNowMessage] = useState('')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [countdown, setCountdown] = useState('')
  const [nextEvent, setNextEvent] = useState<CalendarEvent | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
    if (status === 'authenticated') {
      fetchEvents()
      fetchPhoneNumber()
    }
  }, [status, router])
  
  useEffect(() => {
    const savedPhoneNumber = sessionStorage.getItem('phoneNumber')
    if (savedPhoneNumber) {
      setPhoneNumber(savedPhoneNumber)
    }
  }, [])

  useEffect(() => {
    if (events.length > 0) {
      const now = new Date().getTime();
      const upcomingEvents = events.filter(event => new Date(event.start.dateTime).getTime() > now);
      if (upcomingEvents.length > 0) {
        const next = upcomingEvents[0];
        setNextEvent(next);
        
        const interval = setInterval(() => {
          const now = new Date().getTime();
          const eventTime = new Date(next.start.dateTime).getTime();
          const distance = eventTime - now;

          if (distance < 0) {
            clearInterval(interval);
            setCountdown("Event has started");
            // refetch events to get the next one
            fetchEvents();
          } else {
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
          }
        }, 1000);

        return () => clearInterval(interval);
      } else {
        setNextEvent(null);
        setCountdown('');
      }
    }
  }, [events]);

  const fetchPhoneNumber = async () => {
    try {
      const response = await fetch('/api/user')
      const data = await response.json()
      if (response.ok && data.phoneNumber) {
        setPhoneNumber(data.phoneNumber)
        sessionStorage.setItem('phoneNumber', data.phoneNumber)
      }
    } catch (error) {
      console.error('Error fetching phone number:', error)
    }
  }

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
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      setMessage('Please enter a valid phone number.')
      return
    }

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
        sessionStorage.setItem('phoneNumber', phoneNumber)
      } else {
        setMessage(data.error || 'Something went wrong.')
      }
    } catch (error) {
      setMessage('An error occurred.')
    }
    setIsLoading(false)
  }

  const handleCallNow = async () => {
    setCallNowLoading(true)
    setCallNowMessage('')
    try {
      const response = await fetch('/api/call-now', {
        method: 'POST',
      })
      const data = await response.json()
      if (response.ok) {
        setCallNowMessage('Test call initiated successfully!')
      } else {
        setCallNowMessage(data.error || 'Something went wrong.')
      }
    } catch (error) {
      setCallNowMessage('An error occurred.')
    }
    setCallNowLoading(false)
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
                    <PhoneInput
                      id="phone"
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChange={(value) => {
                        const strValue = value || ''
                        setPhoneNumber(strValue)
                        sessionStorage.setItem('phoneNumber', strValue)
                      }}
                      className="input"
                    />
                    <Button onClick={handleSavePhoneNumber} disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button onClick={handleCallNow} disabled={callNowLoading}>
                      {callNowLoading ? 'Calling...' : 'Call Now'}
                    </Button>
                  </div>
                  {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
                  {callNowMessage && <p className="text-sm text-blue-600 mt-2">{callNowMessage}</p>}
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
            {nextEvent && (
               <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Next Reminder Call</CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                      <p className="font-bold text-lg">{nextEvent.summary}</p>
                      <p className="text-6xl font-mono my-4 text-center">{countdown}</p>
                      <p className="text-sm text-gray-500 text-center">
                        at {new Date(nextEvent.start.dateTime).toLocaleString()}
                      </p>
                    </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    )
  }

  return null
}
