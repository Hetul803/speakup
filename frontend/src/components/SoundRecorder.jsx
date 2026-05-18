import { useState, useRef } from 'react'
import { Mic, MicOff, Square } from 'lucide-react'

const PRESET_SOUNDS = [
  { id: 'soft_mmm', label: 'Soft "mmm"', emoji: '🎵' },
  { id: 'ah_ah', label: 'Repeated "ah ah"', emoji: '🔊' },
  { id: 'humming', label: 'Humming', emoji: '🎶' },
  { id: 'crying', label: 'Crying / whimpering', emoji: '😢' },
  { id: 'laughing', label: 'Laughing', emoji: '😄' },
  { id: 'screaming', label: 'Screaming / distress', emoji: '😱' },
  { id: 'grunt', label: 'Grunt / effort sound', emoji: '💪' },
  { id: 'babbling', label: 'Babbling', emoji: '💬' },
  { id: 'breath_fast', label: 'Fast breathing', emoji: '😤' },
  { id: 'custom', label: 'Other sound...', emoji: '🎙️' },
]

export default function SoundRecorder({ onSoundSelect, selectedSound }) {
  const [recording, setRecording] = useState(false)
  const [customSound, setCustomSound] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [waveform, setWaveform] = useState([])
  const mediaRecorderRef = useRef(null)
  const animFrameRef = useRef(null)
  const analyserRef = useRef(null)

  function selectSound(s) {
    if (s.id === 'custom') { setShowCustom(true); return }
    onSoundSelect(selectedSound?.id === s.id ? null : s)
  }

  function confirmCustom() {
    if (customSound.trim()) {
      onSoundSelect({ id: 'custom_' + Date.now(), label: customSound.trim(), emoji: '🎙️' })
      setShowCustom(false); setCustomSound('')
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      analyserRef.current = analyser

      // Animate waveform
      function drawWave() {
        const buf = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(buf)
        const bars = Array.from(buf.slice(0, 12)).map(v => Math.max(4, v / 4))
        setWaveform(bars)
        animFrameRef.current = requestAnimationFrame(drawWave)
      }
      drawWave()

      const mr = new MediaRecorder(stream)
      mr.start()
      mediaRecorderRef.current = { recorder: mr, stream, audioCtx }
      setRecording(true)

      // Auto-stop after 5 seconds
      setTimeout(() => { if (mediaRecorderRef.current) stopRecording() }, 5000)
    } catch (e) {
      alert('Microphone not available: ' + e.message)
    }
  }

  function stopRecording() {
    if (!mediaRecorderRef.current) return
    const { recorder, stream, audioCtx } = mediaRecorderRef.current
    recorder.stop()
    stream.getTracks().forEach(t => t.stop())
    audioCtx.close()
    cancelAnimationFrame(animFrameRef.current)
    mediaRecorderRef.current = null
    setRecording(false)
    setWaveform([])
    // After recording, show sound label picker
    setShowCustom(true)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-1">
        <span>🔊</span> Vocalization / Sound
      </h3>

      {/* Preset sounds */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {PRESET_SOUNDS.map(s => (
          <button key={s.id}
            onClick={() => selectSound(s)}
            className={`flex items-center gap-2 p-2 rounded-xl text-left text-sm transition-all border ${selectedSound?.id === s.id ? 'border-indigo-500 bg-indigo-50 font-medium' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}>
            <span className="text-lg">{s.emoji}</span>
            <span className="text-xs text-gray-700 leading-tight">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Live recorder */}
      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-500 mb-2">Or record the sound directly:</p>
        {recording ? (
          <div>
            <div className="flex items-end gap-0.5 h-8 justify-center mb-2">
              {waveform.map((h, i) => (
                <div key={i} className="w-2 bg-indigo-500 rounded-full transition-all"
                  style={{ height: `${h}px` }} />
              ))}
              {waveform.length === 0 && <div className="text-xs text-gray-400">Listening...</div>}
            </div>
            <button onClick={stopRecording}
              className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-red-600">
              <Square className="w-3 h-3" /> Stop recording
            </button>
            <p className="text-xs text-gray-400 text-center mt-1">Auto-stops in 5 seconds</p>
          </div>
        ) : (
          <button onClick={startRecording}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 py-3 rounded-xl text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600">
            <Mic className="w-4 h-4" /> Record sound
          </button>
        )}
      </div>

      {showCustom && (
        <div className="mt-3">
          <p className="text-xs text-gray-600 mb-1">What sound did you record / hear?</p>
          <div className="flex gap-2">
            <input value={customSound} onChange={e => setCustomSound(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmCustom()}
              placeholder="e.g. high-pitched whine, clicking sound..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              autoFocus />
            <button onClick={confirmCustom} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm">Add</button>
          </div>
        </div>
      )}
    </div>
  )
}
