import React, { useState } from 'react'

export default function Dashboard({ stackSpec, onStop, onDelete, isUpdating }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const projectName = stackSpec?.project_name || "Unknown Project"
  const safeProjectName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '')

  return (
    <div style={{ width: '100%', backgroundColor: '#161b22', borderBottom: `2px solid ${isUpdating ? '#d29922' : '#2ea043'}`, transition: 'border-color 0.3s' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px' }}>
        
        <div>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', color: '#ffffff' }}>{projectName}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ backgroundColor: isUpdating ? 'rgba(210, 153, 34, 0.15)' : 'rgba(35, 134, 54, 0.15)', color: isUpdating ? '#d29922' : '#3fb950', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', border: `1px solid ${isUpdating ? '#d29922' : '#2ea043'}` }}>
              {isUpdating ? '🟡 UPDATING INFRASTRUCTURE' : '🟢 CONTAINER LIVE'}
            </span>
            <span style={{ color: '#8b949e', fontSize: '0.85rem', fontFamily: 'monospace' }}>devrun-{safeProjectName}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => window.api.openIde(projectName)} disabled={isUpdating} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #30363d', backgroundColor: '#21262d', color: '#58a6ff', cursor: isUpdating ? 'wait' : 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25H1.75zM0 2.75C0 1.784.784 1 1.75 1h12.5C15.216 1 16 1.784 16 2.75v10.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25V2.75zm7.25 5a.75.75 0 0 1 .22.53v.004a.75.75 0 0 1-.22.526l-2.5 2.5a.75.75 0 0 1-1.06-1.06l1.97-1.97-1.97-1.97a.75.75 0 1 1 1.06-1.06l2.5 2.5zm1.5 3.25a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75z"/></svg>
            Open in VS Code
          </button>
          
          <button onClick={onStop} disabled={isUpdating} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #30363d', backgroundColor: '#0d1117', color: '#c9d1d9', cursor: isUpdating ? 'wait' : 'pointer' }}>
            Close
          </button>
          
          <button onClick={() => setShowDeleteConfirm(true)} disabled={isUpdating} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #f85149', backgroundColor: 'transparent', color: '#f85149', cursor: isUpdating ? 'wait' : 'pointer' }}>
            Destroy
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', borderTop: '1px solid #f85149', padding: '12px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#ff7b72', fontSize: '0.9rem' }}><strong>Warning:</strong> This permanently deletes all local files and terminates the container.</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #30363d', backgroundColor: '#21262d', color: '#c9d1d9', cursor: 'pointer' }}>Cancel</button>
            <button onClick={onDelete} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', backgroundColor: '#da3633', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Confirm Destroy</button>
          </div>
        </div>
      )}
    </div>
  )
}