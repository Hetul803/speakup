import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { childrenAPI } from '../api/client'
import { ArrowLeft, Bot, Home, LockKeyhole, MessageCircle, ShieldCheck, TabletSmartphone } from 'lucide-react'

export default function ChildDevice() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    childrenAPI.get(childId).then(setProfile).catch(() => navigate('/parent'))
  }, [childId])

  if (!profile) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 relative">
      <button onClick={() => navigate('/parent')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Parent Center
      </button>

      <section className="quiet-panel border border-white/70 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-stretch">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-100 px-3 py-1.5 rounded-full text-sm font-semibold mb-5">
              <LockKeyhole className="w-4 h-4" /> Dedicated device mode
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-3xl text-white flex items-center justify-center text-4xl font-bold shadow-sm" style={{ backgroundColor: profile.avatar_color }}>
                {profile.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-gray-500">This tablet is set up for</p>
                <h1 className="text-4xl font-bold text-gray-950">{profile.name}</h1>
              </div>
            </div>
            <p className="text-gray-600 mt-5 max-w-2xl">
              This screen keeps the experience focused on one communicator. Parents and caregivers can manage every profile from Parent Center, but this iPad link opens only {profile.name}&apos;s communication tools.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <button onClick={() => navigate(`/communicate/${profile.id}`)} className="h-24 inline-flex items-center justify-center gap-3 bg-teal-600 text-white rounded-2xl text-lg font-bold hover:bg-teal-700">
                <MessageCircle className="w-6 h-6" /> Communicate
              </button>
              <button onClick={() => navigate(`/chat/${profile.id}`)} className="h-24 inline-flex items-center justify-center gap-3 bg-gray-900 text-white rounded-2xl text-lg font-bold hover:bg-black">
                <Bot className="w-6 h-6" /> Gemma Chat
              </button>
            </div>
          </div>

          <aside className="bg-white/84 border border-gray-100 rounded-2xl p-5">
            <TabletSmartphone className="w-8 h-8 text-teal-700 mb-3" />
            <h2 className="font-bold text-gray-950">Install for this communicator</h2>
            <p className="text-sm text-gray-600 mt-2">
              On iPad, open this page in Safari and choose Share, then Add to Home Screen. The icon will launch this profile directly.
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-gray-600">Separate memory and care-team notes for {profile.name}.</p>
              </div>
              <div className="flex gap-3">
                <Home className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <p className="text-sm text-gray-600">Parent Center still manages all profiles on the caregiver device.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
