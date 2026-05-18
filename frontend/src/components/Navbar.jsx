import { Link, useLocation } from 'react-router-dom'
import { MessageCircle, BarChart2, Users, Heart } from 'lucide-react'

export default function Navbar() {
  const loc = useLocation()
  return (
    <nav className="bg-white shadow-sm border-b border-indigo-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-indigo-700">SpeakUp</span>
          <span className="text-xs text-gray-400 hidden sm:block">AI Communication Companion</span>
        </Link>
        <div className="flex gap-1">
          <Link to="/" className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${loc.pathname === '/' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Users className="w-4 h-4" />
            <span className="hidden sm:block">Profiles</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
