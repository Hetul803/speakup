import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { childrenAPI, memoryAPI, interactionsAPI } from '../api/client'
import {
  ArrowLeft,
  Download,
  Brain,
  Zap,
  Activity,
  Mail,
  Phone,
  Building2,
  UserRound,
  ClipboardList,
  Save,
  MessageCircle,
} from 'lucide-react'

const EMPTY_CONTACT = {
  name: '',
  role: '',
  organization: '',
  email: '',
  phone: '',
  goal: '',
}

function parseContact(notes) {
  const latest = notes?.[0]
  if (!latest?.note) return EMPTY_CONTACT
  try {
    return { ...EMPTY_CONTACT, ...JSON.parse(latest.note) }
  } catch {
    return { ...EMPTY_CONTACT, goal: latest.note }
  }
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TherapistView() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const [child, setChild] = useState(null)
  const [patterns, setPatterns] = useState(null)
  const [history, setHistory] = useState([])
  const [professionalNotes, setProfessionalNotes] = useState([])
  const [contact, setContact] = useState(EMPTY_CONTACT)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [activeTab, setActiveTab] = useState('patterns')

  useEffect(() => {
    Promise.all([
      childrenAPI.get(childId),
      memoryAPI.patterns(childId),
      interactionsAPI.history(childId, 30),
      childrenAPI.notes(childId, 'therapist'),
      childrenAPI.notes(childId, 'therapist_contact'),
    ]).then(([c, p, h, notes, contactNotes]) => {
      setChild(c)
      setPatterns(p)
      setHistory(h)
      setProfessionalNotes(notes)
      setContact(parseContact(contactNotes))
    }).catch(() => navigate('/'))
  }, [childId])

  async function saveNote() {
    if (!note.trim()) return
    setSaving(true)
    await childrenAPI.addNote(childId, note.trim(), 'therapist')
    const notes = await childrenAPI.notes(childId, 'therapist')
    setProfessionalNotes(notes)
    setNote('')
    setSavedMsg('Professional note saved')
    setTimeout(() => setSavedMsg(''), 3000)
    setSaving(false)
  }

  async function saveContact() {
    setSaving(true)
    await childrenAPI.addNote(childId, JSON.stringify(contact), 'therapist_contact')
    setSavedMsg('Care team contact saved')
    setTimeout(() => setSavedMsg(''), 3000)
    setSaving(false)
  }

  function exportReport() {
    const report = {
      profile: child?.name,
      age: child?.age,
      exportDate: new Date().toISOString(),
      careTeamContact: contact,
      summary: {
        totalPatterns: (patterns?.gestures?.length || 0) + (patterns?.sounds?.length || 0) + (patterns?.objects?.length || 0),
        totalInteractions: history.length,
        confirmedInteractions: history.filter(h => h.caregiver_confirmed).length,
      },
      knownGestures: patterns?.gestures?.map(g => ({ gesture: g.gesture, intent: g.intent, timesConfirmed: g.count })),
      knownSounds: patterns?.sounds?.map(s => ({ sound: s.sound, intent: s.intent, timesConfirmed: s.count })),
      knownObjects: patterns?.objects?.map(o => ({ object: o.object, intent: o.intent, timesConfirmed: o.count })),
      professionalNotes: professionalNotes.map(n => ({ note: n.note, date: n.created_at })),
      recentCommunications: history.slice(0, 10).map(h => ({ time: h.time, intent: h.confirmed_intent || h.predicted_intent, confidence: h.confidence })),
      disclaimer: 'SpeakUp is an assistive communication support tool, not a diagnostic tool, medical device, or replacement for qualified care.',
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${child?.name}_speakup_care_report_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!child) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full" /></div>

  const totalPatterns = (patterns?.gestures?.length || 0) + (patterns?.sounds?.length || 0) + (patterns?.objects?.length || 0)
  const confirmedCount = history.filter(h => h.caregiver_confirmed).length

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">Care team workspace</p>
            <h1 className="text-2xl font-bold text-gray-950">{child.name}'s Communication Plan</h1>
            <p className="text-sm text-gray-500">Contact, goals, confirmed patterns, and exportable progress for the demo.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/chat/${childId}`)} className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-black">
            <MessageCircle className="w-4 h-4" /> Ask Gemma
          </button>
          <button onClick={exportReport} className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-amber-900 text-sm">
        <strong>Assistive use only:</strong> SpeakUp supports communication and caregiver observation. It is not a diagnosis, treatment plan, emergency service, or replacement for a speech-language pathologist.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <aside className="space-y-4">
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <UserRound className="w-5 h-5 text-teal-600" />
              <h2 className="font-semibold text-gray-900">Therapist / Care Contact</h2>
            </div>
            <div className="space-y-3">
              <input value={contact.name} onChange={e => setContact(c => ({ ...c, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Dr. Maya Rivera" />
              <input value={contact.role} onChange={e => setContact(c => ({ ...c, role: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Speech-language pathologist" />
              <div className="relative">
                <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input value={contact.organization} onChange={e => setContact(c => ({ ...c, organization: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="BrightPath Communication Clinic" />
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="maya.rivera@example.com" />
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="(555) 014-2218" />
              </div>
              <textarea value={contact.goal} onChange={e => setContact(c => ({ ...c, goal: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                rows={3}
                placeholder="Current goal: increase reliable independent requests using sounds, gestures, cards, and camera context." />
              {savedMsg && <p className="text-green-600 text-sm">{savedMsg}</p>}
              <button onClick={saveContact} disabled={saving} className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-teal-700 disabled:opacity-60">
                <Save className="w-4 h-4" /> Save Contact
              </button>
            </div>
          </section>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Brain, label: 'Patterns', val: totalPatterns },
              { icon: Activity, label: 'Sessions', val: history.length },
              { icon: Zap, label: 'Confirmed', val: confirmedCount },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                <s.icon className="w-5 h-5 text-teal-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{s.val}</div>
                <div className="text-[11px] text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </aside>

        <main>
          <div className="flex flex-wrap gap-2 mb-4">
            {['patterns', 'history', 'notes'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${activeTab === t ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {t === 'patterns' ? 'Known Patterns' : t === 'history' ? 'Session History' : 'Professional Notes'}
              </button>
            ))}
          </div>

          {activeTab === 'patterns' && patterns && (
            <div className="space-y-4">
              {[
                { title: 'Confirmed Gestures', items: patterns.gestures, keyField: 'gesture' },
                { title: 'Confirmed Sounds', items: patterns.sounds, keyField: 'sound' },
                { title: 'Confirmed Objects', items: patterns.objects, keyField: 'object' },
              ].map(section => (
                <section key={section.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-800 mb-3">{section.title} ({section.items?.length || 0})</h3>
                  {section.items?.length > 0 ? (
                    <div className="space-y-2">
                      {section.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="min-w-0">
                            <span className="font-medium text-gray-800">{item[section.keyField]}</span>
                            {item.context && <span className="text-gray-400 text-xs ml-2">(when {item.context})</span>}
                            <p className="text-sm text-teal-700 mt-0.5">"{item.intent}"</p>
                          </div>
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">{item.count}x confirmed</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-gray-400 text-sm">No confirmed patterns yet</p>}
                </section>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="space-y-3">
                {history.length === 0 && <p className="text-gray-400 text-sm">No sessions yet</p>}
                {history.map(h => (
                  <div key={h.id} className="p-3 border border-gray-100 rounded-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 text-sm">{h.confirmed_intent || h.predicted_intent}</p>
                        {h.explanation && <p className="text-xs text-gray-400 mt-0.5 italic">"{h.explanation}"</p>}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {h.gesture && <span className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded">{h.gesture}</span>}
                          {h.sound && <span className="bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded">{h.sound}</span>}
                          {h.object && <span className="bg-amber-50 text-amber-600 text-xs px-2 py-0.5 rounded">{h.object}</span>}
                          {h.card && <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">{h.card}</span>}
                        </div>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full ${h.confidence >= 70 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{h.confidence}%</span>
                        <p className="text-xs text-gray-400 mt-1">{h.time}</p>
                        {h.caregiver_confirmed && <p className="text-xs text-green-600">confirmed</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'notes' && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-teal-600" /> Professional Notes
              </h3>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                rows={4} placeholder="Add therapy goals, observations, sensory preferences, or progress notes. Gemma uses these as private profile context." />
              <button onClick={saveNote} disabled={saving || !note.trim()}
                className="mt-3 bg-teal-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Note'}
              </button>

              <div className="mt-5 space-y-2">
                {professionalNotes.length === 0 && <p className="text-gray-400 text-sm">No professional notes yet</p>}
                {professionalNotes.map(item => (
                  <div key={item.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                    <p className="text-sm text-gray-700">{item.note}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(item.created_at)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
