import { useNavigate } from 'react-router-dom'
import {
  Accessibility,
  ArrowLeft,
  Brain,
  CheckCircle2,
  HeartPulse,
  LifeBuoy,
  LockKeyhole,
  Mic,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Volume2,
} from 'lucide-react'

const AUDIENCES = [
  {
    icon: Brain,
    title: 'Autistic and neurodivergent communicators',
    text: 'For people whose sounds, routines, sensory needs, gestures, or AAC choices carry meaning before words arrive.',
  },
  {
    icon: Accessibility,
    title: 'AAC users and nonspeaking people',
    text: 'For children, teens, and adults who communicate through pointing, cards, expressions, devices, or partner interpretation.',
  },
  {
    icon: HeartPulse,
    title: 'Aphasia, apraxia, motor speech, and medical needs',
    text: 'For speech that is unreliable because of stroke recovery, motor planning, cerebral palsy, fatigue, injury, or care routines.',
  },
  {
    icon: LifeBuoy,
    title: 'Parents, caregivers, teachers, and therapists',
    text: 'For support teams that need clearer logs, safer handoffs, and one shared memory of what each signal usually means.',
  },
]

const STEPS = [
  { icon: Mic, title: 'Capture signals', text: 'Sound, gesture, selected cards, camera context, routine, and caregiver notes.' },
  { icon: Sparkles, title: 'Ask Gemma 4', text: 'Gemma checks the selected profile history and suggests a plain-language intent.' },
  { icon: Volume2, title: 'Speak the phrase', text: 'The app reads the likely phrase aloud so the communicator can be understood faster.' },
  { icon: CheckCircle2, title: 'Confirm and learn', text: 'Caregivers confirm or correct meaning so the next similar moment is easier.' },
]

export default function AboutSpeakUp() {
  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 relative">
      <button onClick={() => navigate('/profiles')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to profiles
      </button>

      <section className="quiet-panel border border-white/70 rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 text-teal-800 font-semibold text-sm mb-4 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4" /> SpeakUp explained
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-950 leading-tight">
            SpeakUp helps people who cannot always rely on speech turn personal signals into words.
          </h1>
          <p className="text-gray-700 mt-5 text-lg max-w-3xl">
            SpeakUp supports autistic and neurodivergent communicators, nonspeaking and minimally speaking people, AAC users, people with aphasia or apraxia, and families or care teams who need a clearer way to understand everyday signals.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            <button onClick={() => navigate('/profiles')} className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-700">
              View Profiles
            </button>
            <button onClick={() => navigate('/parent')} className="bg-white border border-teal-100 text-teal-800 px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-50">
              Open Parent Center
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {AUDIENCES.map(item => (
          <article key={item.title} className="quiet-panel border border-white/70 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-950">{item.title}</h2>
                <p className="text-gray-600 mt-2 leading-relaxed">{item.text}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        <div className="quiet-panel border border-white/70 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">How it works</p>
          <h2 className="text-2xl font-bold text-gray-950 mt-1">A caregiver-confirmed loop, not a black box.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            {STEPS.map(step => (
              <div key={step.title} className="bg-white/88 border border-gray-100 rounded-xl p-4">
                <step.icon className="w-5 h-5 text-teal-700 mb-3" />
                <h3 className="font-bold text-gray-950">{step.title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-teal-900 text-white rounded-2xl p-5 shadow-sm">
            <Users className="w-8 h-8 text-teal-100 mb-3" />
            <h2 className="text-xl font-bold">For families with more than one communicator</h2>
            <p className="text-sm text-teal-100 mt-2 leading-relaxed">
              Parent Center keeps profiles separate, while each dedicated device link opens only one communicator's tools.
            </p>
            <button onClick={() => navigate('/parent')} className="mt-4 bg-white text-teal-950 px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-50">
              Open Parent Center
            </button>
          </div>

          <div className="bg-white/88 border border-gray-100 rounded-2xl p-5 shadow-sm">
            <Stethoscope className="w-7 h-7 text-violet-700 mb-3" />
            <h2 className="font-bold text-gray-950">What SpeakUp is not</h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              SpeakUp does not diagnose autism, replace therapy, make emergency medical decisions, or claim a prediction is true without caregiver review.
            </p>
          </div>

          <div className="bg-white/88 border border-gray-100 rounded-2xl p-5 shadow-sm">
            <LockKeyhole className="w-7 h-7 text-amber-700 mb-3" />
            <h2 className="font-bold text-gray-950">Privacy promise</h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              The app is designed around local Gemma 4 inference, local SQLite memory, synthetic demo data, and profile-level exports controlled by the caregiver.
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}
