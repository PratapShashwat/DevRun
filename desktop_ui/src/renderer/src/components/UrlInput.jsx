import { useState, useEffect } from 'react'
import './UrlInput.css'

export default function UrlInput({ onSubmit, onResume, externalError }) {
  const [url, setUrl] = useState('')
  const [localError, setLocalError] = useState('')
  const [savedEnvs, setSavedEnvs] = useState([])

  // Load saved environments when the component mounts
  useEffect(() => {
    const loadEnvs = async () => {
      const response = await window.api.getSavedEnvironments()
      if (response.success) {
        setSavedEnvs(response.data)
      }
    }
    loadEnvs()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!url.includes('github.com/')) {
      setLocalError('Please enter a valid GitHub repository URL.')
      return
    }
    setLocalError('')
    onSubmit(url) 
  }

  const displayError = localError || externalError

  return (
    <div className="url-input-container" style={{ justifyContent: 'flex-start', paddingTop: '10vh' }}>
      
      {/* SECTION 1: Create New */}
      <div className="header">
        <h1>StackStore</h1>
        <p>Instant, AI-generated environments.</p>
      </div>

      <form onSubmit={handleSubmit} className="input-form" style={{ marginBottom: '3rem' }}>
        <input
          type="url"
          className="url-field"
          placeholder="https://github.com/username/repo"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          autoFocus
        />
        <button type="submit" className="submit-btn">
          Analyze Repo
        </button>
      </form>

      {displayError && (
        <div className="error-panel" style={{ marginTop: '-2rem', marginBottom: '2rem' }}>
          <span style={{ marginRight: '8px' }}>⚠️</span> {displayError}
        </div>
      )}

      {/* SECTION 2: Saved Workspaces */}
      {savedEnvs.length > 0 && (
        <div style={{ width: '100%', maxWidth: '600px', borderTop: '1px solid #30363d', paddingTop: '2rem' }}>
          <h3 style={{ color: '#8b949e', marginBottom: '1rem' }}>Saved Workspaces</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {savedEnvs.map((env, index) => (
              <div 
                key={index} 
                style={{ 
                  backgroundColor: '#161b22', 
                  border: '1px solid #30363d', 
                  borderRadius: '8px', 
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'border-color 0.2s'
                }}
              >
                <div>
                  <strong style={{ fontSize: '1.1rem', color: '#c9d1d9' }}>{env.project_name}</strong>
                  <div style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '4px' }}>
                    {env.services?.[0]?.runtime?.language || 'Unknown'} • {env.workspace?.network?.exposed_ports?.length || 0} Ports
                  </div>
                </div>
                
                <button 
                  className="submit-btn" 
                  style={{ backgroundColor: '#21262d', border: '1px solid #30363d', padding: '0.5rem 1rem' }}
                  onClick={() => onResume(env)}
                >
                  ▶ Resume
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}