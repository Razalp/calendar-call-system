import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-black/30 border-gray-800 backdrop-blur-sm hover:bg-black/40 transition-all duration-300 group">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <CardTitle className="text-2xl font-bold text-white mb-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <CardDescription className="text-gray-300 text-lg leading-relaxed">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
