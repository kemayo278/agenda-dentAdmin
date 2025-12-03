"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Settings, CheckCircle, XCircle, Eye, EyeOff, Loader2 } from "lucide-react"

interface DatabaseConfig {
  user: string
  password: string
  server: string
  database: string
  port: number
  trustServerCertificate: boolean
  encrypt: boolean
}

interface ConfigPageProps {
  onConfigured: () => void
}

export default function ConfigPage({ onConfigured }: ConfigPageProps) {
  const [config, setConfig] = useState<DatabaseConfig>({
    user: "sa",
    password: "",
    server: "localhost\\ATX",
    database: "DentAdmin",
    port: 1433,
    trustServerCertificate: true,
    encrypt: false,
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)

  // Charger la configuration sauvegardée au démarrage
  useEffect(() => {
    const savedConfig = localStorage.getItem('db-config')
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        setConfig(parsedConfig)
        // Vérifier automatiquement la connexion avec la config sauvegardée
        testConnection(parsedConfig, true)
      } catch (err) {
        console.error('Erreur lors du chargement de la configuration:', err)
      }
    }
  }, [])

  const handleInputChange = (field: keyof DatabaseConfig, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Réinitialiser le statut de connexion lors des modifications
    if (connectionStatus !== "idle") {
      setConnectionStatus("idle")
      setErrorMessage("")
    }
  }

  const testConnection = async (configToTest?: DatabaseConfig, autoLogin = false) => {
    const testConfig = configToTest || config
    setIsConnecting(true)
    setErrorMessage("")
    
    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testConfig),
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setConnectionStatus("success")
        if (autoLogin) {
          setIsConfigured(true)
          onConfigured()
        }
      } else {
        setConnectionStatus("error")
        setErrorMessage(result.error || "Erreur de connexion inconnue")
      }
    } catch (err) {
      setConnectionStatus("error")
      setErrorMessage("Impossible de contacter le serveur")
      console.error('Erreur de test de connexion:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const saveAndConnect = async () => {
    // Sauvegarder la configuration
    localStorage.setItem('db-config', JSON.stringify(config))
    
    // Tester la connexion
    await testConnection()
    
    // Si la connexion réussit, marquer comme configuré
    if (connectionStatus === "success") {
      setIsConfigured(true)
      onConfigured()
    }
  }

  const resetConfig = () => {
    localStorage.removeItem('db-config')
    setConfig({
      user: "sa",
      password: "",
      server: "localhost\\ATX",
      database: "DentAdmin",
      port: 1433,
      trustServerCertificate: true,
      encrypt: false,
    })
    setConnectionStatus("idle")
    setErrorMessage("")
    setIsConfigured(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg p-4">
          <div className="flex items-center justify-center gap-3">
            <Database className="w-8 h-8" />
            <CardTitle className="text-2xl font-bold">Configuration Base de Données DentAdmin</CardTitle>
          </div>
          <p className="text-blue-100">
            Configurez la connexion à votre base de données SQL Server
          </p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Statut de connexion */}
          {connectionStatus !== "idle" && (
            <div className={`w-full p-4 rounded-lg border ${connectionStatus === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <div className="flex items-center gap-2 w-full">
                {connectionStatus === "success" ? (
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <div className={`flex-1 ${connectionStatus === "success" ? "text-green-800" : "text-red-800"}`}>
                  {connectionStatus === "success" 
                    ? "Connexion réussie ! La base de données est accessible."
                    : `Échec de la connexion : ${errorMessage}`
                  }
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Serveur */}
            <div className="space-y-2">
              <Label htmlFor="server">Serveur *</Label>
              <Input
                id="server"
                placeholder="localhost\instance"
                value={config.server}
                onChange={(e) => handleInputChange("server", e.target.value)}
              />
            </div>

            {/* Port */}
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                placeholder="1433"
                value={config.port}
                onChange={(e) => handleInputChange("port", parseInt(e.target.value) || 1433)}
              />
            </div>

            {/* Base de données */}
            <div className="space-y-2">
              <Label htmlFor="database">Base de données *</Label>
              <Input
                id="database"
                placeholder="DentAdmin"
                value={config.database}
                onChange={(e) => handleInputChange("database", e.target.value)}
              />
            </div>

            {/* Utilisateur */}
            <div className="space-y-2">
              <Label htmlFor="user">Utilisateur *</Label>
              <Input
                id="user"
                placeholder="sa"
                value={config.user}
                onChange={(e) => handleInputChange("user", e.target.value)}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Entrez votre mot de passe"
                value={config.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Options avancées */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Options avancées
            </h3>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="trustCert"
                checked={config.trustServerCertificate}
                onChange={(e) => handleInputChange("trustServerCertificate", e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="trustCert" className="text-sm">
                Faire confiance au certificat du serveur
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="encrypt"
                checked={config.encrypt}
                onChange={(e) => handleInputChange("encrypt", e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="encrypt" className="text-sm">
                Activer le chiffrement
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={resetConfig}
              className="flex-1"
            >
              Réinitialiser
            </Button>
            
            <Button
              variant="outline"
              onClick={() => testConnection()}
              disabled={isConnecting}
              className="flex-1"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Test en cours...
                </>
              ) : (
                "Tester la connexion"
              )}
            </Button>
            
            <Button
              onClick={saveAndConnect}
              disabled={isConnecting || !config.server || !config.database || !config.user || !config.password}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Sauvegarder et Continuer"
              )}
            </Button>
          </div>

          {/* Aide */}
          <div className="text-xs text-gray-500 space-y-1 pt-4 border-t">
            <p>• Les champs marqués d'un * sont obligatoires</p>
            <p>• La configuration est sauvegardée localement dans votre navigateur</p>
            <p>• Exemple de serveur : localhost\SQLEXPRESS ou 192.168.1.100</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}