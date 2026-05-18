import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { childrenAPI, chatAPI, interactionsAPI } from '../api/client'
import { CARD_CATEGORIES } from '../components/VisualCardGrid'
import {
  ArrowLeft,
  Bot,
  Camera,
  Check,
  Home,
  Loader2,
  LockKeyhole,
  Mic,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Square,
  TabletSmartphone,
  X,
} from 'lucide-react'

const COMMON_CARDS = [
  ...CARD_CATEGORIES.Needs,
  CARD_CATEGORIES.Feelings.find(card => card.id === 'tired'),
  CARD_CATEGORIES.Feelings.find(card => card.id === 'scared'),
  CARD_CATEGORIES.Feelings.find(card => card.id === 'calm'),
  CARD_CATEGORIES.Activities.find(card => card.id === 'music'),
].filter(Boolean)

const QUICK_SIGNALS = ['Soft mmm', 'Humming', 'Crying / whimpering', 'Fast breathing', 'Covering ears']

export default function ChildDevice() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [activeCard, setActiveCard] = useState(null)
  const [result, setResult] = useState(null)
  const [loadingCard, setLoadingCard] = useState(false)
  const [learningMessage, setLearningMessage] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const recorderRef = useRef(null)

  useEffect(() => {
    childrenAPI.get(childId).then(item => {
      setProfile(item)
      setChatMessages([{
        role: 'gemma',
        text: `Hi ${item.name}. I can help say what you mean, or help your caregiver understand your progress.`,
      }])
    }).catch(() => navigate('/parent'))
  }, [childId])

  function speak(text) {
    if (!text || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.92
    window.speechSynthesis.speak(utterance)
  }

  async function chooseCard(card) {
    setActiveCard(card)
    setResult(null)
    setLearningMessage('')
    setLoadingCard(true)
    try {
      const res = await interactionsAPI.predict({
        child_id: parseInt(childId),
        card_selected: card.label,
        gesture_label: null,
        sound_label: null,
        object_detected: null,
        camera_image_b64: null,
        camera_description: null,
      })
      setResult(res)
      speak(res.spoken_phrase || res.intent)
    } catch (e) {
      setResult({ intent: 'Connection error', spoken_phrase: e.message, confidence: 0, needs_confirmation: true })
    } finally {
      setLoadingCard(false)
    }
  }

  async function confirmResult(wasCorrect) {
    if (!result?.interaction_id) return
    if (!wasCorrect) {
      navigate(`/communicate/${childId}`, { state: { fromDevice: true } })
      return
    }
    try {
      const res = await interactionsAPI.confirm(result.interaction_id, result.intent, true)
      setLearningMessage(res.message)
    } catch {
      setLearningMessage(`Saved for ${profile.name}.`)
    }
  }

  async function sendChat(text = chatInput, signal = '') {
    const message = text.trim()
    const signalLabel = signal.trim()
    if (!message && !signalLabel) return
    const outgoing = signalLabel || message
    setChatMessages(prev => [...prev, { role: 'user', text: outgoing }])
    setChatInput('')
    setChatLoading(true)
    try {
      const res = await chatAPI.send({
        child_id: parseInt(childId),
        sender: signalLabel ? 'communicator' : 'caregiver',
        message: message || signalLabel,
        signal_label: signalLabel || null,
        include_progress: true,
      })
      setChatMessages(prev => [...prev, {
        role: 'gemma',
        text: res.reply,
        suggested: res.suggested_phrase,
      }])
      if (res.suggested_phrase) speak(res.suggested_phrase)
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'gemma', text: e.message }])
    } finally {
      setChatLoading(false)
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      recorder.start()
      recorderRef.current = { recorder, stream }
      setRecording(true)
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'gemma', text: `Microphone unavailable: ${e.message}` }])
    }
  }

  function stopRecording() {
    if (!recorderRef.current) return
    recorderRef.current.recorder.stop()
    recorderRef.current.stream.getTracks().forEach(track => track.stop())
    recorderRef.current = null
    setRecording(false)
    sendChat('', 'Recorded vocalization')
  }

  if (!profile) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 relative">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <button onClick={() => navigate('/parent')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm">
          <ArrowLeft className="w-4 h-4" /> Parent Center
        </button>
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-100 px-3 py-1.5 rounded-full text-sm font-semibold self-start lg:self-auto">
          <LockKeyhole className="w-4 h-4" /> Dedicated device mode for {profile.name}
        </div>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-5">
        <main className="quiet-panel border border-white/70 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-3xl text-white flex items-center justify-center text-4xl font-bold shadow-sm" style={{ backgroundColor: profile.avatar_color }}>
                {profile.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-gray-500">This tablet is set up for</p>
                <h1 className="text-4xl font-bold text-gray-950">{profile.name}</h1>
                <p className="text-sm text-gray-600 mt-1">Tap one card. SpeakUp asks Gemma 4 and says the phrase aloud.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/communicate/${profile.id}`, { state: { fromDevice: true, inputSection: 'sound' } })} className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-bold hover:bg-gray-50">
                <Mic className="w-4 h-4" /> Audio
              </button>
              <button onClick={() => navigate(`/communicate/${profile.id}`, { state: { fromDevice: true, inputSection: 'camera' } })} className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-bold hover:bg-gray-50">
                <Camera className="w-4 h-4" /> Camera
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {COMMON_CARDS.map(card => (
              <button
                key={card.id}
                onClick={() => chooseCard(card)}
                disabled={loadingCard}
                className={`card-bounce min-h-[132px] rounded-2xl border-2 bg-white flex flex-col items-center justify-center p-3 text-center shadow-sm transition-all ${
                  activeCard?.id === card.id ? 'border-teal-500 ring-4 ring-teal-100' : 'border-gray-100 hover:border-teal-200'
                }`}
              >
                <span className="text-4xl mb-2">{card.emoji}</span>
                <span className="text-base font-bold text-gray-900 leading-tight">{card.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
            <div className="bg-white/88 border border-gray-100 rounded-2xl p-5 min-h-[150px]">
              {loadingCard ? (
                <div className="h-full flex items-center gap-3 text-teal-700 font-bold">
                  <Loader2 className="w-5 h-5 animate-spin" /> Gemma 4 is checking {profile.name}'s memory...
                </div>
              ) : result ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Spoken phrase</p>
                  <h2 className="text-3xl font-bold text-gray-950 mt-2">{result.spoken_phrase || result.intent}</h2>
                  <p className="text-sm text-gray-600 mt-2">{result.explanation || 'Caregiver can confirm this meaning so SpeakUp learns.'}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button onClick={() => speak(result.spoken_phrase || result.intent)} className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-700">
                      <MessageCircle className="w-4 h-4" /> Say Again
                    </button>
                    <button onClick={() => confirmResult(true)} className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-100">
                      <Check className="w-4 h-4" /> Correct
                    </button>
                    <button onClick={() => confirmResult(false)} className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-100">
                      <X className="w-4 h-4" /> Not right
                    </button>
                  </div>
                  {learningMessage && <p className="mt-3 text-sm font-semibold text-green-700">{learningMessage}</p>}
                </div>
              ) : (
                <div className="h-full flex items-center gap-3 text-gray-500">
                  <Sparkles className="w-5 h-5 text-teal-600" /> Common cards are ready. Optional audio and camera tools are above.
                </div>
              )}
            </div>

            <aside className="bg-white/84 border border-gray-100 rounded-2xl p-4">
              <TabletSmartphone className="w-7 h-7 text-teal-700 mb-2" />
              <h2 className="font-bold text-gray-950">Install this profile</h2>
              <p className="text-sm text-gray-600 mt-1">
                On iPad, open this page in Safari and choose Share, then Add to Home Screen.
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex gap-2 text-sm text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  Separate memory for {profile.name}.
                </div>
                <div className="flex gap-2 text-sm text-gray-600">
                  <Home className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  Parent Center manages every profile.
                </div>
              </div>
            </aside>
          </div>
        </main>

        <aside className="quiet-panel border border-white/70 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[640px]">
          <div className="p-4 border-b border-gray-100 bg-white/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-gray-950">Gemma chat</h2>
                <p className="text-xs text-gray-500">Always available for {profile.name}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gradient-to-b from-gray-50/80 to-white/70">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'gemma' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === 'gemma' ? 'bg-white border border-gray-200 text-gray-800' : 'bg-teal-600 text-white'
                }`}>
                  <p>{msg.text}</p>
                  {msg.suggested && <p className="mt-2 text-xs font-semibold">Suggested: "{msg.suggested}"</p>}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-500">
                <Sparkles className="w-4 h-4 animate-pulse text-teal-600" /> Checking memory...
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_SIGNALS.map(item => (
                <button key={item} onClick={() => sendChat('', item)} className="px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold hover:bg-teal-100">
                  {item}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Ask Gemma or add context..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <button onClick={recording ? stopRecording : startRecording} className={`px-4 rounded-xl text-white ${recording ? 'bg-red-500' : 'bg-gray-800'}`} aria-label={recording ? 'Stop recording' : 'Record audio'}>
                {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button onClick={() => sendChat()} disabled={chatLoading} className="bg-teal-600 text-white px-4 rounded-xl hover:bg-teal-700 disabled:bg-gray-300" aria-label="Send chat">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
