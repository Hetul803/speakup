import { useEffect, useMemo, useState } from 'react'
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
  ShieldCheck,
  Bell,
  Download,
  LockKeyhole,
  ArrowRight,
  Users,
  Home as HomeIcon,
} from 'lucide-react'

const SIGNALS = [
  { icon: Mic, label: 'Sound', detail: 'hums, cries, mmm, breathing' },
  { icon: Hand, label: 'Gesture', detail: 'pointing, reaching, covering ears' },
  { icon: Camera, label: 'Context', detail: 'cup, toy, door, bright window' },
  { icon: Volume2, label: 'Voice', detail: 'spoken phrase and confirmation' },
]

const PARENT_POWERS = [
  { icon: Users, label: 'Manage every profile', text: 'Different children or communicators keep separate memory, notes, therapist contacts, and device links.' },
  { icon: Bell, label: 'Know what changed', text: 'Review urgent signals, unconfirmed moments, weekly communication counts, and learned patterns.' },
  { icon: LockKeyhole, label: 'Child-only device mode', text: 'Open a dedicated launch link for one profile on an iPad or tablet.' },
  { icon: Download, label: 'Export care reports', text: 'Share progress with a therapist, teacher, or support team without cloud accounts.' },
]

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
      <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr_360px] gap-5 mb-6">
        <div className="quiet-panel border border-white/70 rounded-2xl p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 text-teal-800 font-semibold text-sm mb-4 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4" /> Built for private, everyday communication
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 max-w-3xl leading-tight">
            SpeakUp helps minimally speaking and non-speaking people turn personal signals into words.
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl text-base">
            It is for families, caregivers, therapists, teachers, and communicators who use sounds, gestures, pointing, cards, routines, or camera context when speech is hard. Gemma 4 checks the person&apos;s memory, suggests a phrase, speaks it aloud, and learns when a caregiver confirms.
          </p>
          <div className="grid grid-cols-1 gap-3 mt-6">
            {[
              ['Who', 'Minimally speaking or non-speaking communicators of any age.'],
              ['What', 'A local AI companion that interprets signals and speaks likely intent.'],
              ['How it helps', 'Less guessing, better history, stronger care-team handoffs.'],
            ].map(([title, text]) => (
              <div key={title} className="bg-white/82 border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{title}</p>
                <p className="text-sm text-gray-700 mt-2">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="quiet-panel border border-white/70 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Communication loop</p>
              <h2 className="text-xl font-bold text-gray-950 mt-1">Signals become a spoken phrase</h2>
            </div>
            <Bot className="w-8 h-8 text-teal-600" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SIGNALS.map(item => (
              <div key={item.label} className="bg-white/86 border border-gray-100 rounded-xl p-4 min-h-[112px]">
                <item.icon className="w-5 h-5 text-teal-700 mb-3" />
                <p className="font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500 mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-teal-700 text-white rounded-xl p-4">
            <p className="text-sm text-teal-50">Example</p>
            <p className="font-semibold mt-1">Soft &quot;mmm&quot; + pointing + blue cup</p>
            <p className="text-sm text-teal-100 mt-2">Gemma 4 checks confirmed memory and says: &quot;I want water.&quot;</p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className={`flex items-start gap-3 px-4 py-4 rounded-2xl text-sm font-medium border shadow-sm ${
            ollamaStatus ? 'bg-green-50/90 text-green-800 border-green-200' : 'bg-amber-50/90 text-amber-800 border-amber-200'
          }`}>
            {ollamaStatus ? <Wifi className="w-5 h-5 mt-0.5" /> : <WifiOff className="w-5 h-5 mt-0.5" />}
            <div className="flex-1">
              <p>{ollamaStatus ? 'Local runtime connected' : 'Ollama is not reachable'}</p>
              <p className="text-xs opacity-80 mt-1">
                {runtime?.gemma4_ready
                  ? `Gemma 4 ready: ${runtime.active_model}`
                  : `Active model: ${runtime?.active_model || 'none'} · pull Gemma 4 before judging`}
              </p>
            </div>
            {runtime?.gemma4_ready && <Cpu className="w-4 h-4" />}
          </div>

          <div className="bg-teal-800 text-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-teal-100">Judge-ready family demo</p>
            <h2 className="text-xl font-bold mt-1">Synthetic profiles</h2>
            <p className="text-sm text-teal-100 mt-2">Loads multiple named profiles, separate care-team contacts, progress data, and no real person information.</p>
            <button
              onClick={seedDemo}
              disabled={seedingDemo}
              className="mt-4 inline-flex items-center gap-2 bg-white text-teal-900 px-4 py-2 rounded-xl font-semibold hover:bg-teal-50 disabled:bg-white/60"
            >
              <FlaskConical className="w-4 h-4" /> {seedingDemo ? 'Loading...' : 'Open Family Demo'}
            </button>
          </div>
        </aside>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 mb-6">
        <div className="quiet-panel border border-white/70 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <HomeIcon className="w-5 h-5 text-teal-700" />
            <h2 className="font-bold text-gray-950">Parent command center</h2>
          </div>
          <p className="text-sm text-gray-600">
            One caregiver can manage multiple communicators while each tablet opens only the profile assigned to that person.
          </p>
          <div className="mt-4 space-y-3">
            {PARENT_POWERS.map(item => (
              <div key={item.label} className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/parent')} className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-black">
            Open Parent Center <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="quiet-panel border border-white/70 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{profileSummary}</p>
              <h2 className="text-xl font-bold text-gray-900">Profiles on this parent device</h2>
              <p className="text-sm text-gray-500">Add or remove named communicator profiles stored locally.</p>
            </div>
            <button onClick={() => navigate('/profile/new')} className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-teal-700">
              <Plus className="w-4 h-4" /> Add Profile
            </button>
          </div>

          {profiles.length === 0 ? (
            <div className="bg-white/80 border border-dashed border-gray-300 rounded-2xl py-14 text-center">
              <h3 className="text-xl font-semibold text-gray-800">No profiles yet</h3>
              <p className="text-gray-500 mt-2">Create a profile or open the synthetic family demo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {profiles.map(profile => (
                <article key={profile.id} className="bg-white/90 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="h-2" style={{ backgroundColor: profile.avatar_color }} />
                  <div className="p-4">
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
                        <Bot className="w-4 h-4" /> Chat
                      </button>
                      <button onClick={() => navigate(`/dashboard/${profile.id}`)} className="inline-flex items-center justify-center gap-1 bg-sky-50 text-sky-700 py-2 rounded-xl text-sm font-medium hover:bg-sky-100">
                        <BarChart2 className="w-4 h-4" /> Progress
                      </button>
                      <button onClick={() => navigate(`/therapist/${profile.id}`)} className="inline-flex items-center justify-center gap-1 bg-violet-50 text-violet-700 py-2 rounded-xl text-sm font-medium hover:bg-violet-100">
                        <Stethoscope className="w-4 h-4" /> Care Team
                      </button>
                      <button onClick={() => navigate(`/device/${profile.id}`)} className="inline-flex items-center justify-center gap-1 bg-amber-50 text-amber-700 py-2 rounded-xl text-sm font-medium hover:bg-amber-100">
                        <LockKeyhole className="w-4 h-4" /> Child Device
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
        </div>
      </section>
    </div>
  )
}
