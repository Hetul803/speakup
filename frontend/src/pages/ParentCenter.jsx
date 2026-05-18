import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { childrenAPI, dashboardAPI, demoAPI } from '../api/client'
import {
  ArrowLeft,
  Bell,
  Bot,
  Clipboard,
  Download,
  FlaskConical,
  LockKeyhole,
  MessageCircle,
  Plus,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react'

function buildDeviceUrl(id) {
  return `${window.location.origin}/device/${id}`
}

export default function ParentCenter() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])
  const [dashboards, setDashboards] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(null)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const list = await childrenAPI.list()
      setProfiles(list)
      const rows = await Promise.all(list.map(async profile => {
        try {
          const dashboard = await dashboardAPI.get(profile.id)
          return { profile, dashboard }
        } catch {
          return { profile, dashboard: null }
        }
      }))
      setDashboards(rows)
    } finally {
      setLoading(false)
    }
  }

  async function seedFamily() {
    setSeeding(true)
    try {
      await demoAPI.seed()
      await load()
    } finally {
      setSeeding(false)
    }
  }

  async function copyDeviceLink(profile) {
    const url = buildDeviceUrl(profile.id)
    await navigator.clipboard.writeText(url)
    setCopied(profile.id)
    setTimeout(() => setCopied(null), 2500)
  }

  function exportFamilyReport() {
    const report = {
      exportDate: new Date().toISOString(),
      profiles: dashboards.map(({ profile, dashboard }) => ({
        profile,
        summary: dashboard,
        dedicatedDeviceUrl: buildDeviceUrl(profile.id),
      })),
      note: 'Synthetic/demo reports should not be treated as clinical records.',
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `speakup_family_report_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totals = useMemo(() => dashboards.reduce((acc, row) => {
    const d = row.dashboard
    acc.communications += d?.total_communications || 0
    acc.highUrgency += d?.high_urgency_count || 0
    acc.patterns += d?.learned_patterns || 0
    acc.unconfirmed += d?.recent_interactions?.filter(item => !item.confirmed).length || 0
    return acc
  }, { communications: 0, highUrgency: 0, patterns: 0, unconfirmed: 0 }), [dashboards])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 relative">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <button onClick={() => navigate('/profiles')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to profiles
          </button>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Parent command center</p>
          <h1 className="text-3xl font-bold text-gray-950 mt-1">Manage multiple communicators from one private dashboard.</h1>
          <p className="text-gray-600 mt-2 max-w-3xl">
            Parents and caregivers can watch progress, open the right profile, send a dedicated tablet link, export reports, and ask Gemma 4 for profile-specific summaries.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/profile/new')} className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-700">
            <Plus className="w-4 h-4" /> Add Profile
          </button>
          <button onClick={seedFamily} disabled={seeding} className="inline-flex items-center gap-2 bg-white border border-teal-100 text-teal-800 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-50 disabled:opacity-60">
            <FlaskConical className="w-4 h-4" /> {seeding ? 'Loading...' : 'Load Family Demo'}
          </button>
          <button onClick={exportFamilyReport} disabled={!profiles.length} className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-black disabled:opacity-50">
            <Download className="w-4 h-4" /> Export Family Report
          </button>
        </div>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Users, label: 'Profiles', val: profiles.length, tone: 'teal' },
          { icon: MessageCircle, label: 'Communications', val: totals.communications, tone: 'sky' },
          { icon: TrendingUp, label: 'Learned patterns', val: totals.patterns, tone: 'violet' },
          { icon: Bell, label: 'Needs review', val: totals.unconfirmed + totals.highUrgency, tone: 'amber' },
        ].map(item => (
          <div key={item.label} className="quiet-panel border border-white/70 rounded-2xl p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              item.tone === 'teal' ? 'bg-teal-50 text-teal-700' :
              item.tone === 'sky' ? 'bg-sky-50 text-sky-700' :
              item.tone === 'violet' ? 'bg-violet-50 text-violet-700' :
              'bg-amber-50 text-amber-700'
            }`}>
              <item.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-950">{item.val}</p>
            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </section>

      {profiles.length === 0 ? (
        <section className="quiet-panel border border-white/70 rounded-2xl p-10 text-center shadow-sm">
          <ShieldCheck className="w-10 h-10 text-teal-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900">No profiles yet</h2>
          <p className="text-gray-500 mt-2">Load the synthetic family demo or create named profiles for each communicator.</p>
        </section>
      ) : (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {dashboards.map(({ profile, dashboard }) => {
            const reviewCount = (dashboard?.recent_interactions?.filter(item => !item.confirmed).length || 0) + (dashboard?.high_urgency_count || 0)
            return (
              <article key={profile.id} className="quiet-panel border border-white/70 rounded-2xl shadow-sm overflow-hidden">
                <div className="h-2" style={{ backgroundColor: profile.avatar_color }} />
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full text-white flex items-center justify-center text-xl font-bold flex-shrink-0" style={{ backgroundColor: profile.avatar_color }}>
                        {profile.name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xl font-bold text-gray-950 truncate">{profile.name}</h2>
                        <p className="text-sm text-gray-500">{profile.age ? `Age ${profile.age}` : 'Age not set'}</p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold self-start ${reviewCount ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                      <Bell className="w-3 h-3" /> {reviewCount ? `${reviewCount} review item${reviewCount > 1 ? 's' : ''}` : 'All clear'}
                    </div>
                  </div>

                  {profile.notes && <p className="text-sm text-gray-600 mt-4 line-clamp-2">{profile.notes}</p>}

                  <div className="grid grid-cols-3 gap-3 mt-5">
                    {[
                      ['This week', dashboard?.this_week || 0],
                      ['Patterns', dashboard?.learned_patterns || 0],
                      ['Urgent', dashboard?.high_urgency_count || 0],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-white/82 border border-gray-100 rounded-xl p-3">
                        <p className="text-xl font-bold text-gray-950">{value}</p>
                        <p className="text-xs text-gray-500 mt-1">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 bg-white/82 border border-gray-100 rounded-xl p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 mb-2">Dedicated device link</p>
                    <p className="text-sm text-gray-600 break-all">{buildDeviceUrl(profile.id)}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      <button onClick={() => navigate(`/device/${profile.id}`)} className="inline-flex items-center justify-center gap-2 bg-amber-50 text-amber-800 py-2 rounded-xl text-sm font-semibold hover:bg-amber-100">
                        <LockKeyhole className="w-4 h-4" /> Open Device Mode
                      </button>
                      <button onClick={() => copyDeviceLink(profile)} className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200">
                        <Clipboard className="w-4 h-4" /> {copied === profile.id ? 'Copied' : 'Copy Link'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                    <button onClick={() => navigate(`/communicate/${profile.id}`)} className="inline-flex items-center justify-center gap-1 bg-teal-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-teal-700">
                      <MessageCircle className="w-4 h-4" /> Speak
                    </button>
                    <button onClick={() => navigate(`/chat/${profile.id}`)} className="inline-flex items-center justify-center gap-1 bg-gray-900 text-white py-2 rounded-xl text-sm font-semibold hover:bg-black">
                      <Bot className="w-4 h-4" /> Gemma
                    </button>
                    <button onClick={() => navigate(`/dashboard/${profile.id}`)} className="inline-flex items-center justify-center gap-1 bg-sky-50 text-sky-700 py-2 rounded-xl text-sm font-semibold hover:bg-sky-100">
                      <TrendingUp className="w-4 h-4" /> Progress
                    </button>
                    <button onClick={() => navigate(`/therapist/${profile.id}`)} className="inline-flex items-center justify-center gap-1 bg-violet-50 text-violet-700 py-2 rounded-xl text-sm font-semibold hover:bg-violet-100">
                      <Stethoscope className="w-4 h-4" /> Care
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}
