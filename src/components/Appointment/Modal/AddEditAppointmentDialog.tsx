"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, User, Plus, Settings, CheckCircle, Trash2, Bell, Eye, FileText, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"

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
  // Données supplémentaires de l'API
  startDateTime?: string
  endDateTime?: string
  patientId?: number
  practitionerName?: string
  practitionerCode?: string
  cancelReason?: string
}

interface AppointmentType {
  id: string
  label: string
  color: string
}

interface Practitioner {
  id: string
  name: string
  initials: string
  color: string
}

interface ClickedSlot {
  time: string
  practitionerId: string
}

interface AddEditAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment?: Appointment | null
  clickedSlot?: ClickedSlot | null
  selectedDate: Date
  appointmentTypes: AppointmentType[]
  practitioners: Practitioner[]
  onSave: (appointment: Appointment) => void
  onDelete?: (appointmentId: number) => void
  calculateEndTime: (startTime: string, duration: number) => string
  formatDate: (date: Date) => string
}

export default function AddEditAppointmentDialog({
  open,
  onOpenChange,
  appointment = null,
  clickedSlot = null,
  selectedDate,
  appointmentTypes,
  practitioners,
  onSave,
  onDelete,
  calculateEndTime,
  formatDate
}: AddEditAppointmentDialogProps) {
  const [selectedColor, setSelectedColor] = useState("#3B82F6")
  const [selectedType, setSelectedType] = useState("")
  const [viewMode, setViewMode] = useState<"view" | "edit">("view")
  const [formData, setFormData] = useState({
    appointmentType: "patient",
    patient: "",
    practitionerId: clickedSlot?.practitionerId || "",
    assistant: "",
    subject: "",
    room: "",
    startDate: selectedDate.toISOString().split("T")[0],
    startTime: clickedSlot?.time || "09:00",
    duration: "30",
    endDate: selectedDate.toISOString().split("T")[0],
    endTime: "09:30",
    reminder: false,
    reminderTime: "15",
    status: "occupied",
    notes: "",
  })

  const isEditMode = appointment !== null
  const isViewMode = viewMode === "view" && appointment !== null

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmé"
      case "pending": return "En attente"
      case "cancelled": return "Annulé"
      case "completed": return "Terminé"
      case "urgent": return "Urgent"
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800 border-green-300"
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "cancelled": return "bg-red-100 text-red-800 border-red-300"
      case "completed": return "bg-blue-100 text-blue-800 border-blue-300"
      case "urgent": return "bg-orange-100 text-orange-800 border-orange-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  useEffect(() => {
    if (isEditMode && appointment) {
      // Populate form with existing appointment data
      setFormData({
        appointmentType: "patient",
        patient: appointment.patient,
        practitionerId: appointment.practitionerId,
        assistant: "",
        subject: appointment.type,
        room: "",
        startDate: selectedDate.toISOString().split("T")[0],
        startTime: appointment.time,
        duration: appointment.duration.toString(),
        endDate: selectedDate.toISOString().split("T")[0],
        endTime: calculateEndTime(appointment.time, appointment.duration),
        reminder: false,
        reminderTime: "15",
        status: "occupied",
        notes: appointment.notes
      })
      setSelectedColor(appointment.color)
      const type = appointmentTypes.find(t => t.color === appointment.color)
      if (type) {
        setSelectedType(type.id)
      }
    } else if (clickedSlot) {
      // Reset for new appointment with clicked slot
      setFormData(prev => ({
        ...prev,
        practitionerId: clickedSlot.practitionerId,
        startTime: clickedSlot.time,
        endTime: calculateEndTime(clickedSlot.time, parseInt(prev.duration))
      }))
    }
  }, [appointment, clickedSlot, isEditMode, selectedDate, calculateEndTime, appointmentTypes])

  useEffect(() => {
    // Update end time when start time or duration changes
    const endTime = calculateEndTime(formData.startTime, parseInt(formData.duration))
    setFormData(prev => ({ ...prev, endTime }))
  }, [formData.startTime, formData.duration, calculateEndTime])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const appointmentData: Appointment = {
      id: isEditMode && appointment ? appointment.id : Math.max(0), // Temporaire, sera géré dans AppointmentList
      time: formData.startTime,
      duration: parseInt(formData.duration),
      patient: formData.patient,
      practitionerId: formData.practitionerId,
      type: appointmentTypes.find(t => t.id === selectedType)?.label || formData.subject,
      color: selectedColor,
      notes: formData.notes,
      hasPhone: false, // This would be determined by patient data
      hasDocument: false, // This would be determined by patient data
      status: "confirmed" as const
    }

    onSave(appointmentData)
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (isEditMode && appointment && appointment.id && onDelete) {
      onDelete(appointment.id)
      onOpenChange(false)
    }
  }

  console.log("Form Data:", formData)

  return (
<Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader className="border-b border-border/20 pb-4 bg-linear-to-r from-primary/5 to-primary/10 rounded-t-lg -m-6 mb-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {isViewMode ? "Détails du rendez-vous" : isEditMode ? "Modifier le rendez-vous" : "Ajouter un rendez-vous"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {clickedSlot ? `${formatDate(selectedDate)} à ${clickedSlot.time}` : formatDate(selectedDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {appointment && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "view" ? "edit" : "view")}
                className="gap-2"
              >
                {viewMode === "view" ? (
                  <>
                    <Settings className="w-4 h-4" />
                    Modifier
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Voir
                  </>
                )}
              </Button>
            )}
            {(clickedSlot || appointment) && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                <Clock className="w-3 h-3 mr-1" />
                {clickedSlot?.time || appointment?.time}
              </Badge>
            )}
          </div>
        </div>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto">
        {isViewMode ? (
          // Vue détaillée en lecture seule
          <div className="space-y-6 mt-4">
            {/* En-tête avec statut et informations principales */}
            <div className="bg-linear-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{appointment.patient}</h3>
                  <p className="text-sm text-muted-foreground">
                    Rendez-vous #{appointment.id}
                  </p>
                </div>
                <Badge className={`${getStatusColor(appointment.status)} border`}>
                  {getStatusLabel(appointment.status)}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Type:</span>
                  <p className="text-foreground">{appointment.type}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Durée:</span>
                  <p className="text-foreground">{appointment.duration} min</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Heure:</span>
                  <p className="text-foreground">
                    {appointment.time} - {calculateEndTime(appointment.time, appointment.duration)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Date:</span>
                  <p className="text-foreground">{formatDate(selectedDate)}</p>
                </div>
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations patient */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Informations Patient
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Nom complet:</span>
                      <p className="text-foreground">{appointment.patient}</p>
                    </div>
                    {appointment.patientId && (
                      <div>
                        <span className="font-medium text-muted-foreground">ID Patient:</span>
                        <p className="text-foreground">#{appointment.patientId}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      {appointment.hasPhone && (
                        <Badge variant="outline" className="text-xs">
                          <Bell className="w-3 h-3 mr-1" />
                          Téléphone
                        </Badge>
                      )}
                      {appointment.hasDocument && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          Document
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informations praticien */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Praticien
                  </h4>
                  <div className="space-y-2 text-sm">
                    {practitioners.find(p => p.id === appointment.practitionerId) && (
                      <>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: practitioners.find(p => p.id === appointment.practitionerId)?.color }}
                          />
                          <span className="font-medium">
                            {practitioners.find(p => p.id === appointment.practitionerId)?.name}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Code:</span>
                          <p className="text-foreground">
                            {practitioners.find(p => p.id === appointment.practitionerId)?.initials}
                          </p>
                        </div>
                      </>
                    )}
                    {appointment.practitionerName && (
                      <div>
                        <span className="font-medium text-muted-foreground">Nom complet:</span>
                        <p className="text-foreground">{appointment.practitionerName}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Type de rendez-vous et couleur */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Type de Rendez-vous
                </h4>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-lg border-2 border-gray-300" 
                    style={{ backgroundColor: appointment.color }}
                  />
                  <span className="font-medium">{appointment.type}</span>
                  <span className="text-sm text-muted-foreground">
                    ({appointment.color})
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {appointment.notes && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Notes
                  </h4>
                  <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">
                    {appointment.notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Informations système */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  Informations Système
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Date/heure de début:</span>
                    <p>{appointment.startDateTime ? new Date(appointment.startDateTime).toLocaleString('fr-FR') : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Date/heure de fin:</span>
                    <p>{appointment.endDateTime ? new Date(appointment.endDateTime).toLocaleString('fr-FR') : 'N/A'}</p>
                  </div>
                  {appointment.cancelReason && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Raison d'annulation:</span>
                      <p className="text-red-600">{appointment.cancelReason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions en bas */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border/50 bg-linear-to-r from-muted/20 to-muted/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <p>Dernière modification: {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="hover:bg-muted/50 transition-all"
                >
                  Fermer
                </Button>
                {/* <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setViewMode("edit")}
                  className="hover:bg-primary/10 hover:border-primary/40 transition-all"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                {onDelete && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete}
                    className="hover:bg-destructive/90 transition-all"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                )} */}
              </div>
            </div>
          </div>
        ) : (
          // Formulaire d'édition (code existant)
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Main Fields */}
            <div className="col-span-2 space-y-4">
              {/* Type */}
              <div className="space-y-3">
                <Label>Type *</Label>
                <RadioGroup 
                  value={formData.appointmentType} 
                  onValueChange={(value) => setFormData({ ...formData, appointmentType: value })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="patient" id="patient" />
                    <Label htmlFor="patient" className="font-normal cursor-pointer">
                      Rendez-vous patient
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="general" id="general" />
                    <Label htmlFor="general" className="font-normal cursor-pointer">
                      Rendez-vous général
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="family" id="family" />
                    <Label htmlFor="family" className="font-normal cursor-pointer">
                      Famille
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Patient */}
              <div className="space-y-2">
                <Label htmlFor="patient-select">Patient *</Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.patient} 
                    onValueChange={(value) => setFormData({ ...formData, patient: value })}
                  >
                    <SelectTrigger id="patient-select" className="flex-1">
                      <SelectValue placeholder="Rechercher et sélectionner un patient..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Marie Dupont">Marie Dupont - 15/03/1985</SelectItem>
                      <SelectItem value="Jean Martin">Jean Martin - 22/07/1990</SelectItem>
                      <SelectItem value="Sophie Bernard">Sophie Bernard - 08/11/1978</SelectItem>
                      <SelectItem value="Chouaref Fatima">Chouaref Fatima - 12/05/1982</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" size="icon" variant="outline" title="Ajouter un nouveau patient">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Praticien */}
              <div className="space-y-2">
                <Label htmlFor="practitioner-select">Praticien *</Label>
                <Select 
                  value={formData.practitionerId} 
                  onValueChange={(value) => setFormData({ ...formData, practitionerId: value })}
                >
                  <SelectTrigger id="practitioner-select">
                    <SelectValue placeholder="Sélectionner un praticien" />
                  </SelectTrigger>
                  <SelectContent>
                    {practitioners.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                          {p.name} ({p.initials})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assistant(e) */}
              <div className="space-y-2">
                <Label htmlFor="assistant">Assistant(e)</Label>
                <Select 
                  value={formData.assistant} 
                  onValueChange={(value) => setFormData({ ...formData, assistant: value })}
                >
                  <SelectTrigger id="assistant">
                    <SelectValue placeholder="Aucune sélection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune sélection</SelectItem>
                    <SelectItem value="Marie Assistante">Marie Assistante</SelectItem>
                    <SelectItem value="Julie Assistante">Julie Assistante</SelectItem>
                    <SelectItem value="Sophie Assistante">Sophie Assistante</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sujet */}
              <div className="space-y-2">
                <Label htmlFor="subject">Sujet</Label>
                <Input 
                  id="subject" 
                  placeholder="Sujet du rendez-vous"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              {/* Lieu / Salle / Fauteuil */}
              <div className="space-y-2">
                <Label htmlFor="room">Lieu / Salle / Fauteuil</Label>
                <Select 
                  value={formData.room} 
                  onValueChange={(value) => setFormData({ ...formData, room: value })}
                >
                  <SelectTrigger id="room">
                    <SelectValue placeholder="Sélectionner un fauteuil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Fauteuil 1 - Salle A</SelectItem>
                    <SelectItem value="2">Fauteuil 2 - Salle A</SelectItem>
                    <SelectItem value="3">Fauteuil 3 - Salle B</SelectItem>
                    <SelectItem value="4">Fauteuil 4 - Salle B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date de début */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Date de début *</Label>
                  <Input 
                    id="start-date" 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-time">Heure de début *</Label>
                  <Input 
                    id="start-time" 
                    type="time" 
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Durée */}
              <div className="space-y-2">
                <Label htmlFor="duration">Durée *</Label>
                <Select 
                  value={formData.duration} 
                  onValueChange={(value) => setFormData({ ...formData, duration: value })}
                >
                  <SelectTrigger id="duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 heure</SelectItem>
                    <SelectItem value="90">1h30</SelectItem>
                    <SelectItem value="120">2 heures</SelectItem>
                    <SelectItem value="custom">Personnalisé...</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date de fin (auto-calculated) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="end-date">Date de fin</Label>
                  <Input 
                    id="end-date" 
                    type="date" 
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">Heure de fin</Label>
                  <Input 
                    id="end-time" 
                    type="time" 
                    value={formData.endTime}
                    readOnly
                    className="bg-muted/30"
                  />
                </div>
              </div>

              {/* Rappel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="reminder" 
                      checked={formData.reminder}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, reminder: checked === true }))}
                    />
                    <Label htmlFor="reminder" className="font-normal cursor-pointer">
                      Rappel
                    </Label>
                  </div>
                  <Select 
                    value={formData.reminderTime} 
                    onValueChange={(value) => setFormData({ ...formData, reminderTime: value })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes avant</SelectItem>
                      <SelectItem value="15">15 minutes avant</SelectItem>
                      <SelectItem value="30">30 minutes avant</SelectItem>
                      <SelectItem value="60">1 heure avant</SelectItem>
                      <SelectItem value="1440">1 jour avant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Afficher comme */}
              <div className="space-y-2">
                <Label htmlFor="status">Afficher comme</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="occupied">Occupé</SelectItem>
                    <SelectItem value="free">Libre</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="tentative">Tentatif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes / Description textarea */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes / Description</Label>
                <textarea
                  id="notes"
                  className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y"
                  placeholder="Ajouter des notes ou une description..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Audit section (read-only, shown only in edit mode) */}
              {isEditMode && (
                <div className="pt-4 border-t">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium">Dernière modification par :</span> Dr. Martin
                    </p>
                    <p>
                      <span className="font-medium">Établi le :</span> {new Date().toLocaleDateString("fr-FR")} à{" "}
                      {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Code couleur / Catégorie */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Code couleur / Catégorie *</Label>
                <div className="border rounded-lg p-3 bg-muted/30 max-h-[600px] overflow-y-auto">
                  <div className="space-y-1">
                    {appointmentTypes.map((type) => (
                      <div
                        key={type.id}
                        className="flex items-center space-x-3 p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedColor(type.color)
                          setSelectedType(type.id)
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded border-2 shrink-0"
                          style={{
                            backgroundColor: type.color,
                            borderColor: selectedColor === type.color ? "#000" : "transparent",
                          }}
                        />
                        <span className="text-sm">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Modifier codes couleur button */}
                <Button type="button" variant="outline" className="w-full mt-2 bg-transparent" size="sm">
                  Modifier codes couleur
                </Button>
              </div>

              {/* Aperçu */}
              <div className="space-y-2">
                <Label>Aperçu</Label>
                <div
                  className="h-24 rounded-lg border-2 flex items-center justify-center"
                  style={{ backgroundColor: selectedColor }}
                >
                  <span className="text-white font-semibold drop-shadow-lg text-sm">
                    {appointmentTypes.find((t) => t.id === selectedType)?.label || "Couleur sélectionnée"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 pt-6 border-t border-border/50 bg-linear-to-r from-muted/20 to-muted/10 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all"
              >
                <Calendar className="w-4 h-4" />
                Périodicité
              </Button>
              <div className="text-xs text-muted-foreground">
                <p>Tous les champs marqués * sont obligatoires</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="hover:bg-muted/50 transition-all"
              >
                Annuler
              </Button>
              {isEditMode && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="hover:bg-destructive/90 transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              )}
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all hover:scale-105 font-medium"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isEditMode ? "Modifier" : "Enregistrer"} le rendez-vous
              </Button>
            </div>
          </div>
        </form>
        )}
      </div>
    </DialogContent>
  </Dialog>
  )
}