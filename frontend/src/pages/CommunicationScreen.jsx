import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { childrenAPI, interactionsAPI } from '../api/client'
import VisualCardGrid from '../components/VisualCardGrid'
import GesturePanel from '../components/GesturePanel'
import SoundRecorder from '../components/SoundRecorder'
import CameraCapture from '../components/CameraCapture'
import IntentResult from '../components/IntentResult'
import ConfirmationModal from '../components/ConfirmationModal'
import { Sparkles, RotateCcw, ArrowLeft, BarChart2, ChevronDown, ChevronUp, AlertTriangle, Camera, Bot } from 'lucide-react'

export default function CommunicationScreen() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [child, setChild] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedGesture, setSelectedGesture] = useState(null)
  const [selectedSound, setSelectedSound] = useState(null)
  const [selectedObject, setSelectedObject] = useState(null)
  const [cameraImageB64, setCameraImageB64] = useState(null)
  const [cameraAnalysis, setCameraAnalysis] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [currentInteractionId, setCurrentInteractionId] = useState(null)
  const [learningMessage, setLearningMessage] = useState(null)
  const [showInputs, setShowInputs] = useState(true)
  const [inputSection, setInputSection] = useState(location.state?.inputSection || 'cards')
  const resultRef = useRef(null)
  const loadingIntervalRef = useRef(null)

  useEffect(() => {
    childrenAPI.get(childId).then(c => {
      setChild(c)
    }).catch(() => navigate('/parent'))
  }, [childId])

  function goBack() {
    navigate(location.state?.fromDevice ? `/device/${childId}` : '/parent')
  }

  const hasInput = selectedCard || selectedGesture || selectedSound || selectedObject || cameraImageB64

  function startLoadingAnimation(childName) {
    let i = 0
    const msgs = [
      `Reading ${childName}'s signals...`,
      `Checking ${childName}'s memory patterns...`,
      `Gemma 4 is interpreting...`,
      `Almost ready...`,
    ]
    setLoadingMsg(msgs[0])
    loadingIntervalRef.current = setInterval(() => {
      i = (i + 1) % msgs.length
      setLoadingMsg(msgs[i])
    }, 1800)
  }

  function stopLoadingAnimation() {
    clearInterval(loadingIntervalRef.current)
    setLoadingMsg('')
  }

  async function handlePredict(isRetry = false) {
    if (!hasInput) return
    setLoading(true)
    setError(null)
    setResult(null)
    setLearningMessage(null)
    if (!isRetry) setRetryCount(0)
    startLoadingAnimation(child?.name || 'this profile')

    try {
      const payload = {
        child_id: parseInt(childId),
        gesture_label: selectedGesture?.label || null,
        sound_label: selectedSound?.label || null,
        object_detected: selectedObject || null,
        card_selected: selectedCard?.label || null,
        camera_image_b64: cameraImageB64 || null,
        camera_description: cameraAnalysis?.scene || null,
      }
      const res = await interactionsAPI.predict(payload)
      setResult(res)
      setCurrentInteractionId(res.interaction_id)

      if (res.needs_confirmation) {
        setTimeout(() => setShowConfirmation(true), 2000)
      }
      setShowInputs(false)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150)
    } catch (e) {
      setError(e.message)
      setRetryCount(c => c + 1)
    } finally {
      setLoading(false)
      stopLoadingAnimation()
    }
  }

  async function handleAskConfirmation(type, wasCorrect) {
    if (type === 'confirm' && wasCorrect) {
      try {
        const res = await interactionsAPI.confirm(currentInteractionId, result.intent, true)
        setLearningMessage(res.message)
      } catch { setLearningMessage(`Got it! Pattern saved for ${child?.name}.`) }
    } else {
      setShowConfirmation(true)
    }
  }

  async function handleConfirmationSubmit(confirmedIntent, wasCorrect) {
    setShowConfirmation(false)
    try {
      const res = await interactionsAPI.confirm(currentInteractionId, confirmedIntent, wasCorrect)
      setLearningMessage(res.message)
    } catch { setLearningMessage('Pattern saved!') }
  }

  function handleReset() {
    setSelectedCard(null); setSelectedGesture(null)
    setSelectedSound(null); setSelectedObject(null)
    setCameraImageB64(null); setCameraAnalysis(null); setResult(null)
    setError(null); setLearningMessage(null)
    setShowInputs(true); setCurrentInteractionId(null)
    setRetryCount(0)
  }

  if (!child) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  )

  const inputCount = [selectedCard, selectedGesture, selectedSound, selectedObject, cameraImageB64].filter(Boolean).length

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="text-gray-400 hover:text-gray-700 p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: child.avatar_color }}>
            {child.name[0]}
          </div>
          <div>
            <h1 className="font-bold text-gray-900">{child.name}</h1>
            <p className="text-xs text-gray-500">Signals in, spoken phrase out</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/chat/${childId}`)}
            className="flex items-center gap-1 text-sm text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors">
            <Bot className="w-4 h-4" /> Chat
          </button>
          <button onClick={() => navigate(`/dashboard/${childId}`)}
            className="flex items-center gap-1 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-colors">
            <BarChart2 className="w-4 h-4" /> Progress
          </button>
        </div>
      </div>

      <section className="bg-white border border-gray-100 rounded-2xl p-4 mb-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-600 mb-1">Communication moment</p>
        <h2 className="font-bold text-gray-950">Build the current signal set, then let Gemma 4 check memory and speak a likely phrase.</h2>
        <p className="text-sm text-gray-500 mt-1">
          Use visual cards, gestures, sounds, and optional camera context. Camera preview and audio waveform can be hidden for sensory comfort.
        </p>
      </section>
      {inputCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCard && (
            <span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
              {selectedCard.emoji} {selectedCard.label}
              <button onClick={() => setSelectedCard(null)} className="ml-1 hover:text-indigo-900">×</button>
            </span>
          )}
          {selectedGesture && (
            <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
              {selectedGesture.emoji} {selectedGesture.label}
              <button onClick={() => setSelectedGesture(null)} className="ml-1 hover:text-purple-900">×</button>
            </span>
          )}
          {selectedSound && (
            <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
              {selectedSound.emoji} {selectedSound.label}
              <button onClick={() => setSelectedSound(null)} className="ml-1 hover:text-green-900">×</button>
            </span>
          )}
          {selectedObject && (
            <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
              📍 {selectedObject}
              <button onClick={() => setSelectedObject(null)} className="ml-1 hover:text-amber-900">×</button>
            </span>
          )}
          {cameraImageB64 && (
            <span className="bg-sky-100 text-sky-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <Camera className="w-3 h-3" /> frame attached
              <button onClick={() => { setCameraImageB64(null); setCameraAnalysis(null) }} className="ml-1 hover:text-sky-900">×</button>
            </span>
          )}
          <button onClick={handleReset} className="text-gray-400 hover:text-red-400 text-xs px-2 py-1">
            Clear all
          </button>
        </div>
      )}
      {result && (
        <button onClick={() => setShowInputs(v => !v)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-3">
          {showInputs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showInputs ? 'Hide input panel' : 'Add more signals'}
        </button>
      )}
      {showInputs && (
        <div className="space-y-4 mb-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'cards', label: '🃏 Visual Cards' },
              { id: 'gesture', label: '👋 Gesture' },
              { id: 'sound', label: '🔊 Sound' },
              { id: 'camera', label: '📷 Camera' },
            ].map(s => (
              <button key={s.id} onClick={() => setInputSection(s.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${inputSection === s.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                {s.label}
              </button>
            ))}
          </div>

          {inputSection === 'cards' && <VisualCardGrid onCardSelect={setSelectedCard} selectedCard={selectedCard} />}
          {inputSection === 'gesture' && <GesturePanel onGestureSelect={setSelectedGesture} selectedGesture={selectedGesture} />}
          {inputSection === 'sound' && <SoundRecorder onSoundSelect={setSelectedSound} selectedSound={selectedSound} />}
          {inputSection === 'camera' && (
            <CameraCapture
              onObjectDetected={setSelectedObject}
              onImageCaptured={setCameraImageB64}
              onAnalysis={setCameraAnalysis}
              selectedObject={selectedObject}
              childId={parseInt(childId)}
            />
          )}
        </div>
      )}
      <button
        onClick={() => handlePredict(false)}
        disabled={!hasInput || loading}
        className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all ${hasInput && !loading ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 active:scale-98' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span>{loadingMsg || 'Gemma 4 is thinking...'}</span>
          </div>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            {hasInput
              ? `Interpret ${inputCount} signal${inputCount > 1 ? 's' : ''} with Gemma 4`
              : 'Select at least one signal above'}
          </>
        )}
      </button>
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Gemma connection error</p>
              <p className="text-xs mt-1">{error}</p>
              {error.includes('Ollama') && (
                <p className="text-xs mt-1 font-mono bg-red-100 rounded px-2 py-1 mt-2">
                  Run: ollama serve && ollama pull gemma4:e2b-it-q4_K_M
                </p>
              )}
            </div>
          </div>
          {retryCount < 3 && (
            <button onClick={() => handlePredict(true)}
              className="mt-3 w-full bg-red-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-red-700">
              Retry ({retryCount}/3)
            </button>
          )}
        </div>
      )}
      {result && (
        <div className="mt-5" ref={resultRef}>
          <IntentResult
            result={result}
            onAskConfirmation={handleAskConfirmation}
            autoSpeak={true}
          />
        </div>
      )}
      {learningMessage && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm font-medium slide-up flex items-center gap-2">
          🧠 {learningMessage}
        </div>
      )}
      {result && (
        <button onClick={handleReset}
          className="w-full mt-4 flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 py-3 rounded-2xl text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors font-medium">
          <RotateCcw className="w-4 h-4" /> New Communication
        </button>
      )}

      {showConfirmation && result && (
        <ConfirmationModal
          result={result}
          childName={child.name}
          onConfirm={handleConfirmationSubmit}
          onClose={() => setShowConfirmation(false)}
        />
      )}
    </div>
  )
}
