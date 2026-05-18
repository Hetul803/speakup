import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CommunicationScreen from './pages/CommunicationScreen'
import Dashboard from './pages/Dashboard'
import ProfileSetup from './pages/ProfileSetup'
import TherapistView from './pages/TherapistView'
import GemmaChat from './pages/GemmaChat'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f6f8f7]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/communicate/:childId" element={<CommunicationScreen />} />
          <Route path="/chat/:childId" element={<GemmaChat />} />
          <Route path="/dashboard/:childId" element={<Dashboard />} />
          <Route path="/profile/new" element={<ProfileSetup />} />
          <Route path="/profile/:childId/edit" element={<ProfileSetup />} />
          <Route path="/therapist/:childId" element={<TherapistView />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
