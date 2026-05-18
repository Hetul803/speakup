import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CommunicationScreen from './pages/CommunicationScreen'
import Dashboard from './pages/Dashboard'
import ProfileSetup from './pages/ProfileSetup'
import TherapistView from './pages/TherapistView'
import GemmaChat from './pages/GemmaChat'
import ParentCenter from './pages/ParentCenter'
import ChildDevice from './pages/ChildDevice'
import AboutSpeakUp from './pages/AboutSpeakUp'
import Navbar from './components/Navbar'
import FooterDisclaimer from './components/FooterDisclaimer'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen calm-app-bg">
        <Navbar />
        <Routes>
          <Route path="/" element={<AboutSpeakUp />} />
          <Route path="/about" element={<AboutSpeakUp />} />
          <Route path="/profiles" element={<Home />} />
          <Route path="/parent" element={<ParentCenter />} />
          <Route path="/device/:childId" element={<ChildDevice />} />
          <Route path="/communicate/:childId" element={<CommunicationScreen />} />
          <Route path="/chat/:childId" element={<GemmaChat />} />
          <Route path="/dashboard/:childId" element={<Dashboard />} />
          <Route path="/profile/new" element={<ProfileSetup />} />
          <Route path="/profile/:childId/edit" element={<ProfileSetup />} />
          <Route path="/therapist/:childId" element={<TherapistView />} />
        </Routes>
        <FooterDisclaimer />
      </div>
    </BrowserRouter>
  )
}
