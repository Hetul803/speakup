import { useCallback, useState } from 'react'

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const speak = useCallback((text, options = {}) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = options.rate || 0.88
    utterance.pitch = options.pitch || 1.1
    utterance.volume = 1
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.name.includes('Samantha') || (v.lang.startsWith('en') && v.name.toLowerCase().includes('female')))
    if (preferred) utterance.voice = preferred
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])
  const stop = useCallback(() => { window.speechSynthesis.cancel(); setSpeaking(false) }, [])
  return { speak, stop, speaking }
}
