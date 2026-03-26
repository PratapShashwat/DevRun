import { useState } from 'react'
import './UrlInput.css'

export default function SecretsForm({ stackSpec, onLaunch }) {
  const [formValues, setFormValues] = useState({})
  
  // The new schema just gives us a clean array of keys!
  const missingKeys = stackSpec?.missing_env_keys || []

  const handleInputChange = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const finalSpec = JSON.parse(JSON.stringify(stackSpec))
    
    finalSpec.user_provided_secrets = formValues
    
    onLaunch(finalSpec)
  }

  if (missingKeys.length === 0) {
    return (
      <div className="url-input-container">
        <div className="secrets-layout" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#2ea043', margin: '0 0 1rem 0' }}>Ready to Boot</h2>
          <p style={{ color: '#8b949e', marginBottom: '2rem' }}>No external API keys are required for this repository.</p>
          <button className="submit-btn" onClick={() => onLaunch(stackSpec)}>
            Initialize Docker Sandbox
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="url-input-container">
      <div className="header">
        <h1>Configure Environment</h1>
        <p>This repository requires external connections. Please provide your keys to securely boot the local sandbox.</p>
      </div>

      <div className="secrets-layout">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          <div className="scrollable-form">
            <div className="service-group">
              <div className="service-title">
                <span style={{ fontSize: '1.2rem' }}>🔑</span> Required Environment Variables
              </div>
              
              {missingKeys.map(key => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', marginBottom: '1rem' }}>
                  <label style={{ marginBottom: '0.4rem', fontSize: '0.85rem', color: '#8b949e' }}>
                    {key.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="password"
                    className="url-field"
                    placeholder={`Paste your ${key}`}
                    value={formValues[key] || ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
          
          <button type="submit" className="submit-btn" style={{ width: '100%', padding: '1.2rem' }}>
            Inject Keys & Boot Sandbox
          </button>
        </form>
      </div>
    </div>
  )
}