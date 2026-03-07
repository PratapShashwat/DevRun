import { useState } from 'react'
import './UrlInput.css'

// Notice we added externalError as a prop here
export default function UrlInput({ onSubmit, externalError }) {
  const [url, setUrl] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!url.includes('github.com/')) {
      setLocalError('Please enter a valid GitHub repository URL.')
      return
    }
    
    setLocalError('')
    onSubmit(url) 
  }

  // Determine which error to show (local validation vs backend failure)
  const displayError = localError || externalError

  return (
    <div className="url-input-container">
      <div className="header">
        <h1>StackStore</h1>
        <p>Instant, AI-generated environments.</p>
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="url"
          className="url-field"
          placeholder="https://github.com/username/repo"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button type="submit" className="submit-btn">
          Analyze Repo
        </button>
      </form>

      {/* NEW: Premium In-App Error Display */}
      {displayError && (
        <div className="error-panel">
          <span style={{ marginRight: '8px' }}>⚠️</span> 
          {displayError}
        </div>
      )}
    </div>
  )
}