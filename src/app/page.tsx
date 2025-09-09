"use client"

import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Phone, Shield } from "lucide-react"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import { FeatureCard } from "@/components/ui/feature-card"
import { Footer } from "@/components/ui/footer"

export default function HomePage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (session) {
      redirect("/dashboard")
    }
  }, [session])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* Speed rays animation */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
              style={{
                top: `${Math.random() * 100}%`,
                left: "-100%",
                width: "200%",
                transform: `rotate(${Math.random() * 30 - 15}deg)`,
                animation: `speedRay ${3 + Math.random() * 4}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Diagonal grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_24px,rgba(255,255,255,0.1)_25px,rgba(255,255,255,0.1)_26px,transparent_27px,transparent_74px,rgba(255,255,255,0.1)_75px,rgba(255,255,255,0.1)_76px,transparent_77px),linear-gradient(-45deg,transparent_24px,rgba(255,255,255,0.1)_25px,rgba(255,255,255,0.1)_26px,transparent_27px,transparent_74px,rgba(255,255,255,0.1)_75px,rgba(255,255,255,0.1)_76px,transparent_77px)] bg-[length:100px_100px]"></div>
        </div>

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black"></div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24 sm:py-32 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-black mb-6 animate-fade-in-up tracking-tight leading-none">
            <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              Never Miss An
            </span>
            <br />
            <span className="text-5xl md:text-6xl font-light italic bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent">
              Important Meeting
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Get phone call reminders 5 minutes before your Google Calendar events. Stay punctual and professional with
            automated voice notifications.
          </p>

          <Card className="max-w-md mx-auto shadow-2xl border border-gray-800 bg-black/40 backdrop-blur-xl rounded-2xl relative overflow-hidden">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 rounded-2xl"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-transparent to-white/20 rounded-2xl blur opacity-20"></div>

            <CardHeader className="text-center relative z-10">
              <CardTitle className="text-3xl font-bold text-white mb-2">Get Started</CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Connect your Google Calendar in seconds
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <Button
                onClick={() => signIn("google")}
                className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden group"
                size="lg"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                <svg className="w-6 h-6 mr-3 relative z-10" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="relative z-10">Continue with Google</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon={<Calendar className="w-10 h-10 text-white" />}
            title="Calendar Integration"
            description="Seamlessly connects with your Google Calendar to track all your important events"
          />
          <FeatureCard
            icon={<Phone className="w-10 h-10 text-white" />}
            title="Voice Reminders"
            description="Get clear voice call reminders 5 minutes before each scheduled event"
          />
          <FeatureCard
            icon={<Shield className="w-10 h-10 text-white" />}
            title="Secure & Private"
            description="Your data is encrypted and secure. We never store your calendar content"
          />
        </div>
      </div>
      <Footer />

      <style jsx>{`
        @keyframes speedRay {
          0% {
            transform: translateX(-100%) rotate(var(--rotation, 0deg));
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateX(100%) rotate(var(--rotation, 0deg));
            opacity: 0;
          }
        }
        
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </div>
  )
}
