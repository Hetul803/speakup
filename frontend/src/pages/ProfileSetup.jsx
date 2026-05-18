import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { childrenAPI } from '../api/client'
import { Save, ArrowLeft } from 'lucide-react'

const COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6']

export default function ProfileSetup() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(childId)
  const [form, setForm] = useState({ name: '', age: '', notes: '', avatar_color: '#6366f1' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isEdit) {
      childrenAPI.get(childId).then(c => setForm({ name: c.name, age: c.age || '', notes: c.notes || '', avatar_color: c.avatar_color }))
    }
  }, [childId])

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form, age: form.age ? parseInt(form.age) : null }
      if (isEdit) {
        await childrenAPI.update(childId, payload)
      } else {
        await childrenAPI.create(payload)
      }
      navigate('/')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Profile' : 'New Child Profile'}</h1>

        {/* Avatar Preview */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg" style={{ backgroundColor: form.avatar_color }}>
            {form.name ? form.name[0].toUpperCase() : '?'}
          </div>
        </div>

        {/* Color Picker */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button key={c} onClick={() => setForm(f => ({ ...f, avatar_color: c }))}
                className={`w-8 h-8 rounded-full border-4 transition-all ${form.avatar_color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Child's Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="e.g. Emma" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age (optional)</label>
            <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. 5" min="1" max="18" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes for caregivers (optional)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              rows={3} placeholder="e.g. Loves blocks. Gets overwhelmed by loud sounds. Favorite drink is apple juice." />
          </div>
        </div>

        {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}

        <button onClick={handleSave} disabled={saving}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : isEdit ? 'Update Profile' : 'Create Profile'}
        </button>
      </div>
    </div>
  )
}
