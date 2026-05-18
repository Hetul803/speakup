import { useState } from 'react'
import { Check, X, HelpCircle } from 'lucide-react'

export default function ConfirmationModal({ result, onConfirm, onClose, childName }) {
  const [selected, setSelected] = useState(null)
  const [custom, setCustom] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const allOptions = [
    result.intent,
    ...result.alternatives
  ]

  function handleConfirm(intent, wasCorrect) {
    onConfirm(intent, wasCorrect)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full slide-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-amber-600" />
              </div>
              <span className="font-semibold text-gray-800">Please confirm</span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-600 mb-2 text-sm">I think <strong>{childName}</strong> is trying to say:</p>
          
          <div className="bg-indigo-50 rounded-2xl p-4 mb-4">
            <p className="text-lg font-bold text-indigo-800">"{result.spoken_phrase}"</p>
            <p className="text-sm text-indigo-600 mt-1">Confidence: {Math.round(result.confidence * 100)}%</p>
          </div>

          <p className="text-xs text-gray-500 mb-3 italic">"{result.explanation}"</p>

          <p className="font-medium text-gray-700 mb-3 text-sm">What did they actually mean?</p>

          <div className="space-y-2">
            {allOptions.map((opt, i) => (
              <button key={i}
                onClick={() => handleConfirm(opt, i === 0)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all hover:border-indigo-400 hover:bg-indigo-50 ${i === 0 ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-200'}`}>
                {i === 0 && <span className="text-xs text-indigo-500 block">AI prediction</span>}
                {opt}
              </button>
            ))}
          </div>

          {!showCustom ? (
            <button onClick={() => setShowCustom(true)}
              className="w-full mt-2 text-sm text-gray-500 hover:text-indigo-600 py-2">
              + Something else
            </button>
          ) : (
            <div className="mt-3 flex gap-2">
              <input value={custom} onChange={e => setCustom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && custom.trim() && handleConfirm(custom.trim(), false)}
                placeholder="What did they mean?"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                autoFocus />
              <button onClick={() => custom.trim() && handleConfirm(custom.trim(), false)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
                ✓
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
