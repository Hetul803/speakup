import { useEffect, useRef, useState, useCallback } from 'react'

export function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)

  useEffect(() => {
    if (active && videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [active])

  const setVideoRef = useCallback((node) => {
    videoRef.current = node
    if (node && streamRef.current && node.srcObject !== streamRef.current) {
      node.srcObject = streamRef.current
      node.play().catch(() => {})
    }
  }, [])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      setActive(true)
      setError(null)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
    } catch (err) { setError('Camera not available: ' + err.message) }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    setActive(false)
  }, [])

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !videoRef.current.videoWidth || !videoRef.current.videoHeight) return null
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(dataUrl)
    return dataUrl
  }, [])

  return { videoRef, setVideoRef, active, error, capturedImage, startCamera, stopCamera, captureFrame, clearCapture: () => setCapturedImage(null) }
}
