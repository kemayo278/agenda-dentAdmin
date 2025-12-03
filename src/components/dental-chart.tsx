"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X } from "lucide-react"

interface ToothStatus {
  number: number
  status: "healthy" | "treated" | "problem" | "missing"
  treatments: Array<{
    id: string
    type: string
    date: string
    notes: string
  }>
}

export default function DentalChart() {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [treatmentType, setTreatmentType] = useState("")
  const [treatmentNotes, setTreatmentNotes] = useState("")

  // Initialize teeth status (32 teeth)
  const [teethStatus, setTeethStatus] = useState<ToothStatus[]>(
    Array.from({ length: 32 }, (_, i) => ({
      number: i + 1,
      status: i === 5 || i === 12 ? "treated" : i === 20 ? "problem" : "healthy",
      treatments: [],
    })),
  )

  const treatmentTypes = [
    "Carie",
    "Plombage",
    "Couronne",
    "Extraction",
    "Détartrage",
    "Blanchiment",
    "Implant",
    "Bridge",
    "Dévitalisation",
    "Autre",
  ]

  const handleToothClick = (toothNumber: number) => {
    setSelectedTooth(toothNumber)
    setIsDialogOpen(true)
  }

  const handleAddTreatment = () => {
    if (!selectedTooth || !treatmentType) return

    const newTreatment = {
      id: Date.now().toString(),
      type: treatmentType,
      date: new Date().toLocaleDateString("fr-FR"),
      notes: treatmentNotes,
    }

    setTeethStatus((prev) =>
      prev.map((tooth) =>
        tooth.number === selectedTooth
          ? {
              ...tooth,
              status: "treated",
              treatments: [...tooth.treatments, newTreatment],
            }
          : tooth,
      ),
    )

    setTreatmentType("")
    setTreatmentNotes("")
    setIsDialogOpen(false)
  }

  const handleMarkHealthy = () => {
    if (!selectedTooth) return
    setTeethStatus((prev) =>
      prev.map((tooth) => (tooth.number === selectedTooth ? { ...tooth, status: "healthy" } : tooth)),
    )
    setIsDialogOpen(false)
  }

  const handleMarkProblem = () => {
    if (!selectedTooth) return
    setTeethStatus((prev) =>
      prev.map((tooth) => (tooth.number === selectedTooth ? { ...tooth, status: "problem" } : tooth)),
    )
    setIsDialogOpen(false)
  }

  const handleMarkMissing = () => {
    if (!selectedTooth) return
    setTeethStatus((prev) =>
      prev.map((tooth) => (tooth.number === selectedTooth ? { ...tooth, status: "missing" } : tooth)),
    )
    setIsDialogOpen(false)
  }

  const getToothColor = (status: ToothStatus["status"]) => {
    switch (status) {
      case "healthy":
        return "bg-white border-gray-300 hover:border-blue-400"
      case "treated":
        return "bg-blue-100 border-blue-400 hover:border-blue-600"
      case "problem":
        return "bg-red-100 border-red-400 hover:border-red-600"
      case "missing":
        return "bg-gray-200 border-gray-400 hover:border-gray-600"
    }
  }

  const selectedToothData = teethStatus.find((t) => t.number === selectedTooth)

  // Split teeth into quadrants
  const upperRight = teethStatus.slice(0, 8).reverse() // 8-1
  const upperLeft = teethStatus.slice(8, 16) // 9-16
  const lowerRight = teethStatus.slice(16, 24).reverse() // 24-17
  const lowerLeft = teethStatus.slice(24, 32) // 25-32

  return (
    <div className="space-y-6">
      {/* Legend */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded" />
              <span className="text-sm text-gray-700">Saine</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 border-2 border-blue-400 rounded" />
              <span className="text-sm text-gray-700">Traitée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 border-2 border-red-400 rounded" />
              <span className="text-sm text-gray-700">Problème</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 border-2 border-gray-400 rounded" />
              <span className="text-sm text-gray-700">Manquante</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dental Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Carte Dentaire Interactive</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-12 overflow-x-auto min-w-0">
            {/* Upper Jaw */}
            <div className="space-y-4">
              <div className="text-center text-sm font-medium text-gray-500 mb-4">Mâchoire Supérieure</div>
              <div className="flex justify-center gap-8 min-w-max">
                {/* Upper Right Quadrant */}
                <div className="flex gap-2">
                  {upperRight.map((tooth) => (
                    <button
                      key={tooth.number}
                      onClick={() => handleToothClick(tooth.number)}
                      className={`w-12 h-16 border-2 rounded-lg transition-all ${getToothColor(
                        tooth.status,
                      )} flex flex-col items-center justify-center cursor-pointer flex-shrink-0`}
                    >
                      <span className="text-xs font-semibold text-gray-700">{tooth.number}</span>
                      {tooth.status === "treated" && <Check className="w-4 h-4 text-blue-600 mt-1" />}
                      {tooth.status === "problem" && <X className="w-4 h-4 text-red-600 mt-1" />}
                    </button>
                  ))}
                </div>

                {/* Center Line */}
                <div className="w-px bg-gray-300 flex-shrink-0" />

                {/* Upper Left Quadrant */}
                <div className="flex gap-2">
                  {upperLeft.map((tooth) => (
                    <button
                      key={tooth.number}
                      onClick={() => handleToothClick(tooth.number)}
                      className={`w-12 h-16 border-2 rounded-lg transition-all ${getToothColor(
                        tooth.status,
                      )} flex flex-col items-center justify-center cursor-pointer flex-shrink-0`}
                    >
                      <span className="text-xs font-semibold text-gray-700">{tooth.number}</span>
                      {tooth.status === "treated" && <Check className="w-4 h-4 text-blue-600 mt-1" />}
                      {tooth.status === "problem" && <X className="w-4 h-4 text-red-600 mt-1" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Jaw Separator */}
            <div className="border-t-2 border-gray-300 min-w-max" />

            {/* Lower Jaw */}
            <div className="space-y-4">
              <div className="flex justify-center gap-8 min-w-max">
                {/* Lower Right Quadrant */}
                <div className="flex gap-2">
                  {lowerRight.map((tooth) => (
                    <button
                      key={tooth.number}
                      onClick={() => handleToothClick(tooth.number)}
                      className={`w-12 h-16 border-2 rounded-lg transition-all ${getToothColor(
                        tooth.status,
                      )} flex flex-col items-center justify-center cursor-pointer flex-shrink-0`}
                    >
                      <span className="text-xs font-semibold text-gray-700">{tooth.number}</span>
                      {tooth.status === "treated" && <Check className="w-4 h-4 text-blue-600 mt-1" />}
                      {tooth.status === "problem" && <X className="w-4 h-4 text-red-600 mt-1" />}
                    </button>
                  ))}
                </div>

                {/* Center Line */}
                <div className="w-px bg-gray-300 flex-shrink-0" />

                {/* Lower Left Quadrant */}
                <div className="flex gap-2">
                  {lowerLeft.map((tooth) => (
                    <button
                      key={tooth.number}
                      onClick={() => handleToothClick(tooth.number)}
                      className={`w-12 h-16 border-2 rounded-lg transition-all ${getToothColor(
                        tooth.status,
                      )} flex flex-col items-center justify-center cursor-pointer flex-shrink-0`}
                    >
                      <span className="text-xs font-semibold text-gray-700">{tooth.number}</span>
                      {tooth.status === "treated" && <Check className="w-4 h-4 text-blue-600 mt-1" />}
                      {tooth.status === "problem" && <X className="w-4 h-4 text-red-600 mt-1" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-center text-sm font-medium text-gray-500 mt-4">Mâchoire Inférieure</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tooth Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dent N°{selectedTooth}</DialogTitle>
            <DialogDescription>Gérer les traitements et l'état de la dent</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Current Status */}
            <div>
              <Label className="mb-2 block">État actuel</Label>
              <div className="flex gap-2">
                <Badge
                  variant={selectedToothData?.status === "healthy" ? "default" : "outline"}
                  className={
                    selectedToothData?.status === "healthy"
                      ? "bg-green-100 text-green-700 cursor-pointer"
                      : "cursor-pointer"
                  }
                  onClick={handleMarkHealthy}
                >
                  Saine
                </Badge>
                <Badge
                  variant={selectedToothData?.status === "problem" ? "default" : "outline"}
                  className={
                    selectedToothData?.status === "problem"
                      ? "bg-red-100 text-red-700 cursor-pointer"
                      : "cursor-pointer"
                  }
                  onClick={handleMarkProblem}
                >
                  Problème
                </Badge>
                <Badge
                  variant={selectedToothData?.status === "missing" ? "default" : "outline"}
                  className={
                    selectedToothData?.status === "missing"
                      ? "bg-gray-100 text-gray-700 cursor-pointer"
                      : "cursor-pointer"
                  }
                  onClick={handleMarkMissing}
                >
                  Manquante
                </Badge>
              </div>
            </div>

            {/* Previous Treatments */}
            {selectedToothData && selectedToothData.treatments.length > 0 && (
              <div>
                <Label className="mb-2 block">Traitements précédents</Label>
                <div className="space-y-2">
                  {selectedToothData.treatments.map((treatment) => (
                    <div key={treatment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{treatment.type}</span>
                        <span className="text-xs text-gray-500">{treatment.date}</span>
                      </div>
                      {treatment.notes && <p className="text-sm text-gray-600">{treatment.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Treatment */}
            <div className="border-t pt-4">
              <Label className="mb-3 block font-semibold">Ajouter un traitement</Label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="treatment-type">Type de traitement</Label>
                  <Select value={treatmentType} onValueChange={setTreatmentType}>
                    <SelectTrigger id="treatment-type">
                      <SelectValue placeholder="Sélectionner un traitement" />
                    </SelectTrigger>
                    <SelectContent>
                      {treatmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="treatment-notes">Notes</Label>
                  <Textarea
                    id="treatment-notes"
                    placeholder="Notes sur le traitement..."
                    value={treatmentNotes}
                    onChange={(e) => setTreatmentNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Fermer
              </Button>
              <Button onClick={handleAddTreatment} className="bg-[#2563EB] hover:bg-[#1E40AF]">
                Enregistrer le traitement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
