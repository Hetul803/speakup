import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dashboardAPI } from '../api/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ArrowLeft, MessageCircle, Brain, TrendingUp, Star, Trophy, AlertTriangle, Gauge, Layers, Bot, UserRound } from 'lucide-react'

const PIE_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6']

export default function Dashboard() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.get(childId).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [childId])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>
  if (!data) return <div className="text-center py-20 text-gray-400">No data found</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/profiles')} className="text-gray-400 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">Progress intelligence</p>
              <h1 className="text-2xl font-bold text-gray-900">{data.child_name}'s Communication Progress</h1>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-2 sm:ml-8">Confirmed signals, trends, urgency, and caregiver feedback stored privately on this device.</p>
        </div>
        <div className="flex gap-2 sm:flex-shrink-0">
          <button onClick={() => navigate(`/chat/${childId}`)} className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-black">
            <Bot className="w-4 h-4" /> Ask Gemma
          </button>
          <button onClick={() => navigate(`/therapist/${childId}`)} className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-100">
            <UserRound className="w-4 h-4" /> Care Team
          </button>
        </div>
      </div>
      {data.milestones?.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3"><Trophy className="w-5 h-5" /><span className="font-bold">Milestones</span></div>
          <div className="flex flex-wrap gap-2">
            {data.milestones.map((m, i) => (
              <span key={i} className="bg-white/20 px-3 py-1 rounded-full text-sm">🌟 {m}</span>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: MessageCircle, label: 'Total Communications', val: data.total_communications, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { icon: TrendingUp, label: 'This Week', val: data.this_week, color: 'text-green-600', bg: 'bg-green-50' },
          { icon: Brain, label: 'Patterns Learned', val: data.learned_patterns, color: 'text-purple-600', bg: 'bg-purple-50' },
          { icon: Star, label: 'Confirmed Accuracy', val: `${data.accuracy_rate}%`, color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: Gauge, label: 'Avg Confidence', val: `${data.average_confidence || 0}%`, color: 'text-sky-600', bg: 'bg-sky-50' },
          { icon: AlertTriangle, label: 'High Urgency', val: data.high_urgency_count || 0, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Daily Communications (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.daily_trend}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Most Common Needs</h3>
          {data.top_intents?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={data.top_intents} dataKey="count" nameKey="intent" cx="50%" cy="50%" outerRadius={50}>
                    {data.top_intents.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(val, name) => [val, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {data.top_intents.slice(0,5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-gray-700 truncate">{item.intent}</span>
                    </div>
                    <span className="font-medium text-gray-900 ml-2">{item.count}x</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-gray-400 text-sm text-center py-8">Start communicating to see patterns</p>}
        </div>
      </div>

      {data.signal_mix?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" /> Signal Mix
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.signal_mix.map(item => (
              <span key={item.channel} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm capitalize">
                {item.channel}: <strong>{item.count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Communications</h3>
        {data.recent_interactions?.length > 0 ? (
          <div className="space-y-2">
            {data.recent_interactions.map(i => (
              <div key={i.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{i.intent}</p>
                  <p className="text-xs text-gray-400">{i.time}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${i.confidence >= 70 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {i.confidence}%
                  </span>
                  {i.confirmed && <span className="text-green-500 text-xs">✓</span>}
                  {i.urgency === 'high' && <span className="text-red-500 text-xs">urgent</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No communications yet</p>
            <button onClick={() => navigate(`/communicate/${childId}`)} className="mt-3 text-indigo-600 text-sm font-medium">
              Start communicating →
            </button>
          </div>
        )}
      </div>
      <div className="mt-6 text-center">
        <button onClick={() => navigate(`/communicate/${childId}`)}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition-colors">
          Continue Communicating with {data.child_name}
        </button>
      </div>
    </div>
  )
}
