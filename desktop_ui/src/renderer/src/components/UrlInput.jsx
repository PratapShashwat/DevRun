import React, { useState, useEffect } from 'react'

export default function UrlInput({ onSubmit, onResume, externalError }) {
  const [url, setUrl] = useState('')
  const [savedEnvs, setSavedEnvs] = useState([])

  useEffect(() => {
    window.api.getSavedEnvironments().then(res => {
      if (res.success) setSavedEnvs(res.data)
    })
  }, [])

  const handleSmartSubmit = (e) => {
    e.preventDefault();

    
    const existingEnv = savedEnvs.find(env => env.github_url === url);

    if (existingEnv) {
      console.log("Existing environment found! Bypassing AI...");
      onResume(existingEnv); 
    } else {
      onSubmit(url); 
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', color: '#ffffff', letterSpacing: '-1px' }}>StackStore</h1>
        <p style={{ fontSize: '1.2rem', color: '#8b949e', margin: 0 }}>Instant AI-Orchestrated Dev Environments</p>
      </div>

      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '30px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
        <form onSubmit={handleSmartSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="url" 
            placeholder="Paste a GitHub Repository URL..." 
            value={url} 
            onChange={e => setUrl(e.target.value)} 
            required
            style={{ flex: 1, padding: '14px', borderRadius: '6px', border: '1px solid #30363d', backgroundColor: '#0d1117', color: '#c9d1d9', fontSize: '1rem', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '0 24px', borderRadius: '6px', border: 'none', backgroundColor: '#238636', color: 'white', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}>
            Initialize
          </button>
        </form>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ color: '#8b949e', fontSize: '0.85rem' }}>Or try a verified demo:</span>
          <button
            onClick={() => setUrl('https://github.com/bradtraversy/mern-tutorial')}
            style={{ padding: '4px 12px', backgroundColor: '#21262d', color: '#58a6ff', border: '1px solid #30363d', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '500' }}
            onMouseOver={(e) => { e.target.style.borderColor = '#58a6ff'; e.target.style.backgroundColor = '#30363d'; }}
            onMouseOut={(e) => { e.target.style.borderColor = '#30363d'; e.target.style.backgroundColor = '#21262d'; }}
          >
            React/Node MERN Stack
          </button>
        </div>
        {externalError && <div style={{ color: '#ff7b72', marginTop: '15px', fontSize: '0.9rem', textAlign: 'center' }}>{externalError}</div>}
      </div>

      {savedEnvs.length > 0 && (
        <div style={{ width: '100%', maxWidth: '600px', marginTop: '30px' }}>
          <h3 style={{ color: '#8b949e', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #30363d', paddingBottom: '10px', marginBottom: '15px' }}>Active Sandboxes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
            {savedEnvs.map((env, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#161b22', border: '1px solid #30363d', padding: '15px 20px', borderRadius: '8px' }}>
                <span style={{ fontWeight: '600', color: '#58a6ff' }}>{env.project_name}</span>
                <button onClick={() => onResume(env)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #30363d', backgroundColor: '#21262d', color: '#c9d1d9', cursor: 'pointer', fontWeight: 'bold' }}>
                  Resume
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}