import Dashboard from './components/Dashboard'
import { useState } from 'react'
import UrlInput from './components/UrlInput'
import Loader from './components/Loader'
import SecretsForm from './components/SecretsForm'

function App() {
  const [currentStep, setCurrentStep] = useState('input') 
  const [stackSpec, setStackSpec] = useState(null)
  
  const [backendError, setBackendError] = useState('')

  const handleUrlSubmit = async (url) => {
    setBackendError('') 
    setCurrentStep('loading')
    
    try {
      const response = await window.api.analyzeRepo(url)
      
      if (response.success) {
        setStackSpec(response.data)
        setCurrentStep('secrets') 
      } else {
        setBackendError(response.error) 
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
    setCurrentStep('booting') 
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
    setCurrentStep('input') 
  }

  const handleDelete = async () => {
    const projectName = stackSpec?.project_name || 'unnamed_project'
    
    const response = await window.api.deleteEnvironment(projectName)
    
    if (response.success) {
      console.log("Environment safely wiped from disk.")
      setStackSpec(null)
      setCurrentStep('input') 
    } else {
      setBackendError("Failed to delete the environment files.")
      setCurrentStep('input') 
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


