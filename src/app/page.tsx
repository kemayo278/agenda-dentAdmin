"use client"

import { useState, useEffect } from "react"
import AppointmentsList from "@/components/Appointment/List/AppointmentList"
import ConfigPage from "@/components/Config/ConfigPage"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Vérifier si une configuration existe déjà
    const checkConfig = async () => {
      const savedConfig = localStorage.getItem('db-config')
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig)
          
          // Tester la connexion avec la configuration sauvegardée
          const response = await fetch('/api/test-connection', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
          })
          
          const result = await response.json()
          
          if (response.ok && result.success) {
            setIsConfigured(true)
          }
        } catch (err) {
          console.error('Erreur lors de la vérification de la configuration:', err)
        }
      }
      setIsLoading(false)
    }
    
    checkConfig()
  }, [])

  const handleConfigured = () => {
    setIsConfigured(true)
  }

  const handleReconfigure = () => {
    setIsConfigured(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Vérification de la configuration...</p>
        </div>
      </div>
    )
  }

  if (!isConfigured) {
    return <ConfigPage onConfigured={handleConfigured} />
  }

  return <AppointmentsList onReconfigure={handleReconfigure} />
}
