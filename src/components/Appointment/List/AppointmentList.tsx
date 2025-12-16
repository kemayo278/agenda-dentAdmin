"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronLeft, ChevronRight, Plus, Phone, FileText, Search, Mail, Filter, Calendar, Users, BarChart3, Menu, ChevronDown, Eye, Settings, Clock } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddEditAppointmentDialog from "@/components/Appointment/Modal/AddEditAppointmentDialog"
import { ConfigMenu } from "@/components/Config/ConfigMenu"
import { appointmentService, type AppointmentAPI, type PractitionerAPI } from "@/services/appointmentService"

const appointmentTypes = [
  { id: "extraction", label: "Extraction", color: "#EC4899" },
  { id: "obturation", label: "Obturation", color: "#06B6D4" },
  { id: "endo", label: "Endo", color: "#059669" },
  { id: "prothese", label: "Prothèse", color: "#3B82F6" },
  { id: "couronne", label: "Couronne et Bridge", color: "#DC2626" },
  { id: "dpsi", label: "DPSI", color: "#6B7280" },
  { id: "implant", label: "Implant", color: "#10B981" },
  { id: "annulation", label: "Annulation", color: "#84CC16" },
  { id: "purge", label: "Purge", color: "#EAB308" },
  { id: "urgence", label: "Urgence", color: "#EF4444" },
  { id: "bilan", label: "Bilan Ortho", color: "#F59E0B" },
  { id: "retard", label: "Retard", color: "#9CA3AF" },
  { id: "nouveau", label: "Nouveau patient", color: "#FBBF24" },
  { id: "gouttiere", label: "Gouttière", color: "#22C55E" },
  { id: "reevaluation", label: "Réévaluation", color: "#94A3B8" },
  { id: "diagnostic", label: "Diagnostic patient", color: "#CBD5E1" },
  { id: "clincheck", label: "Clincheck", color: "#F472B6" },
  { id: "radio", label: "Radio panoramique", color: "#0EA5E9" },
]

// const practitioners = [
//   { id: "ah", name: "Achat Halopian", initials: "AH", color: "#EC4899" },
//   { id: "ak", name: "Ana Kahlaoui", initials: "AK", color: "#FBBF24" },
//   { id: "kj", name: "Kamal J", initials: "KJ", color: "#10B981" },
//   { id: "nb", name: "Berman Nate", initials: "NB", color: "#A855F7" },
// ]

interface Appointment {
  id: number
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

interface Practitioner extends PractitionerAPI {}

interface ClickedSlot {
  time: string
  practitionerId: string
}

interface AppointmentsListProps {
  onReconfigure?: () => void
}

export default function AppointmentsList({ onReconfigure }: AppointmentsListProps = {}) {
  const [selectedDate, setSelectedDate] = useState(new Date('2023-03-17'))
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [selectedPractitioners, setSelectedPractitioners] = useState<string[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [draggedAppointment, setDraggedAppointment] = useState<any>(null)
  const [clickedSlot, setClickedSlot] = useState<ClickedSlot | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null)
  const [totalAppointments, setTotalAppointments] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Fonctions API
  const fetchPractitioners = useCallback(async () => {
    try {
      const data = await appointmentService.getPractitioners()
      setPractitioners(data)
      setSelectedPractitioners(data.map((p: Practitioner) => p.id))
    } catch (err) {
      console.error('Erreur fetchPractitioners:', err)
      setError('Impossible de charger les praticiens')
    }
  }, [])

  const fetchAppointments = useCallback(async () => {
    if (!selectedDate) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Format de date cohérent pour l'API
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const dateForAPI = `${year}-${month}-${day}`
      
      const filters = {
        date: dateForAPI,
        ...(selectedPractitioners.length > 0 && selectedPractitioners.length < practitioners.length && {
          practitionerId: selectedPractitioners.join(',')
        }),
        ...(searchQuery && { patientSearch: searchQuery })
      }

      console.log('Selected date object:', selectedDate)
      console.log('Formatted date for API:', dateForAPI)
      console.log('Fetching appointments with filters:', filters)
      const data = await appointmentService.getAppointments(filters)
      console.log('Received appointments data:', data)
      
      const mappedAppointments = data.map(apt => ({
        ...apt,
        id: apt.id || 0
      }))
      
      setAppointments(mappedAppointments)
      setTotalAppointments(mappedAppointments.length)
    } catch (err) {
      console.error('Erreur fetchAppointments:', err)
      setError('Impossible de charger les rendez-vous')
      setAppointments([])
      setTotalAppointments(0)
    } finally {
      setLoading(false)
    }
  }, [selectedDate, selectedPractitioners, practitioners.length, searchQuery])

  const saveAppointment = useCallback(async (appointmentData: Appointment) => {
    try {
      if (appointmentData.id && appointmentData.id > 0) {
        await appointmentService.updateAppointment(appointmentData)
      } else {
        await appointmentService.createAppointment(appointmentData)
      }
      
      // Recharger les rendez-vous
      await fetchAppointments()
      return true
    } catch (err) {
      console.error('Erreur saveAppointment:', err)
      setError('Impossible de sauvegarder le rendez-vous')
      return false
    }
  }, [fetchAppointments])

  const deleteAppointment = useCallback(async (appointmentId: number) => {
    try {
      await appointmentService.deleteAppointment(appointmentId)
      
      // Recharger les rendez-vous
      await fetchAppointments()
      return true
    } catch (err) {
      console.error('Erreur deleteAppointment:', err)
      setError('Impossible de supprimer le rendez-vous')
      return false
    }
  }, [fetchAppointments])

  // Effets
  useEffect(() => {
    fetchPractitioners()
  }, [fetchPractitioners])

  useEffect(() => {
    if (practitioners.length > 0) {
      fetchAppointments()
    }
  }, [fetchAppointments, practitioners.length])

  // Effet de recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (practitioners.length > 0) {
        fetchAppointments()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchAppointments, practitioners.length])

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 7; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        slots.push(timeString)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    }
    setSelectedDate(newDate)
  }

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const totalMinutes = hours * 60 + minutes + duration
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`
  }

  const calculateHeight = (duration: number) => {
    const slots = duration / 15
    return slots * 60 - 4
  }

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours()
    const minutes = currentTime.getMinutes()
    if (hours < 8 || hours >= 18) return null

    const totalMinutes = (hours - 8) * 60 + minutes
    const position = (totalMinutes / 15) * 60
    return position
  }

  const handleDragStart = (e: React.DragEvent, appointment: any) => {
    setDraggedAppointment(appointment)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, time: string, practitionerId: string) => {
    e.preventDefault()
    if (draggedAppointment) {
      // Calculer la nouvelle date/heure
      const [hours, minutes] = time.split(':').map(Number)
      const newStartDateTime = new Date(selectedDate)
      newStartDateTime.setHours(hours, minutes, 0, 0)
      
      const newEndDateTime = new Date(newStartDateTime)
      newEndDateTime.setMinutes(newEndDateTime.getMinutes() + draggedAppointment.duration)

      const updatedAppointment = {
        ...draggedAppointment,
        time,
        practitionerId,
        startDateTime: newStartDateTime.toISOString(),
        endDateTime: newEndDateTime.toISOString()
      }

      const success = await saveAppointment(updatedAppointment)
      if (success) {
        setDraggedAppointment(null)
      }
    }
  }

  const handleDoubleClick = (time: string, practitionerId: string) => {
    setClickedSlot({ time, practitionerId })
    setEditingAppointment(null)
    setIsAddDialogOpen(true)
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setClickedSlot(null)
    setIsAddDialogOpen(true)
  }

  const handleSaveAppointment = async (appointmentData: Appointment) => {
    const success = await saveAppointment(appointmentData)
    if (success) {
      setIsAddDialogOpen(false)
      setEditingAppointment(null)
      setClickedSlot(null)
    }
  }

  const handleDeleteAppointment = async (appointmentId: number) => {
    const success = await deleteAppointment(appointmentId)
    if (success) {
      setIsAddDialogOpen(false)
      setEditingAppointment(null)
      setClickedSlot(null)
    }
  }

  const filteredAppointments = appointments.filter(
    (apt) =>
      selectedPractitioners.includes(apt.practitionerId) &&
      (searchQuery === "" || apt.patient.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmé"
      case "pending":
        return "En attente"
      case "cancelled":
        return "Annulé"
      case "completed":
        return "Terminé"
      case "urgent":
        return "Urgent"
      default:
        return status
    }
  }

  const DatePicker = () => {
    // Fonction pour formater la date en YYYY-MM-DD sans problèmes de timezone
    const formatDateForInput = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const createDateFromInput = (dateString: string) => {
      const [year, month, day] = dateString.split('-').map(Number)
      return new Date(year, month - 1, day, 12, 0, 0) // Midi pour éviter les problèmes de timezone
    }

    return (
    <div className="p-4 space-y-3">
      <h3 className="font-semibold text-sm">Sélectionner une date</h3>
      <div className="space-y-2">
        <Label htmlFor="date-input" className="text-sm font-medium">Date</Label>
        <Input
          id="date-input"
          type="date"
          value={tempSelectedDate ? formatDateForInput(tempSelectedDate) : formatDateForInput(selectedDate)}
          onChange={(e) => {
            console.log('Date input changed to:', e.target.value)
            const newDate = createDateFromInput(e.target.value)
            console.log('Created date object:', newDate)
            setTempSelectedDate(newDate)
          }}
          className="w-full h-9"
        />
        <div className="flex gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const today = new Date()
              const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0)
              console.log('Setting temp date to today:', todayNormalized)
              setTempSelectedDate(todayNormalized)
            }}
            className="text-xs"
          >
            Aujourd'hui
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const today = new Date()
              const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0, 0)
              console.log('Setting temp date to tomorrow:', tomorrow)
              setTempSelectedDate(tomorrow)
            }}
            className="text-xs"
          >
            Demain
          </Button>
        </div>
        <div className="flex gap-2 mt-4 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTempSelectedDate(null)
              setIsCalendarOpen(false)
            }}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (tempSelectedDate) {
                console.log('Confirming date selection:', tempSelectedDate)
                console.log('Date will be formatted as:', tempSelectedDate.toISOString().split('T')[0])
                setSelectedDate(tempSelectedDate)
              }
              setTempSelectedDate(null)
              setIsCalendarOpen(false)
            }}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
    )
  }

  const FiltersContent = () => (
    <div className="p-4 space-y-4">
      {/* Search */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Recherche</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Nom du patient..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Practitioners Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Praticiens</Label>
        <div className="space-y-2">
          {practitioners.map((prac) => (
            <div key={prac.id} className="flex items-center space-x-2">
              <Checkbox
                id={`prac-${prac.id}`}
                checked={selectedPractitioners.includes(prac.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedPractitioners([...selectedPractitioners, prac.id])
                  } else {
                    setSelectedPractitioners(selectedPractitioners.filter((id) => id !== prac.id))
                  }
                }}
              />
              <Label htmlFor={`prac-${prac.id}`} className="flex items-center gap-2 cursor-pointer font-normal text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: prac.color }} />
                {prac.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Period Filters */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Période rapide</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
            Aujourd'hui
          </Button>
          <Button variant="outline" size="sm">
            Demain
          </Button>
          <Button variant="outline" size="sm">
            Cette semaine
          </Button>
          <Button variant="outline" size="sm">
            Semaine prochaine
          </Button>
        </div>
      </div>

      {/* Outlook Integration */}
      <div className="pt-4 border-t space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Intégration
        </Label>
        <Button variant="outline" className="w-full justify-start bg-transparent h-9" size="sm">
          <Mail className="w-4 h-4 mr-2" />
          Synchroniser Outlook
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-background to-muted/20">
      {/* Enhanced Navbar */}
      <div className="border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80 shadow-sm sticky top-0 z-50">
        <div className="px-4 md:px-6 py-3">
          <div className="flex flex-col gap-3">
            {/* Top Row: Title, Navigation, and Actions */}
            <div className="flex items-center justify-between gap-4">
              {/* Left: Title and Date Navigation */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold text-foreground">Planning</h1>
                  <p className="text-sm text-muted-foreground">
                    Gestion des rendez-vous • {totalAppointments} RDV {filteredAppointments.length !== totalAppointments ? `(${filteredAppointments.length} affichés)` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateDate("prev")} className="hover:bg-accent/80 transition-all hover:scale-105">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="min-w-[200px] md:min-w-[280px] text-center">
                    <p className="font-semibold text-sm md:text-base text-foreground capitalize truncate">
                      {formatDate(selectedDate)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigateDate("next")} className="hover:bg-accent/80 transition-all hover:scale-105">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Right: Quick Actions */}
              <div className="flex items-center gap-2">
                <ConfigMenu onReconfigure={onReconfigure || (() => {})} />
                <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())} className="hidden md:flex hover:bg-accent/80 transition-all">
                  Aujourd'hui
                </Button>
                <Button 
                  onClick={() => {
                    setEditingAppointment(null)
                    setClickedSlot(null)
                    setIsAddDialogOpen(true)
                  }} 
                  size="sm" 
                  className="hidden gap-2 bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nouveau RDV</span>
                  <span className="sm:hidden">RDV</span>
                </Button>
              </div>
            </div>

            {/* Bottom Row: Filters, Summary, and View Controls */}
            <div className="flex items-center justify-between gap-4">
              {/* Left: Filters and Calendar */}
              <div className="flex items-center gap-2">
                {/* Mobile Menu */}
                <Sheet open={isMobileMenuOpen} onOpenChange={(open) => {
                  setIsMobileMenuOpen(open)
                  if (open) {
                    setTempSelectedDate(selectedDate)
                  } else {
                    setTempSelectedDate(null)
                  }
                }}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="md:hidden">
                      <Menu className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filtres et Calendrier</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-6 mt-6">
                      <DatePicker />
                      <div className="border-t">
                        <FiltersContent />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Desktop Filters */}
                <div className="hidden md:flex items-center gap-2">
                  <Popover open={isCalendarOpen} onOpenChange={(open) => {
                    setIsCalendarOpen(open)
                    if (open) {
                      setTempSelectedDate(selectedDate)
                    } else {
                      setTempSelectedDate(null)
                    }
                  }}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 hover:bg-accent/80 transition-all">
                        <Calendar className="w-4 h-4" />
                        <span className="hidden lg:inline">Calendrier</span>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0" align="start">
                      <DatePicker />
                    </PopoverContent>
                  </Popover>

                  <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 hover:bg-accent/80 transition-all">
                        <Filter className="w-4 h-4" />
                        <span className="hidden lg:inline">Filtres</span>
                        <ChevronDown className="w-3 h-3" />
                        {selectedPractitioners.length < practitioners.length && (
                          <Badge variant="secondary" className="text-xs ml-1">
                            {selectedPractitioners.length}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <FiltersContent />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Quick Search */}
                <div className="relative hidden lg:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un patient..."
                    className="pl-9 w-64 h-9 bg-muted/50 border-muted focus:bg-background transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Center: Summary Stats */}
              <div className="hidden xl:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg">
                  <span className="text-sm font-semibold">{totalAppointments} RDV</span>
                  {filteredAppointments.length !== totalAppointments && (
                    <span className="text-xs">({filteredAppointments.length} visibles)</span>
                  )}
                </div>
                <div className="flex items-center gap-4 px-4 py-2 bg-linear-to-r from-muted/30 to-muted/10 rounded-lg">
                  {practitioners
                    .filter((p) => selectedPractitioners.includes(p.id))
                    .map((prac) => {
                      const count = filteredAppointments.filter((apt) => apt.practitionerId === prac.id).length
                      return (
                        <div key={prac.id} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: prac.color }} />
                          <span className="text-sm font-medium">{prac.initials}</span>
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            {count}
                          </Badge>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>

            {/* Mobile Summary */}
            <div className="flex xl:hidden items-center justify-center gap-3 py-2 bg-linear-to-r from-muted/20 to-muted/10 rounded-lg">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded">
                <span className="text-xs font-semibold">{totalAppointments} RDV</span>
                {filteredAppointments.length !== totalAppointments && (
                  <span className="text-[10px]">({filteredAppointments.length})</span>
                )}
              </div>
              {practitioners
                .filter((p) => selectedPractitioners.includes(p.id))
                .map((prac) => {
                  const count = filteredAppointments.filter((apt) => apt.practitionerId === prac.id).length
                  return (
                    <div key={prac.id} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: prac.color }} />
                      <span className="text-xs font-medium">{prac.initials}</span>
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        {count}
                      </Badge>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex-1 overflow-hidden p-4 md:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
            <button 
              onClick={() => {
                setError(null)
                fetchAppointments()
              }}
              className="ml-2 underline hover:no-underline"
            >
              Réessayer
            </button>
          </div>
        )}
        <Card className="h-full border-0 shadow-lg bg-linear-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 overflow-hidden">
          <CardContent className="p-0 h-full overflow-auto relative">
            {loading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="flex items-center gap-2 bg-background border rounded-lg px-4 py-2 shadow-lg">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Chargement...</span>
                </div>
              </div>
            )}
            <div className="relative min-w-max">
              {/* Header with practitioner names */}
              <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b flex shadow-sm">
                <div className="w-20 shrink-0 border-r bg-muted/50 flex items-center justify-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Heure</span>
                </div>
                {practitioners
                  .filter((p) => selectedPractitioners.includes(p.id))
                  .map((prac) => (
                    <div
                      key={prac.id}
                      className="flex-1 min-w-[200px] p-4 border-r bg-linear-to-br from-muted/30 to-muted/10 text-center font-semibold hover:from-muted/40 hover:to-muted/20 transition-all group"
                      style={{ borderTopColor: prac.color, borderTopWidth: 3 }}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: prac.color }} />
                        <span className="truncate">{prac.name}</span>
                        <Badge variant="secondary" className="bg-background/80 text-xs">
                          {filteredAppointments.filter((apt) => apt.practitionerId === prac.id).length}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Time slots with appointments */}
              <div className="relative">
                {timeSlots.map((time) => {
                  const isHourMark = time.endsWith(":00")

                  return (
                    <div key={time} className="flex" style={{ height: "60px" }}>
                      {/* Time column */}
                      <div className="w-20 shrink-0 border-r border-b bg-muted/20 relative">
                        {isHourMark && (
                          <div className="absolute top-2 left-2 text-sm font-semibold text-muted-foreground">
                            {time}
                          </div>
                        )}
                      </div>

                      {/* Practitioner columns */}
                      {practitioners
                        .filter((p) => selectedPractitioners.includes(p.id))
                        .map((prac) => {
                          const appointmentsAtSlot = filteredAppointments.filter(
                            (apt) =>
                              apt.practitionerId === prac.id &&
                              apt.time <= time &&
                              calculateEndTime(apt.time, apt.duration) > time,
                          )

                          const appointmentToShow = appointmentsAtSlot.find((apt) => apt.time === time)

                          return (
                            <div
                              key={prac.id}
                              className="flex-1 min-w-[200px] border-r border-b relative hover:bg-muted/20 transition-all cursor-pointer group"
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, time, prac.id)}
                              onClick={() => handleDoubleClick(time, prac.id)}
                            >
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-primary/5 transition-opacity pointer-events-none" />
                              
                              {appointmentToShow && (
                                <div
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, appointmentToShow)}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAppointmentClick(appointmentToShow)
                                  }}
                                  className="absolute inset-x-1 rounded-lg border-l-4 p-2 cursor-move hover:shadow-md transition-all overflow-hidden group/appointment"
                                  style={{
                                    backgroundColor: appointmentToShow.color + "15",
                                    borderLeftColor: appointmentToShow.color,
                                    height: `${calculateHeight(appointmentToShow.duration)}px`,
                                    zIndex: 5,
                                  }}
                                >
                                  <div className="flex flex-col h-full text-xs">
                                    <div className="flex items-start justify-between gap-1 mb-1">
                                      <span className="font-bold text-foreground truncate flex-1 text-xs">
                                        {appointmentToShow.time}-
                                        {calculateEndTime(appointmentToShow.time, appointmentToShow.duration)}
                                      </span>
                                      <div className="flex gap-1 shrink-0 opacity-0 group-hover/appointment:opacity-100 transition-opacity">
                                        {appointmentToShow.hasPhone && (
                                          <Phone className="w-3 h-3 text-green-600" />
                                        )}
                                        {appointmentToShow.hasDocument && (
                                          <FileText className="w-3 h-3 text-blue-600" />
                                        )}
                                      </div>
                                    </div>
                                    <div className="font-bold text-foreground truncate text-sm">
                                      {appointmentToShow.patient}
                                    </div>
                                    <div className="text-muted-foreground truncate font-medium">
                                      {appointmentToShow.type}
                                    </div>
                                    {appointmentToShow.notes && (
                                      <div className="text-muted-foreground truncate mt-1 text-[10px] opacity-75">
                                        {appointmentToShow.notes}
                                      </div>
                                    )}
                                    <div className="mt-auto pt-1">
                                      <Badge
                                        className={`text-[10px] px-1.5 py-0.5 border ${getStatusColor(appointmentToShow.status)}`}
                                      >
                                        {getStatusLabel(appointmentToShow.status)}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  )
                })}

                {getCurrentTimePosition() !== null && (
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-red-500 z-20 pointer-events-none shadow-lg"
                    style={{ top: `${getCurrentTimePosition()}px` }}
                  >
                    <div className="absolute -left-2 -top-2 w-4 h-4 bg-red-500 rounded-full shadow-lg animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AddEditAppointmentDialog Component */}
      <AddEditAppointmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        appointment={editingAppointment}
        clickedSlot={clickedSlot}
        selectedDate={selectedDate}
        appointmentTypes={appointmentTypes}
        practitioners={practitioners}
        onSave={handleSaveAppointment}
        onDelete={handleDeleteAppointment}
        calculateEndTime={calculateEndTime}
        formatDate={formatDate}
      />
    </div>
  )
}