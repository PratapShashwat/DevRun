import Dashboard from './components/Dashboard'
import { useState } from 'react'
import UrlInput from './components/UrlInput'
import Loader from './components/Loader'
import SecretsForm from './components/SecretsForm'
import TerminalPanel from './components/TerminalPanel'

function App() {
  const [currentStep, setCurrentStep] = useState('input') 
  const [stackSpec, setStackSpec] = useState(null)
  const [chatInput, setChatInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [backendError, setBackendError] = useState('')
  const [loadingText, setLoadingText] = useState('Analyzing repository...') 

  const handleUrlSubmit = async (url) => {
    setBackendError('') 
    setLoadingText('Analyzing repository structure...')
    setCurrentStep('loading')
    
    try {
      const response = await window.api.analyzeRepo(url)
      
      if (response.success) {
        const spec = response.data;
        spec.github_url = url; 
        setStackSpec(spec)
        
        if (spec.missing_env_keys && spec.missing_env_keys.length > 0) {
          setCurrentStep('secrets') 
        } else {
          handleLaunch(spec)
        }
      } else {
        setBackendError(response.error || "Network Error: Failed to analyze repository.") 
        setCurrentStep('input')
      }
    } catch (error) {
      setBackendError("Failed to connect to the AI Orchestrator engine.")
      setCurrentStep('input')
    }
  }

  const handleResume = async (env) => {
    setLoadingText('Waking up secure sandbox...')
    setCurrentStep('loading')
    
  
    const response = await window.api.wakeContainer(env.project_name)
    
    if (response.success) {
      
      setStackSpec(env)
      setCurrentStep('booting') 
    } else {
      console.log("[SYSTEM] Container missing. Forcing fresh rebuild...")
      setBackendError("Previous container was lost. Rebuilding fresh environment...")
      
      handleUrlSubmit(env.github_url)
    }
  }

  const handleLaunch = async (finalSpec) => {
    finalSpec.missing_env_keys = []; 
    
    setLoadingText('Building Docker image... (This may take a minute)')
    setCurrentStep('loading') 
    
    const response = await window.api.saveFinalSpec(finalSpec)
    if (response.success) {
      setStackSpec({ ...finalSpec, project_path: response.path })
      setCurrentStep('booting') 
    } else {
      
      setBackendError(response.error || "Docker failed to build the container.")
      setCurrentStep('input')
    }
  }

  const handleStop = () => {
    setStackSpec(null)
    setChatInput('')
    setIsUpdating(false)
    setBackendError('')
    setCurrentStep('input') 
  }

  const handleDelete = async () => {
    const projectName = stackSpec?.project_name || 'unnamed_project'
    await window.api.deleteEnvironment(projectName)
    setStackSpec(null)
    setChatInput('')
    setIsUpdating(false)
    setBackendError('')
    setCurrentStep('input') 
  }

  const handleModify = async () => {
    if (!chatInput.trim()) return; 
    setIsUpdating(true);
    try {
        const updatedSpec = await window.api.modifyEnvironment({
            specPath: stackSpec.project_path,
            projectName: stackSpec.project_name, 
            userPrompt: chatInput
        });
        
        setStackSpec({ ...updatedSpec, project_path: stackSpec.project_path });
        setChatInput('');

        const requiresNewSecrets = updatedSpec.missing_env_keys && updatedSpec.missing_env_keys.length > 0;
        
        if (requiresNewSecrets) {
            setCurrentStep('secrets'); 
        } else {
            handleLaunch(updatedSpec);
        }
    } catch (error) {
        console.error("Update failed", error);
    }
    setIsUpdating(false);
  };

  return (
    <>
      {currentStep === 'input' && (
        <UrlInput key={currentStep} onSubmit={handleUrlSubmit} onResume={handleResume} externalError={backendError} />
      )}
      {currentStep === 'loading' && <Loader message={loadingText} />}
      {currentStep === 'secrets' && <SecretsForm stackSpec={stackSpec} onLaunch={handleLaunch} />}
      
      {currentStep === 'booting' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: '#0d1117' }}>
          
          {/* SECTION 1: Top Dashboard Bar */}
          <div style={{ flexShrink: 0 }}>
            <Dashboard stackSpec={stackSpec} onStop={handleStop} onDelete={handleDelete} isUpdating={isUpdating} />
          </div>

          {/* SECTION 2: Chat Modifier (Centered in the middle space) */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '800px', backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#c9d1d9', fontSize: '1rem' }}>AI Infrastructure Modifier</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="e.g., Swap the Node version to 18..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isUpdating}
                  style={{ flexGrow: 1, padding: '12px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: '#c9d1d9', outline: 'none' }}
                />
                <button 
                  onClick={handleModify} 
                  disabled={isUpdating} 
                  style={{ padding: '0 24px', borderRadius: '6px', cursor: isUpdating ? 'wait' : 'pointer', background: '#238636', color: 'white', border: 'none', fontWeight: 'bold' }}
                >
                  {isUpdating ? 'Rebuilding...' : 'Update Stack'}
                </button>
              </div>
            </div>
          </div>
          
          {/* SECTION 3: The Terminal (Locked to the bottom) */}
          <div style={{ height: '350px', flexShrink: 0, borderTop: '1px solid #30363d', backgroundColor: '#1e1e1e' }}>
            <TerminalPanel projectName={stackSpec.project_name} />
          </div>

        </div>
      )}
    </>
  )
}

export default App