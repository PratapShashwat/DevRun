import { useState, useEffect } from 'react'
import './Loader.css'

// 1. Accept the 'message' prop from App.tsx
export default function Loader({ message }) {
  const [phraseIndex, setPhraseIndex] = useState(0)
  
  const loadingPhrases = [
    "Initializing AI orchestration engine...",
    "Cloning repository metadata...",
    "Scanning dependency trees...",
    "Isolating OS-level configurations...",
    "Writing StackSpec v1.0 blueprint..."
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % loadingPhrases.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [loadingPhrases.length])

  return (
    <div className="loader-container">
      <div className="spinner"></div>
      
      {/* 2. Swap the hardcoded text for our dynamic state message */}
      <h2 className="loader-title" style={{ color: '#c9d1d9', marginBottom: '1rem' }}>
        {message || "Analyzing Repository"}
      </h2>
      
      <div className="terminal-status">
        <span className="prompt">root@stackstore:~#</span>
        <span className="phrase">{loadingPhrases[phraseIndex]}</span>
        <span className="cursor"></span>
      </div>
    </div>
  )
}