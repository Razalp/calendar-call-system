import React from 'react'

export function Footer() {
  return (
    <footer className="bg-white/50 backdrop-blur-lg mt-16">
      <div className="container mx-auto px-4 py-6 text-center text-gray-600">
        <p>&copy; {new Date().getFullYear()} Calendar Call System. All rights reserved.</p>
      </div>
    </footer>
  )
}
