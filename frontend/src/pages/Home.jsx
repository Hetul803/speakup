import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { childrenAPI, demoAPI } from '../api/client'
import {
  Plus,
  MessageCircle,
  BarChart2,
  Stethoscope,
  Edit,
  Wifi,
  WifiOff,
  Cpu,
  FlaskConical,
  Trash2,
  Bot,
  Camera,
  Mic,
  Hand,
  Volume2,
} from 'lucide-react'

export default function Home() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [ollamaStatus, setOllamaStatus] = useState(null)
  const [runtime, setRuntime] = useState(null)
  const [seedingDemo, setSeedingDemo] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadProfiles()
    checkOllama()
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

  async function checkOllama() {
    try {
      const res = await fetch('/api/health')
      const data = await res.json()
      setOllamaStatus(data.ollama === 'connected')
      setRuntime(data)
    } catch {
      setOllamaStatus(false)
    }
  }

  async function seedDemo() {
    setSeedingDemo(true)
    try {
      const demo = await demoAPI.seed()
      await loadProfiles()
      navigate(`/communicate/${demo.child_id}`)
    } finally {
      setSeedingDemo(false)
    }
  }

  async function deleteProfile(id, name) {
    if (!confirm(`Remove ${name}'s profile from this device?`)) return
    await childrenAPI.delete(id)
    loadProfiles()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-sm mb-3">
            <Volume2 className="w-4 h-4" /> Local AI communication support
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 max-w-3xl leading-tight">
            SpeakUp turns sounds, gestures, cards, and camera context into spoken words.
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl">
            Built for minimally speaking or non-speaking communicators and the people who support them. Gemma 4 reads current signals, checks confirmed memory, speaks a phrase, and learns when caregivers confirm.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { icon: Mic, label: 'Vocalizations' },
              { icon: Hand, label: 'Gestures' },
              { icon: Camera, label: 'Camera context' },
              { icon: Bot, label: 'Gemma chat' },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <item.icon className="w-5 h-5 text-teal-600 mb-2" />
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className={`flex items-start gap-3 px-4 py-4 rounded-2xl text-sm font-medium border ${
            ollamaStatus ? 'bg-green-50 text-green-800 border-green-200' : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {ollamaStatus ? <Wifi className="w-5 h-5 mt-0.5" /> : <WifiOff className="w-5 h-5 mt-0.5" />}
            <div className="flex-1">
              <p>{ollamaStatus ? 'Local runtime connected' : 'Ollama is not reachable'}</p>
              <p className="text-xs opacity-80 mt-1">
                {runtime?.gemma4_ready
                  ? `Gemma 4 ready: ${runtime.active_model}`
                  : `Active model: ${runtime?.active_model || 'none'} · pull Gemma 4 before final judging`}
              </p>
            </div>
            {runtime?.gemma4_ready && <Cpu className="w-4 h-4" />}
          </div>

          <div className="bg-teal-700 text-white rounded-2xl p-5">
            <p className="text-sm text-teal-100">Judge-ready demo</p>
            <h2 className="text-xl font-bold mt-1">Synthetic Emma profile</h2>
            <p className="text-sm text-teal-100 mt-2">Loads confirmed patterns, therapist contact, progress data, and no real person’s private information.</p>
            <button
              onClick={seedDemo}
              disabled={seedingDemo}
              className="mt-4 inline-flex items-center gap-2 bg-white text-teal-800 px-4 py-2 rounded-xl font-semibold hover:bg-teal-50 disabled:bg-white/60"
            >
              <FlaskConical className="w-4 h-4" /> {seedingDemo ? 'Loading...' : 'Open Demo'}
            </button>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Profiles</h2>
          <p className="text-sm text-gray-500">Add or remove named communicator profiles stored on this device.</p>
        </div>
        <button onClick={() => navigate('/profile/new')} className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-teal-700">
          <Plus className="w-4 h-4" /> Add Profile
        </button>
      </div>

      {profiles.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl py-16 text-center">
          <h3 className="text-xl font-semibold text-gray-800">No profiles yet</h3>
          <p className="text-gray-500 mt-2">Create a profile or open the synthetic demo to see the full loop.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {profiles.map(profile => (
            <article key={profile.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="h-2" style={{ backgroundColor: profile.avatar_color }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ backgroundColor: profile.avatar_color }}>
                      {profile.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-950 truncate">{profile.name}</h3>
                      {profile.age && <p className="text-sm text-gray-500">Age {profile.age}</p>}
                    </div>
                  </div>
                  <button onClick={() => deleteProfile(profile.id, profile.name)} className="text-gray-300 hover:text-red-500 p-1" aria-label={`Remove ${profile.name}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {profile.notes && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{profile.notes}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => navigate(`/communicate/${profile.id}`)} className="inline-flex items-center justify-center gap-1 bg-teal-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-teal-700">
                    <MessageCircle className="w-4 h-4" /> Communicate
                  </button>
                  <button onClick={() => navigate(`/chat/${profile.id}`)} className="inline-flex items-center justify-center gap-1 bg-gray-900 text-white py-2 rounded-xl text-sm font-medium hover:bg-black">
                    <Bot className="w-4 h-4" /> Gemma Chat
                  </button>
                  <button onClick={() => navigate(`/dashboard/${profile.id}`)} className="inline-flex items-center justify-center gap-1 bg-sky-50 text-sky-700 py-2 rounded-xl text-sm font-medium hover:bg-sky-100">
                    <BarChart2 className="w-4 h-4" /> Progress
                  </button>
                  <button onClick={() => navigate(`/therapist/${profile.id}`)} className="inline-flex items-center justify-center gap-1 bg-violet-50 text-violet-700 py-2 rounded-xl text-sm font-medium hover:bg-violet-100">
                    <Stethoscope className="w-4 h-4" /> Care Team
                  </button>
                  <button onClick={() => navigate(`/profile/${profile.id}/edit`)} className="col-span-2 inline-flex items-center justify-center gap-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-200">
                    <Edit className="w-4 h-4" /> Edit Profile
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
