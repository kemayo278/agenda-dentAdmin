// Service pour la gestion des rendez-vous via l'API
export interface AppointmentAPI {
  id?: number
  time: string
  duration: number
  patient: string
  practitionerId: string
  type: string
  color: string
  notes: string
  hasPhone: boolean
  hasDocument: boolean
  status: "confirmed" | "pending" | "cancelled" | "completed" | "urgent"
  startDateTime?: string
  endDateTime?: string
  patientId?: number
  practitionerName?: string
  practitionerCode?: string
  cancelReason?: string
}

export interface PractitionerAPI {
  id: string
  name: string
  initials: string
  color: string
  firstName?: string
  lastName?: string
}

export interface AppointmentFilters {
  date?: string
  practitionerId?: string
  patientSearch?: string
  status?: string
}

class AppointmentService {
  private baseUrl = '/api'

  async getAppointments(filters: AppointmentFilters = {}): Promise<AppointmentAPI[]> {
    const params = new URLSearchParams()
    
    // Date par défaut si aucune date n'est fournie (17 mars 2023 comme exemple)
    if (!filters.date) {
      filters.date = '2023-03-17'
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value)
      }
    })

    const response = await fetch(`${this.baseUrl}/appointments?${params}`)
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async createAppointment(appointment: AppointmentAPI): Promise<{ success: boolean; appointmentId?: number }> {
    const response = await fetch(`${this.baseUrl}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    })

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async updateAppointment(appointment: AppointmentAPI): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/appointments`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    })

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteAppointment(appointmentId: number): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/appointments?id=${appointmentId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async getPractitioners(): Promise<PractitionerAPI[]> {
    const response = await fetch(`${this.baseUrl}/practitioners`)
    
    if (!response.ok) {
      console.log(`Erreur ${response}`)
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async getPatients(searchTerm?: string): Promise<any[]> {
    const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''
    const response = await fetch(`${this.baseUrl}/patients${params}`)
    
    if (!response.ok) {
      console.log(`Erreur ${response}`)
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }
}

export const appointmentService = new AppointmentService()