import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { childrenAPI, demoAPI } from '../api/client'
import { Plus, MessageCircle, BarChart2, Stethoscope, Edit, Wifi, WifiOff, Cpu, FlaskConical } from 'lucide-react'

const COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6']

export default function Home() {
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [ollamaStatus, setOllamaStatus] = useState(null)
  const [runtime, setRuntime] = useState(null)
  const [seedingDemo, setSeedingDemo] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadChildren()
    checkOllama()
  }, [])

  async function loadChildren() {
    try {
      const data = await childrenAPI.list()
      setChildren(data)
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
    } catch { setOllamaStatus(false) }
  }

  async function seedDemo() {
    setSeedingDemo(true)
    try {
      const demo = await demoAPI.seed()
      await loadChildren()
      navigate(`/communicate/${demo.child_id}`)
    } finally {
      setSeedingDemo(false)
    }
  }

  async function deleteChild(id, name) {
    if (!confirm(`Delete ${name}'s profile? This cannot be undone.`)) return
    await childrenAPI.delete(id)
    loadChildren()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Every child has a voice.
          <span className="text-indigo-600"> SpeakUp helps find it.</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          A local-first AI companion that learns your child's unique communication signals and translates them into speech — privately, offline, free.
        </p>
      </div>

      {/* Ollama Status */}
      <div className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${ollamaStatus ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
        {ollamaStatus ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        <span className="flex-1">
          {ollamaStatus
            ? `${runtime?.gemma4_ready ? 'Gemma 4' : 'Ollama'} is running locally — active model: ${runtime?.active_model || 'detecting'}`
            : 'Ollama not detected. Run: ollama serve && ollama pull hf.co/unsloth/gemma-4-E4B-it-GGUF'}
        </span>
        {runtime?.gemma4_ready && <span className="hidden sm:inline-flex items-center gap-1 bg-white/70 rounded-full px-2 py-1"><Cpu className="w-3 h-3" /> multimodal ready</span>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Children Supported', val: children.length },
          { label: 'Privacy', val: '100%' },
          { label: 'Cost', val: '$0' }
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-indigo-600">{s.val}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Children Grid */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Child Profiles</h2>
        <button
          onClick={() => navigate('/profile/new')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Child
        </button>
      </div>

      <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-teal-100 rounded-2xl p-4">
        <div>
          <p className="font-semibold text-gray-900">Kaggle judge demo</p>
          <p className="text-sm text-gray-500">Loads a synthetic profile with confirmed patterns, no real child data.</p>
        </div>
        <button
          onClick={seedDemo}
          disabled={seedingDemo}
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-teal-700 disabled:bg-gray-300 transition-colors"
        >
          <FlaskConical className="w-4 h-4" /> {seedingDemo ? 'Loading...' : 'Open Demo'}
        </button>
      </div>

      {children.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">👶</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No profiles yet</h3>
          <p className="text-gray-400 mb-6">Create a profile to start helping your child communicate</p>
          <button
            onClick={() => navigate('/profile/new')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700"
          >
            Create First Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map(child => (
            <div key={child.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-3" style={{ backgroundColor: child.avatar_color }} />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: child.avatar_color }}>
                    {child.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{child.name}</h3>
                    {child.age && <p className="text-sm text-gray-500">{child.age} years old</p>}
                  </div>
                </div>
                {child.notes && <p className="text-sm text-gray-400 mb-4 line-clamp-2">{child.notes}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate(`/communicate/${child.id}`)}
                    className="flex items-center justify-center gap-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-indigo-700"
                  >
                    <MessageCircle className="w-4 h-4" /> Communicate
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/${child.id}`)}
                    className="flex items-center justify-center gap-1 bg-purple-100 text-purple-700 py-2 rounded-xl text-sm font-medium hover:bg-purple-200"
                  >
                    <BarChart2 className="w-4 h-4" /> Progress
                  </button>
                  <button
                    onClick={() => navigate(`/therapist/${child.id}`)}
                    className="flex items-center justify-center gap-1 bg-green-50 text-green-700 py-2 rounded-xl text-sm font-medium hover:bg-green-100"
                  >
                    <Stethoscope className="w-4 h-4" /> Therapist
                  </button>
                  <button
                    onClick={() => navigate(`/profile/${child.id}/edit`)}
                    className="flex items-center justify-center gap-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-200"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mission */}
      <div className="mt-12 bg-indigo-600 text-white rounded-3xl p-8 text-center">
        <h3 className="text-2xl font-bold mb-3">Built for equity. Runs anywhere.</h3>
        <div className="grid grid-cols-3 gap-6 mt-6">
          {[
            { icon: '🔒', label: 'Zero cloud', desc: 'All data stays on device' },
            { icon: '📡', label: 'Works offline', desc: 'No internet required' },
            { icon: '💰', label: 'Free forever', desc: 'vs $8,000 AAC devices' },
          ].map(f => (
            <div key={f.label}>
              <div className="text-3xl mb-2">{f.icon}</div>
              <div className="font-semibold">{f.label}</div>
              <div className="text-indigo-200 text-sm">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
