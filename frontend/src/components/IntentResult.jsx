import { useEffect } from 'react'
import { Volume2, VolumeX, AlertTriangle, CheckCircle, Cpu, Camera, Layers } from 'lucide-react'
import { useSpeech } from '../hooks/useSpeech'

const EMOTION_COLORS = {
  neutral: 'from-indigo-500 to-purple-600',
  happy: 'from-green-400 to-emerald-600',
  distressed: 'from-red-400 to-rose-600',
  frustrated: 'from-orange-400 to-red-500',
  excited: 'from-yellow-400 to-orange-500',
  tired: 'from-blue-400 to-indigo-600',
  scared: 'from-purple-400 to-violet-600',
}

export default function IntentResult({ result, onAskConfirmation, autoSpeak = true }) {
  const { speak, stop, speaking } = useSpeech()

  useEffect(() => {
    if (result && autoSpeak) {
      setTimeout(() => speak(result.spoken_phrase), 300)
    }
  }, [result])

  if (!result) return null

  const gradient = EMOTION_COLORS[result.emotion_detected] || EMOTION_COLORS.neutral
  const isHighConfidence = result.confidence >= 0.7
  const isUrgent = result.urgency === 'high'
  const channels = result.input_channels || []

  return (
    <div className={`speak-glow rounded-3xl bg-gradient-to-br ${gradient} p-6 text-white slide-up`}>
      {isUrgent && (
        <div className="flex items-center gap-2 bg-red-500/30 rounded-xl px-3 py-2 mb-3 text-sm font-medium">
          <AlertTriangle className="w-4 h-4" /> May need immediate attention
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">
            {result.emotion_detected !== 'neutral' ? `Feeling ${result.emotion_detected}` : 'Communication'}
          </p>
          <h2 className="text-2xl font-bold leading-tight">{result.spoken_phrase}</h2>
        </div>
        <button
          onClick={() => speaking ? stop() : speak(result.spoken_phrase)}
          className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl transition-colors ml-3 flex-shrink-0">
          {speaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {(channels.length > 0 || result.model_name) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/80">
          {result.model_name && (
            <span className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-full">
              <Cpu className="w-3 h-3" /> {result.model_name}
            </span>
          )}
          {channels.map(channel => (
            <span key={channel} className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-full capitalize">
              {channel === 'camera' ? <Camera className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
              {channel}
            </span>
          ))}
        </div>
      )}

      {/* Confidence bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-white/70 mb-1">
          <span>Confidence</span>
          <span>{Math.round(result.confidence * 100)}%</span>
        </div>
        <div className="bg-white/20 rounded-full h-2">
          <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${result.confidence * 100}%` }} />
        </div>
      </div>

      {/* Explanation */}
      <p className="mt-3 text-white/80 text-xs italic">"{result.explanation}"</p>

      {result.image_analysis?.scene && (
        <p className="mt-2 text-white/70 text-xs">
          Camera scene: {result.image_analysis.scene}
        </p>
      )}

      {/* Alternatives */}
      {result.alternatives?.length > 0 && (
        <div className="mt-4">
          <p className="text-white/60 text-xs mb-2">Could also mean:</p>
          <div className="flex flex-wrap gap-2">
            {result.alternatives.map((alt, i) => (
              <span key={i} className="bg-white/15 px-3 py-1 rounded-full text-xs">{alt}</span>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation prompt */}
      <div className="mt-4 flex gap-2">
        <button onClick={() => onAskConfirmation('confirm', true)}
          className="flex-1 flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 py-2 rounded-xl text-sm font-medium transition-colors">
          <CheckCircle className="w-4 h-4" /> That's right
        </button>
        <button onClick={() => onAskConfirmation('correct', false)}
          className="flex-1 flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 py-2 rounded-xl text-sm font-medium transition-colors">
          Not quite
        </button>
      </div>
    </div>
  )
}
