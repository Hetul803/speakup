import { useState } from 'react'

const CARD_CATEGORIES = {
  'Needs': [
    { id: 'water', label: 'Water', emoji: '💧', color: '#3b82f6' },
    { id: 'food', label: 'Food', emoji: '🍎', color: '#f59e0b' },
    { id: 'bathroom', label: 'Bathroom', emoji: '🚿', color: '#6366f1' },
    { id: 'help', label: 'Help', emoji: '🙏', color: '#ec4899' },
    { id: 'more', label: 'More', emoji: '➕', color: '#10b981' },
    { id: 'stop', label: 'Stop', emoji: '🛑', color: '#ef4444' },
    { id: 'break', label: 'Break', emoji: '⏸️', color: '#8b5cf6' },
    { id: 'pain', label: 'Pain/Hurt', emoji: '😣', color: '#ef4444' },
  ],
  'Feelings': [
    { id: 'happy', label: 'Happy', emoji: '😊', color: '#10b981' },
    { id: 'sad', label: 'Sad', emoji: '😢', color: '#3b82f6' },
    { id: 'angry', label: 'Angry', emoji: '😠', color: '#ef4444' },
    { id: 'scared', label: 'Scared', emoji: '😨', color: '#8b5cf6' },
    { id: 'tired', label: 'Tired', emoji: '😴', color: '#6366f1' },
    { id: 'excited', label: 'Excited', emoji: '🤩', color: '#f59e0b' },
    { id: 'sick', label: 'Sick', emoji: '🤒', color: '#ef4444' },
    { id: 'calm', label: 'Calm', emoji: '😌', color: '#14b8a6' },
  ],
  'Activities': [
    { id: 'play', label: 'Play', emoji: '🎮', color: '#f59e0b' },
    { id: 'music', label: 'Music', emoji: '🎵', color: '#8b5cf6' },
    { id: 'outside', label: 'Outside', emoji: '🌳', color: '#10b981' },
    { id: 'book', label: 'Book', emoji: '📚', color: '#3b82f6' },
    { id: 'tv', label: 'TV/Video', emoji: '📺', color: '#6366f1' },
    { id: 'sleep', label: 'Sleep', emoji: '🛌', color: '#14b8a6' },
    { id: 'draw', label: 'Draw', emoji: '🎨', color: '#ec4899' },
    { id: 'hug', label: 'Hug', emoji: '🤗', color: '#f59e0b' },
  ],
  'People': [
    { id: 'mom', label: 'Mom', emoji: '👩', color: '#ec4899' },
    { id: 'dad', label: 'Dad', emoji: '👨', color: '#3b82f6' },
    { id: 'teacher', label: 'Teacher', emoji: '👩‍🏫', color: '#8b5cf6' },
    { id: 'friend', label: 'Friend', emoji: '👫', color: '#10b981' },
    { id: 'doctor', label: 'Doctor', emoji: '👨‍⚕️', color: '#6366f1' },
    { id: 'grandma', label: 'Grandma', emoji: '👵', color: '#f59e0b' },
  ]
}

export default function VisualCardGrid({ onCardSelect, selectedCard }) {
  const [activeCategory, setActiveCategory] = useState('Needs')

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex gap-1 p-3 border-b border-gray-100 overflow-x-auto">
        {Object.keys(CARD_CATEGORIES).map(cat => (
          <button key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {cat}
          </button>
        ))}
      </div>
      <div className="p-3 grid grid-cols-4 gap-2">
        {CARD_CATEGORIES[activeCategory].map(card => (
          <button key={card.id}
            onClick={() => onCardSelect(selectedCard?.id === card.id ? null : card)}
            className={`card-bounce flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all aspect-square ${selectedCard?.id === card.id ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
            <span className="text-2xl mb-1">{card.emoji}</span>
            <span className="text-xs font-medium text-center text-gray-700 leading-tight">{card.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export { CARD_CATEGORIES }
