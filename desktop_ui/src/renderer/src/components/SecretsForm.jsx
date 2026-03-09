import { useState, useEffect } from 'react'
import './UrlInput.css'

export default function SecretsForm({ stackSpec, onLaunch }) {
  const [groupedSecrets, setGroupedSecrets] = useState({})
  const [formValues, setFormValues] = useState({})

  useEffect(() => {
    const groups = {}
    
    stackSpec.services.forEach(service => {
      const missingKeys = []
      if (service.env_vars) {
        Object.entries(service.env_vars).forEach(([key, value]) => {
          if (value === '<REQUIRED_USER_INPUT>') {
            missingKeys.push(key)
          }
        })
      }
      if (missingKeys.length > 0) {
        groups[service.service_name] = missingKeys
      }
    })
    
    setGroupedSecrets(groups)
  }, [stackSpec])

  const handleInputChange = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const finalSpec = JSON.parse(JSON.stringify(stackSpec))
    
    finalSpec.services.forEach(service => {
      if (service.env_vars) {
        Object.keys(service.env_vars).forEach(key => {
          if (service.env_vars[key] === '<REQUIRED_USER_INPUT>') {
            service.env_vars[key] = formValues[key] || ''
          }
        })
      }
    })

    onLaunch(finalSpec)
  }

  if (Object.keys(groupedSecrets).length === 0) {
    return (
      <div className="url-input-container">
        <div className="secrets-layout" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#2ea043', margin: '0 0 1rem 0' }}>Ready to Boot</h2>
          <p style={{ color: '#8b949e', marginBottom: '2rem' }}>No external API keys are required for this repository.</p>
          <button className="submit-btn" onClick={() => onLaunch(stackSpec)}>
            Initialize Environment
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
            {Object.entries(groupedSecrets).map(([serviceName, keys]) => (
              <div key={serviceName} className="service-group">
                <div className="service-title">
                  <span style={{ fontSize: '1.2rem' }}>⚙️</span> {serviceName} Configuration
                </div>
                
                {keys.map(key => (
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
            ))}
          </div>
          
          <button type="submit" className="submit-btn" style={{ width: '100%', padding: '1.2rem' }}>
            Inject Keys & Boot Sandbox
          </button>
        </form>
      </div>
    </div>
  )
}