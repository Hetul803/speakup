import { useState } from 'react'

const PRESET_GESTURES = [
  { id: 'pointing', label: 'Pointing at something', emoji: '👆' },
  { id: 'reaching', label: 'Reaching out', emoji: '🤲' },
  { id: 'covers_ears', label: 'Covering ears', emoji: '🙉' },
  { id: 'taps_twice', label: 'Tapping twice', emoji: '✌️' },
  { id: 'waves', label: 'Waving', emoji: '👋' },
  { id: 'shakes_head', label: 'Shaking head (no)', emoji: '🙅' },
  { id: 'nods', label: 'Nodding (yes)', emoji: '🙆' },
  { id: 'claps', label: 'Clapping', emoji: '👏' },
  { id: 'rocks_body', label: 'Rocking body', emoji: '🔄' },
  { id: 'reaches_door', label: 'Reaching toward door', emoji: '🚪' },
  { id: 'custom', label: 'Custom gesture...', emoji: '✍️' },
]

export default function GesturePanel({ onGestureSelect, selectedGesture }) {
  const [customGesture, setCustomGesture] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  function selectGesture(g) {
    if (g.id === 'custom') { setShowCustom(true); return }
    onGestureSelect(selectedGesture?.id === g.id ? null : g)
  }

  function confirmCustom() {
    if (customGesture.trim()) {
      onGestureSelect({ id: 'custom_' + Date.now(), label: customGesture.trim(), emoji: '✍️' })
      setShowCustom(false)
      setCustomGesture('')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-1">
        <span>👋</span> Gesture / Body Signal
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {PRESET_GESTURES.map(g => (
          <button key={g.id}
            onClick={() => selectGesture(g)}
            className={`flex items-center gap-2 p-2 rounded-xl text-left text-sm transition-all border ${selectedGesture?.id === g.id ? 'border-indigo-500 bg-indigo-50 font-medium' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}>
            <span className="text-lg">{g.emoji}</span>
            <span className="text-xs text-gray-700 leading-tight">{g.label}</span>
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="mt-3 flex gap-2">
          <input
            value={customGesture}
            onChange={e => setCustomGesture(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && confirmCustom()}
            placeholder="Describe the gesture..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            autoFocus
          />
          <button onClick={confirmCustom} className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm">Add</button>
        </div>
      )}
    </div>
  )
}
