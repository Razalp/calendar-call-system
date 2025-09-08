'use client'

import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Phone, Shield } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import { FeatureCard } from '@/components/ui/feature-card'
import { Footer } from '@/components/ui/footer'

export default function HomePage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (session) {
      redirect('/dashboard')
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24 sm:py-32">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-fade-in-up">
            Never Miss An Important Meeting
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get phone call reminders 5 minutes before your Google Calendar events. 
            Stay punctual and professional with automated voice notifications.
          </p>
          
          <Card className="max-w-md mx-auto shadow-2xl border bg-white/80 backdrop-blur-lg rounded-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Get Started</CardTitle>
              <CardDescription>
                Connect your Google Calendar in seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => signIn('google')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
                size="lg"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <FeatureCard 
            icon={<Calendar className="w-8 h-8 text-blue-600" />}
            title="Calendar Integration"
            description="Seamlessly connects with your Google Calendar to track all your important events"
          />
          <FeatureCard 
            icon={<Phone className="w-8 h-8 text-green-600" />}
            title="Voice Reminders"
            description="Get clear voice call reminders 5 minutes before each scheduled event"
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8 text-purple-600" />}
            title="Secure & Private"
            description="Your data is encrypted and secure. We never store your calendar content"
          />
        </div>
      </div>
      <Footer />
    </div>
  )
}
