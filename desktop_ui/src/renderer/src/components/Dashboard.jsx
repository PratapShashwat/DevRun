import React from 'react'
import './UrlInput.css'

export default function Dashboard({ stackSpec, onStop, onDelete }) {
  // Extract project info safely
  const projectName = stackSpec?.project_name || "Unknown Project"
  const ports = stackSpec?.workspace?.network?.exposed_ports || []

  return (
    <div className="url-input-container">
      <div className="header" style={{ marginBottom: '1rem' }}>
        <h1>Control Panel</h1>
        <p>Your isolated environment is running.</p>
      </div>

      <div className="secrets-layout" style={{ maxWidth: '700px', borderTop: '4px solid #2ea043' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #30363d', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, color: '#c9d1d9' }}>{projectName}</h2>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <span style={{ backgroundColor: '#238636', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                🟢 RUNNING
              </span>
              <span style={{ color: '#8b949e', fontSize: '0.85rem' }}>
                OS-Level Sandbox Active
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {ports.map(port => (
              <div key={port} style={{ color: '#58a6ff', fontSize: '0.9rem', marginBottom: '4px' }}>
                localhost:{port}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className="submit-btn" 
            style={{ flex: 1, backgroundColor: '#21262d', border: '1px solid #30363d' }}
            onClick={() => alert("This would open VS Code pointing to the bind-mount folder!")}
          >
            🧑‍💻 Open in IDE
          </button>
          
          <button 
            className="submit-btn" 
            style={{ flex: 1, backgroundColor: '#8b949e', color: '#0d1117' }}
            onClick={onStop}
          >
            ⏸️ Stop Engine
          </button>
          
          <button 
            className="submit-btn" 
            style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid #f85149', color: '#f85149' }}
            onClick={onDelete}
          >
            🗑️ Delete Files
          </button>
        </div>
      </div>
    </div>
  )
}