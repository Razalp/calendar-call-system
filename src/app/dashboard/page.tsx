"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Phone, User, Settings, Bell, CheckCircle, Trash2, PhoneOutgoing } from "lucide-react"
import "react-phone-number-input/style.css"
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input"

interface CalendarEvent {
  summary: string
  start: {
    dateTime: string
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [callNowLoading, setCallNowLoading] = useState(false)
  const [callNowMessage, setCallNowMessage] = useState("")
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [countdown, setCountdown] = useState("")
  const [callAlertCountdown, setCallAlertCountdown] = useState("")
  const [nextEvent, setNextEvent] = useState<CalendarEvent | null>(null)
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
    if (status === "authenticated") {
      fetchEvents()
      fetchPhoneNumber()
    }
  }, [status, router])

  useEffect(() => {
    const savedPhoneNumber = sessionStorage.getItem("phoneNumber")
    if (savedPhoneNumber) {
      setPhoneNumber(savedPhoneNumber)
    }
  }, [])

  useEffect(() => {
    if (events.length > 0) {
      const now = new Date().getTime()
      const upcomingEvents = events.filter((event) => new Date(event.start.dateTime).getTime() > now)
      if (upcomingEvents.length > 0) {
        const next = upcomingEvents[0]
        setNextEvent(next)

        const interval = setInterval(() => {
          const now = new Date().getTime()
          const eventTime = new Date(next.start.dateTime).getTime()
          const callAlertTime = eventTime - 5 * 60 * 1000 // 5 minutes before event
          const eventDistance = eventTime - now
          const callDistance = callAlertTime - now

          // Event countdown
          if (eventDistance < 0) {
            clearInterval(interval)
            setCountdown("Event has started")
            setCallAlertCountdown("")
            fetchEvents() // Refetch events to get the next one
          } else {
            const eventHours = Math.floor(eventDistance / (1000 * 60 * 60))
            const eventMinutes = Math.floor((eventDistance % (1000 * 60 * 60)) / (1000 * 60))
            const eventSeconds = Math.floor((eventDistance % (1000 * 60)) / 1000)
            setCountdown(`${eventHours.toString().padStart(2, "0")}:${eventMinutes.toString().padStart(2, "0")}:${eventSeconds.toString().padStart(2, "0")}`)
          }

          // Call alert countdown
          if (callDistance > 0) {
            const callHours = Math.floor(callDistance / (1000 * 60 * 60))
            const callMinutes = Math.floor((callDistance % (1000 * 60 * 60)) / (1000 * 60))
            const callSeconds = Math.floor((callDistance % (1000 * 60)) / 1000)
            setCallAlertCountdown(`${callHours.toString().padStart(2, "0")}:${callMinutes.toString().padStart(2, "0")}:${callSeconds.toString().padStart(2, "0")}`)
          } else {
            setCallAlertCountdown("Call alert scheduled")
          }
        }, 1000)

        return () => clearInterval(interval)
      } else {
        setNextEvent(null)
        setCountdown("")
        setCallAlertCountdown("")
      }
    }
  }, [events])

  const handleRemovePhoneNumber = async () => {
    setIsLoading(true)
    setMessage("")
    try {
      const response = await fetch("/api/user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      if (response.ok) {
        setPhoneNumber("")
        sessionStorage.removeItem("phoneNumber")
        setMessage("Phone number removed successfully!")
        setTimeout(() => {
          setIsPhoneModalOpen(false)
          setMessage("")
        }, 1500)
      } else {
        setMessage(data.error || "Something went wrong.")
      }
    } catch (error) {
      setMessage("An error occurred.")
    }
    setIsLoading(false)
  }

  const fetchPhoneNumber = async () => {
    try {
      const response = await fetch("/api/user")
      const data = await response.json()
      if (response.ok && data.phoneNumber) {
        setPhoneNumber(data.phoneNumber)
        sessionStorage.setItem("phoneNumber", data.phoneNumber)
      }
    } catch (error) {
      console.error("Error fetching phone number:", error)
    }
  }

  const fetchEvents = async () => {
    setEventsLoading(true)
    try {
      const response = await fetch("/api/calendar")
      const data = await response.json()
      if (response.ok) {
        setEvents(data)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    }
    setEventsLoading(false)
  }

  const handleSavePhoneNumber = async () => {
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      setMessage("Please enter a valid phone number.")
      return
    }

    setIsLoading(true)
    setMessage("")
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      })
      const data = await response.json()
      if (response.ok) {
        setMessage("Phone number saved successfully!")
        sessionStorage.setItem("phoneNumber", phoneNumber)
        setTimeout(() => {
          setIsPhoneModalOpen(false)
          setMessage("")
        }, 1500)
      } else {
        setMessage(data.error || "Something went wrong.")
      }
    } catch (error) {
      setMessage("An error occurred.")
    }
    setIsLoading(false)
  }

  const handleCallNow = async () => {
    setCallNowLoading(true)
    setCallNowMessage("")
    try {
      const response = await fetch("/api/call-now", {
        method: "POST",
      })
      const data = await response.json()
      if (response.ok) {
        setCallNowMessage("Test call initiated successfully!")
        setTimeout(() => {
          setIsCallModalOpen(false)
          setCallNowMessage("")
        }, 2000)
      } else {
        setCallNowMessage(data.error || "Something went wrong.")
      }
    } catch (error) {
      setCallNowMessage("An error occurred.")
    }
    setCallNowLoading(false)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-white/20 border-t-white"></div>
          <div className="absolute inset-0 animate-pulse">
            <div className="h-16 w-16 rounded-full bg-white/5"></div>
          </div>
        </div>
      </div>
    )
  }

  if (session) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-white/20 via-white/5 to-transparent animate-pulse"></div>
          <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-white/10 via-white/3 to-transparent animate-pulse delay-1000"></div>
          <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-white/15 via-white/4 to-transparent animate-pulse delay-500"></div>
        </div>

        <nav className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-black" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Meeting Dashboard
                </h1>
              </div>
              <Button
                onClick={() => signOut()}
                variant="outline"
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-white transition-all duration-300"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-6 py-12 relative z-10">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Welcome back, {session.user?.name?.split(" ")[0]}
            </h2>
            <p className="text-gray-400 text-lg">Manage your meetings and stay on schedule</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-white">
                  <User className="w-5 h-5" />
                  <span>Profile Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <span className="font-medium text-white">{session.user?.name}</span>
                  </p>
                  <p className="text-gray-400 text-sm">{session.user?.email}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Phone Number</span>
                    {phoneNumber && (
                      <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {phoneNumber ? (
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white font-mono">{phoneNumber}</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <p className="text-red-400 text-sm">No phone number set</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Dialog open={isPhoneModalOpen} onOpenChange={setIsPhoneModalOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex-1 bg-white text-black hover:bg-gray-200 transition-all duration-300">
                          <Settings className="w-4 h-4 mr-2" />
                          {phoneNumber ? "Update" : "Add"} Phone
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-black border-white/20 text-white">
                        <DialogHeader>
                          <DialogTitle className="text-xl">Phone Number Settings</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Add or update your phone number for meeting reminders
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-white">
                              Phone Number
                            </Label>
                            <PhoneInput
                              id="phone"
                              placeholder="Enter your phone number"
                              value={phoneNumber}
                              onChange={(value) => {
                                const strValue = value || ""
                                setPhoneNumber(strValue)
                                sessionStorage.setItem("phoneNumber", strValue)
                              }}
                              className="phone-input-dark"
                            />
                          </div>
                          {message && (
                            <div
                              className={`p-3 rounded-lg ${message.includes("successfully") ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}
                            >
                              <p
                                className={`text-sm ${message.includes("successfully") ? "text-green-400" : "text-red-400"}`}
                              >
                                {message}
                              </p>
                            </div>
                          )}
                          <div className="flex space-x-2">
                            <Button
                              onClick={handleSavePhoneNumber}
                              disabled={isLoading}
                              className="flex-1 bg-white text-black hover:bg-gray-200"
                            >
                              {isLoading ? "Saving..." : "Save Phone Number"}
                            </Button>
                            {phoneNumber && (
                              <Button
                                onClick={handleRemovePhoneNumber}
                                disabled={isLoading}
                                variant="outline"
                                className="border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isCallModalOpen} onOpenChange={setIsCallModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-white"
                          disabled={!phoneNumber}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-black border-white/20 text-white">
                        <DialogHeader>
                          <DialogTitle className="text-xl">Test Call</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Initiate a test call to verify your phone number
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-white">
                              Calling: <span className="font-mono">{phoneNumber}</span>
                            </p>
                          </div>
                          {callNowMessage && (
                            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                              <p className="text-blue-400 text-sm">{callNowMessage}</p>
                            </div>
                          )}
                          <Button
                            onClick={handleCallNow}
                            disabled={callNowLoading}
                            className="w-full bg-white text-black hover:bg-gray-200"
                          >
                            {callNowLoading ? "Calling..." : "Start Test Call"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-white">
                  <Calendar className="w-5 h-5" />
                  <span>Upcoming Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-white/10 rounded mb-2"></div>
                        <div className="h-3 bg-white/5 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : events.length > 0 ? (
                  <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
                    {events.map((event, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
                      >
                        <h4 className="font-medium text-white mb-1">{event.summary}</h4>
                        <p className="text-gray-400 text-sm flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(event.start.dateTime).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No upcoming events found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {nextEvent && (
              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3 text-white">
                    <Bell className="w-5 h-5" />
                    <span>Next Reminder</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-white">{nextEvent.summary}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-400 text-sm">{new Date(nextEvent.start.dateTime).toLocaleString()}</p>
                      </div>
                      <div className="relative">
                        <div className="text-4xl font-mono font-bold text-white mb-2 tracking-wider">{countdown}</div>
                        <div className="text-xs text-gray-400">Time to Event (HH:MM:SS)</div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-center space-x-2">
                          <PhoneOutgoing className="w-4 h-4 text-blue-400" />
                          <p className="text-sm text-blue-400">Call Reminder</p>
                        </div>
                        <div className="text-2xl font-mono font-bold text-blue-400 mt-1">{callAlertCountdown}</div>
                        <div className="text-xs text-gray-400">Time to Call Alert (HH:MM:SS)</div>
                      </div>
                    </div>
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