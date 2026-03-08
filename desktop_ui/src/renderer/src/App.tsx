import Dashboard from './components/Dashboard'
import { useState } from 'react'
import UrlInput from './components/UrlInput'
import Loader from './components/Loader'
import SecretsForm from './components/SecretsForm'

function App() {
  const [currentStep, setCurrentStep] = useState('input') 
  const [stackSpec, setStackSpec] = useState(null)
  
  // NEW: State to hold our backend errors
  const [backendError, setBackendError] = useState('')

  const handleUrlSubmit = async (url) => {
    setBackendError('') // Clear old errors
    setCurrentStep('loading')
    
    try {
      const response = await window.api.analyzeRepo(url)
      
      if (response.success) {
        setStackSpec(response.data)
        setCurrentStep('secrets') 
      } else {
        setBackendError(response.error) // Set the error state instead of alerting!
        setCurrentStep('input')
      }
    } catch (error) {
      setBackendError("Failed to connect to the AI Orchestrator engine.")
      setCurrentStep('input')
    }
  }

  const handleResume = (savedSpec) => {
    console.log("Resuming saved environment:", savedSpec.project_name)
    setStackSpec(savedSpec)
    setCurrentStep('booting') // Go straight to the dashboard!
  }

  const handleLaunch = async (finalSpec) => {
    setCurrentStep('booting')
    
    const response = await window.api.saveFinalSpec(finalSpec)
    if (response.success) {
      console.log("File safely written to disk at:", response.path)
    } else {
      setBackendError("Failed to save the configuration file.")
      setCurrentStep('secrets')
    }
  }

  const handleStop = () => {
    console.log("Sending kill signal to C++ engine...")
    setCurrentStep('input') // Send them back to the start screen
  }

  const handleDelete = async () => {
    const projectName = stackSpec?.project_name || 'unnamed_project'
    
    // We already confirmed in the UI, just run the backend command!
    const response = await window.api.deleteEnvironment(projectName)
    
    if (response.success) {
      console.log("Environment safely wiped from disk.")
      setStackSpec(null)
      setCurrentStep('input') 
    } else {
      setBackendError("Failed to delete the environment files.")
      setCurrentStep('input') // Route the error to our premium error panel
    }
  }

  return (
    <>
      {currentStep === 'input' && (
        <UrlInput 
          onSubmit={handleUrlSubmit} 
          onResume={handleResume} 
          externalError={backendError} 
        />
      )}
      {currentStep === 'loading' && <Loader />}
      {currentStep === 'secrets' && <SecretsForm stackSpec={stackSpec} onLaunch={handleLaunch} />}
      
      {/* NEW DASHBOARD VIEW */}
      {currentStep === 'booting' && (
         <Dashboard 
           stackSpec={stackSpec} 
           onStop={handleStop} 
           onDelete={handleDelete} 
         />
      )}
    </>
  )
}

export default App


