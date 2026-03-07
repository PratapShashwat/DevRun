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

  const handleDelete = () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this environment and all its files from your hard drive?")
    if (confirmDelete) {
      console.log("Telling Node.js to delete the folder...")
      setCurrentStep('input')
    }
  }

  return (
    <>
      {currentStep === 'input' && <UrlInput onSubmit={handleUrlSubmit} externalError={backendError} />}
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


