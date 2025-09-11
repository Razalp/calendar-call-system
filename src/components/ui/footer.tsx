export function Footer() {
  return (
    <footer className="relative z-10 border-t border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-400 text-lg">© 2024 Meeting Reminder. Never miss an important meeting again.</p>
          <div className="mt-4 flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-base">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-base">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-base">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
