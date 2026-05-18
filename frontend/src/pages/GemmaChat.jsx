import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bot, Mic, Square, Send, UserRound, Sparkles, BarChart2 } from 'lucide-react'
import { childrenAPI, chatAPI } from '../api/client'

const QUICK_PARENT_PROMPTS = [
  'What changed this week?',
  'Summarize the strongest patterns.',
  'What should we practice next?',
]

const QUICK_SIGNALS = [
  'Soft "mmm"',
  'Repeated "ah ah"',
  'Humming',
  'Crying / whimpering',
  'Fast breathing',
]

export default function GemmaChat() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [messages, setMessages] = useState([])
  const [mode, setMode] = useState('caregiver')
  const [input, setInput] = useState('')
  const [signal, setSignal] = useState('')
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const recorderRef = useRef(null)

  useEffect(() => {
    childrenAPI.get(childId).then(setProfile).catch(() => navigate('/'))
  }, [childId])

  useEffect(() => {
    if (profile && messages.length === 0) {
      setMessages([{
        role: 'gemma',
        text: `I can help interpret ${profile.name}'s signals or summarize progress for caregivers. I use confirmed memory from this profile before I answer.`,
        meta: 'local memory + Gemma 4 when loaded'
      }])
    }
  }, [profile, messages.length])

  async function sendMessage(text = input, chosenSignal = signal, sender = mode) {
    const messageText = text.trim()
    const signalText = chosenSignal.trim()
    if (!messageText && !signalText) return

    const outgoing = sender === 'communicator'
      ? signalText || messageText
      : messageText || `Signal: ${signalText}`

    setMessages(prev => [...prev, { role: sender, text: outgoing }])
    setInput('')
    setSignal('')
    setLoading(true)
    try {
      const res = await chatAPI.send({
        child_id: parseInt(childId),
        sender,
        message: messageText || signalText,
        signal_label: signalText || null,
        include_progress: true,
      })
      setMessages(prev => [...prev, {
        role: 'gemma',
        text: res.reply,
        meta: res.model_name,
        memory: res.memory_used,
        suggested: res.suggested_phrase,
      }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'gemma', text: e.message, meta: 'connection error' }])
    } finally {
      setLoading(false)
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      recorder.start()
      recorderRef.current = { recorder, stream }
      setRecording(true)
      setSignal('Recorded vocalization')

      setTimeout(() => {
        if (recorderRef.current) stopRecording()
      }, 5000)
    } catch (e) {
      setMessages(prev => [...prev, { role: 'gemma', text: `Microphone unavailable: ${e.message}` }])
    }
  }

  function stopRecording() {
    if (!recorderRef.current) return
    recorderRef.current.recorder.stop()
    recorderRef.current.stream.getTracks().forEach(track => track.stop())
    recorderRef.current = null
    setRecording(false)
  }

  if (!profile) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-700 p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-11 h-11 rounded-full bg-teal-600 text-white flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-950">Gemma Communication Chat</h1>
            <p className="text-sm text-gray-500">{profile.name}'s memory-aware chat for signals and progress</p>
          </div>
        </div>
        <button onClick={() => navigate(`/dashboard/${childId}`)} className="hidden sm:inline-flex items-center gap-2 text-sm text-teal-700 bg-teal-50 px-3 py-2 rounded-xl hover:bg-teal-100">
          <BarChart2 className="w-4 h-4" /> Progress
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <section className="bg-white border border-gray-200 rounded-2xl min-h-[560px] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'gemma' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === 'gemma' ? 'bg-white border border-gray-200 text-gray-800' : 'bg-teal-600 text-white'
                }`}>
                  <p>{msg.text}</p>
                  {msg.suggested && <p className="mt-2 text-xs font-semibold">Suggested phrase: "{msg.suggested}"</p>}
                  {msg.memory?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.memory.map(item => <span key={item} className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-full">{item}</span>)}
                    </div>
                  )}
                  {msg.meta && <p className="mt-2 text-[11px] opacity-60">{msg.meta}</p>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-500">
                <Sparkles className="w-4 h-4 animate-pulse text-teal-600" /> Gemma is checking memory...
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex flex-wrap gap-2 mb-3">
              <button onClick={() => setMode('communicator')} className={`px-3 py-1.5 rounded-xl text-sm font-medium ${mode === 'communicator' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <UserRound className="w-4 h-4 inline mr-1" /> Communicator
              </button>
              <button onClick={() => setMode('caregiver')} className={`px-3 py-1.5 rounded-xl text-sm font-medium ${mode === 'caregiver' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                Caregiver
              </button>
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={mode === 'caregiver' ? 'Ask for progress, patterns, or next steps...' : 'Optional words or context...'}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <button onClick={recording ? stopRecording : startRecording} className={`px-4 rounded-xl text-white ${recording ? 'bg-red-500' : 'bg-gray-800'}`}>
                {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button onClick={() => sendMessage()} disabled={loading} className="bg-teal-600 text-white px-4 rounded-xl hover:bg-teal-700 disabled:bg-gray-300">
                <Send className="w-4 h-4" />
              </button>
            </div>
            {signal && <p className="mt-2 text-xs text-gray-500">Signal attached: {signal}</p>}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h2 className="font-semibold text-gray-900 mb-2">Caregiver shortcuts</h2>
            <div className="space-y-2">
              {QUICK_PARENT_PROMPTS.map(prompt => (
                <button key={prompt} onClick={() => sendMessage(prompt, '', 'caregiver')} className="w-full text-left px-3 py-2 rounded-xl bg-gray-50 hover:bg-teal-50 text-sm text-gray-700">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h2 className="font-semibold text-gray-900 mb-2">Signal shortcuts</h2>
            <div className="flex flex-wrap gap-2">
              {QUICK_SIGNALS.map(item => (
                <button key={item} onClick={() => { setMode('communicator'); setSignal(item); sendMessage('', item, 'communicator') }} className="px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs hover:bg-teal-100">
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
            Gemma chat is for communication support and progress review. Caregivers still confirm meaning before acting on high-stakes signals.
          </div>
        </aside>
      </div>
    </div>
  )
}
