import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Heart, ShieldCheck, Users } from 'lucide-react'

export default function Navbar() {
  const loc = useLocation()
  return (
    <nav className="bg-white/86 backdrop-blur-xl shadow-sm border-b border-teal-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-teal-800">SpeakUp</span>
          <span className="text-xs text-gray-500 hidden sm:block">Local communication companion</span>
        </Link>
        <div className="flex gap-1">
          <Link to="/" className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${loc.pathname === '/' || loc.pathname === '/about' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:block">About</span>
          </Link>
          <Link to="/profiles" className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${loc.pathname === '/profiles' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Users className="w-4 h-4" />
            <span className="hidden sm:block">Profiles</span>
          </Link>
          <Link to="/parent" className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${loc.pathname === '/parent' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:block">Parent Center</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
