import { Card, CardContent } from '@/components/ui/card'
import React from 'react'

export function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="text-center hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-md border rounded-2xl hover:bg-white">
      <CardContent className="pt-8">
        <div className="mb-6 flex justify-center">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}
