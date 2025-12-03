// Service client avec gestion de la configuration de base de données

interface DatabaseConfig {
  user: string
  password: string
  server: string
  database: string
  port: number
  trustServerCertificate: boolean
  encrypt: boolean
}

interface RequestOptions {
  method?: string
  body?: string
  headers?: Record<string, string>
}

interface AppointmentFilters {
  date?: string
  practitionerId?: string
  patientSearch?: string
  status?: string
}

class ApiClientService {
  private baseURL: string

  constructor() {
    this.baseURL = '/api'
  }

  // Obtenir la configuration depuis localStorage
  getDbConfig(): DatabaseConfig {
    const savedConfig = localStorage.getItem('db-config')
    if (!savedConfig) {
      throw new Error('Configuration de base de données non trouvée. Veuillez vous reconnecter.')
    }
    return JSON.parse(savedConfig)
  }

  // Headers par défaut avec configuration DB
  getHeaders(): Record<string, string> {
    const dbConfig = this.getDbConfig()
    return {
      'Content-Type': 'application/json',
      'x-db-config': JSON.stringify(dbConfig)
    }
  }

  // Méthode générique pour les requêtes
  async request(endpoint: string, options: RequestOptions = {}): Promise<any> {
    try {
      const headers = {
        ...this.getHeaders(),
        ...options.headers
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Erreur lors de la requête ${endpoint}:`, error)
      throw error
    }
  }

  // Méthodes spécifiques pour les rendez-vous
  async getAppointments(params: AppointmentFilters = {}): Promise<any> {
    const searchParams = new URLSearchParams(params as Record<string, string>)
    return this.request(`/appointments?${searchParams}`)
  }

  async createAppointment(appointmentData: any): Promise<any> {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    })
  }

  async updateAppointment(appointmentData: any): Promise<any> {
    return this.request('/appointments', {
      method: 'PUT',
      body: JSON.stringify(appointmentData)
    })
  }

  async deleteAppointment(id: number | string): Promise<any> {
    return this.request(`/appointments?id=${id}`, {
      method: 'DELETE'
    })
  }

  // Méthodes pour les praticiens
  async getPractitioners(): Promise<any> {
    return this.request('/practitioners')
  }

  // Test de connexion
  async testConnection(config: DatabaseConfig): Promise<any> {
    return fetch('/api/test-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    }).then(res => res.json())
  }
}

// Instance singleton
export const apiClient = new ApiClientService()

// Export pour compatibilité avec l'ancien service
export const appointmentService = {
  getAppointments: (params?: AppointmentFilters) => apiClient.getAppointments(params),
  createAppointment: (data: any) => apiClient.createAppointment(data),
  updateAppointment: (data: any) => apiClient.updateAppointment(data),
  deleteAppointment: (id: number | string) => apiClient.deleteAppointment(id),
  getPractitioners: () => apiClient.getPractitioners(),
}