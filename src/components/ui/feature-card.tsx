import { Card, CardContent } from "@/components/ui/card"
import type { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-black/30 border border-gray-800 backdrop-blur-xl hover:bg-black/50 transition-all duration-300 group hover:scale-105 hover:shadow-2xl relative overflow-hidden">
      {/* Card glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <CardContent className="p-8 text-center relative z-10">
        <div className="mb-6 flex justify-center transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-gray-100 transition-colors">{title}</h3>
        <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{description}</p>
      </CardContent>
    </Card>
  )
}
