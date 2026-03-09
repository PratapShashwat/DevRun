import { useState, useEffect } from 'react'
import './Loader.css'

export default function Loader() {
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
      <h2 className="loader-title">Analyzing Repository</h2>
      <div className="terminal-status">
        <span className="prompt">root@stackstore:~#</span>
        <span className="phrase">{loadingPhrases[phraseIndex]}</span>
        <span className="cursor"></span>
      </div>
    </div>
  )
}