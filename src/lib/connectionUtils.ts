interface ConnectionLog {
  timestamp: string
  server: string
  database: string
  user: string
  status: 'success' | 'error'
  message: string
}

export class ConnectionLogger {
  private static readonly STORAGE_KEY = 'db-connection-logs'
  private static readonly MAX_LOGS = 50

  static addLog(log: Omit<ConnectionLog, 'timestamp'>) {
    const logs = this.getLogs()
    const newLog: ConnectionLog = {
      ...log,
      timestamp: new Date().toISOString()
    }
    
    logs.unshift(newLog)
    
    // Garder seulement les derniers logs
    if (logs.length > this.MAX_LOGS) {
      logs.splice(this.MAX_LOGS)
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs))
  }

  static getLogs(): ConnectionLog[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  static clearLogs() {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  static getLastSuccessfulConnection(): ConnectionLog | null {
    const logs = this.getLogs()
    return logs.find(log => log.status === 'success') || null
  }
}

// Utilitaires pour la validation des paramètres de connexion
export class ConnectionValidator {
  static validateConfig(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.server || config.server.trim() === '') {
      errors.push('Le serveur est requis')
    }

    if (!config.database || config.database.trim() === '') {
      errors.push('Le nom de la base de données est requis')
    }

    if (!config.user || config.user.trim() === '') {
      errors.push('Le nom d\'utilisateur est requis')
    }

    if (!config.password || config.password.trim() === '') {
      errors.push('Le mot de passe est requis')
    }

    if (config.port && (isNaN(config.port) || config.port < 1 || config.port > 65535)) {
      errors.push('Le port doit être un nombre entre 1 et 65535')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static normalizeServerName(server: string): string {
    // Nettoyer et normaliser le nom du serveur
    return server.trim().replace(/\s+/g, ' ')
  }

  static generateConnectionString(config: any): string {
    const normalizedServer = this.normalizeServerName(config.server)
    const port = config.port || 1433
    
    return `Server=${normalizedServer},${port};Database=${config.database};User ID=${config.user};Encrypt=${config.encrypt ? 'true' : 'false'};TrustServerCertificate=${config.trustServerCertificate ? 'true' : 'false'};`
  }
}

// Gestionnaire de configurations multiples
export class ConfigurationManager {
  private static readonly CONFIGS_STORAGE_KEY = 'db-configurations'

  static saveConfiguration(name: string, config: any) {
    const configs = this.getConfigurations()
    configs[name] = {
      ...config,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem(this.CONFIGS_STORAGE_KEY, JSON.stringify(configs))
  }

  static getConfigurations(): Record<string, any> {
    try {
      const stored = localStorage.getItem(this.CONFIGS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  static deleteConfiguration(name: string) {
    const configs = this.getConfigurations()
    delete configs[name]
    localStorage.setItem(this.CONFIGS_STORAGE_KEY, JSON.stringify(configs))
  }

  static loadConfiguration(name: string) {
    const configs = this.getConfigurations()
    return configs[name] || null
  }
}