import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { childrenAPI, demoAPI } from '../api/client'
import {
  BarChart2,
  Bot,
  Edit,
  FlaskConical,
  LockKeyhole,
  MessageCircle,
  Plus,
  Stethoscope,
  Trash2,
} from 'lucide-react'

export default function Home() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [seedingDemo, setSeedingDemo] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    try {
      const data = await childrenAPI.list()
      setProfiles(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function seedDemo() {
    setSeedingDemo(true)
    try {
      await demoAPI.seed()
      await loadProfiles()
      navigate('/parent')
    } finally {
      setSeedingDemo(false)
    }
  }

  async function deleteProfile(id, name) {
    if (!confirm(`Remove ${name}'s profile from this device?`)) return
    await childrenAPI.delete(id)
    loadProfiles()
  }

  const profileSummary = useMemo(() => {
    if (!profiles.length) return 'No profiles yet'
    if (profiles.length === 1) return '1 communicator profile'
    return `${profiles.length} communicator profiles`
  }, [profiles.length])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 relative">
      <section className="quiet-panel border border-white/70 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{profileSummary}</p>
            <h1 className="text-3xl font-bold text-gray-950 mt-1">Profiles</h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Select a communicator, open their dedicated device mode, or manage profiles from Parent Center.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate('/parent')} className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-teal-700">
              <Plus className="w-4 h-4" /> Manage Profiles
            </button>
            <button onClick={seedDemo} disabled={seedingDemo} className="inline-flex items-center justify-center gap-2 bg-white border border-teal-100 text-teal-800 px-4 py-2 rounded-xl font-semibold hover:bg-teal-50 disabled:opacity-60">
              <FlaskConical className="w-4 h-4" /> {seedingDemo ? 'Loading...' : 'Open Family Demo'}
            </button>
          </div>
        </div>

        {profiles.length === 0 ? (
          <div className="bg-white/80 border border-dashed border-gray-300 rounded-2xl py-16 text-center">
            <h2 className="text-xl font-semibold text-gray-800">No profiles yet</h2>
            <p className="text-gray-500 mt-2">Create profiles from Parent Center or load the synthetic family demo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {profiles.map(profile => (
              <article key={profile.id} className="bg-white/92 border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[360px]">
                <div className="h-2" style={{ backgroundColor: profile.avatar_color }} />
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0" style={{ backgroundColor: profile.avatar_color }}>
                        {profile.name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xl font-bold text-gray-950 truncate">{profile.name}</h2>
                        {profile.age && <p className="text-sm text-gray-500">Age {profile.age}</p>}
                      </div>
                    </div>
                    <button onClick={() => deleteProfile(profile.id, profile.name)} className="text-gray-300 hover:text-red-500 p-1" aria-label={`Remove ${profile.name}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                    {profile.notes || 'Profile memory, device mode, progress, and care-team notes stay separate for this communicator.'}
                  </p>

                  <div className="grid grid-cols-1 gap-2 mb-4">
                    <button onClick={() => navigate(`/device/${profile.id}`)} className="h-14 inline-flex items-center justify-center gap-2 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700">
                      <LockKeyhole className="w-4 h-4" /> Open Dedicated Device
                    </button>
                    <button onClick={() => navigate(`/communicate/${profile.id}`)} className="h-12 inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50">
                      <MessageCircle className="w-4 h-4" /> Advanced Communicate
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button onClick={() => navigate(`/chat/${profile.id}`)} className="inline-flex items-center justify-center gap-1 bg-gray-900 text-white py-2 rounded-xl text-sm font-medium hover:bg-black">
                      <Bot className="w-4 h-4" /> Chat
                    </button>
                    <button onClick={() => navigate(`/dashboard/${profile.id}`)} className="inline-flex items-center justify-center gap-1 bg-sky-50 text-sky-700 py-2 rounded-xl text-sm font-medium hover:bg-sky-100">
                      <BarChart2 className="w-4 h-4" /> Progress
                    </button>
                    <button onClick={() => navigate(`/therapist/${profile.id}`)} className="inline-flex items-center justify-center gap-1 bg-violet-50 text-violet-700 py-2 rounded-xl text-sm font-medium hover:bg-violet-100">
                      <Stethoscope className="w-4 h-4" /> Care
                    </button>
                    <button onClick={() => navigate(`/profile/${profile.id}/edit`)} className="inline-flex items-center justify-center gap-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-200">
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
