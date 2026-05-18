import { useEffect, useState } from 'react'
import { useCamera } from '../hooks/useCamera'
import { interactionsAPI } from '../api/client'
import { Camera, CameraOff, Aperture, X, Loader, Sparkles } from 'lucide-react'

const OBJECT_PRESETS = [
  'cup / drink', 'food / snack', 'toy', 'book', 'tablet / phone',
  'door', 'bed / pillow', 'blanket', 'shoes', 'jacket', 'backpack',
  'TV / screen', 'window', 'mom / person', 'dad / person'
]

export default function CameraCapture({ onObjectDetected, onImageCaptured, onAnalysis, selectedObject, childId }) {
  const { videoRef, active, error, capturedImage, startCamera, stopCamera, captureFrame, clearCapture } = useCamera()
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analyzeError, setAnalyzeError] = useState(null)

  useEffect(() => () => stopCamera(), [])

  async function handleCapture() {
    const imgB64 = captureFrame()
    if (!imgB64) return
    const rawB64 = imgB64.split(',')[1]
    onImageCaptured?.(rawB64)
    stopCamera()

    if (!childId) return // no child selected

    setAnalyzing(true)
    setAnalysisResult(null)
    setAnalyzeError(null)
    try {
      const result = await interactionsAPI.describeImage(childId, rawB64)
      setAnalysisResult(result)
      onAnalysis?.(result)
      if (result.object && result.object !== 'unknown') {
        onObjectDetected(result.object)
      }
    } catch (e) {
      setAnalyzeError('Gemma 4 analysis failed — select object manually')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-1">
        <Camera className="w-4 h-4" /> Object in View
        <span className="ml-auto text-xs text-indigo-500 font-normal">Gemma 4 multimodal</span>
      </h3>

      {/* Quick select */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-2">Quick select — or use camera below:</p>
        <div className="flex flex-wrap gap-1">
          {OBJECT_PRESETS.map(obj => (
            <button key={obj}
              onClick={() => onObjectDetected(selectedObject === obj ? null : obj)}
              className={`px-2 py-1 rounded-lg text-xs font-medium border transition-all ${selectedObject === obj ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'}`}>
              {obj}
            </button>
          ))}
        </div>
      </div>

      {/* Camera */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1 mb-2">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <p className="text-xs text-gray-500">Camera → Gemma 4 identifies object automatically</p>
        </div>

        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        {analyzeError && <p className="text-amber-600 text-xs mb-2">{analyzeError}</p>}

        {capturedImage ? (
          <div className="relative mb-2">
            <img src={capturedImage} alt="Captured" className="w-full rounded-xl h-36 object-cover" />
            <button onClick={() => { clearCapture(); setAnalysisResult(null); onObjectDetected(null); onImageCaptured?.(null); onAnalysis?.(null) }}
              className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : active ? (
          <div>
            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl h-36 object-cover bg-black" />
            <div className="flex gap-2 mt-2">
              <button onClick={handleCapture}
                className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-indigo-700">
                <Aperture className="w-4 h-4" /> Capture & Analyze
              </button>
              <button onClick={stopCamera} className="bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-sm">
                <CameraOff className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button onClick={startCamera}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 py-4 rounded-xl text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
            <Camera className="w-4 h-4" /> Start Camera
          </button>
        )}

        {analyzing && (
          <div className="flex items-center gap-2 mt-2 text-indigo-600 text-xs font-medium">
            <Loader className="w-3 h-3 animate-spin" />
            Gemma 4 is analyzing the image...
          </div>
        )}

        {analysisResult && !analyzing && (
          <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs">
            <p className="font-semibold text-indigo-800 mb-1">Gemma 4 detected:</p>
            {analysisResult.object && <p className="text-indigo-700">📍 Object: <strong>{analysisResult.object}</strong></p>}
            {analysisResult.setting && <p className="text-indigo-600 mt-0.5">🏠 Setting: {analysisResult.setting}</p>}
            {analysisResult.scene && <p className="text-gray-500 mt-1 italic">"{analysisResult.scene}"</p>}
          </div>
        )}
      </div>
    </div>
  )
}
