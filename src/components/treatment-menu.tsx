"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import NewBillingModal from "./Shared/Modal/Billing/NewBillingModal"

export default function TreatmentMenu() {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedTreatment, setSelectedTreatment] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false)
  const [treatmentData, setTreatmentData] = useState<any>(null)

  const treatmentCategories = [
    {
      value: "consultation",
      label: "Consultation",
      treatments: [
        "Consultation à domicile",
        "Supplément urgence",
        "Absent prévenu",
        "Absent non prévenu",
        "Conseils par téléphone",
      ],
    },
    {
      value: "prevention",
      label: "Prévention",
      treatments: ["Détartrage", "Polissage", "Fluoration", "Scellement de sillons"],
    },
    {
      value: "extraction",
      label: "Extraction",
      treatments: ["Extraction simple", "Extraction chirurgicale", "Extraction dent de sagesse"],
    },
    {
      value: "endodontie",
      label: "Endodontie",
      treatments: ["Dévitalisation monoradiculée", "Dévitalisation pluriradiculée", "Retraitement canalaire"],
    },
    {
      value: "prothese",
      label: "Prothèse",
      treatments: ["Couronne céramique", "Bridge", "Prothèse amovible partielle", "Prothèse complète"],
    },
    {
      value: "couronne",
      label: "Couronne & Bridge",
      treatments: ["Couronne provisoire", "Couronne définitive", "Bridge 3 éléments", "Inlay/Onlay"],
    },
    {
      value: "radiographie",
      label: "Radiographie",
      treatments: ["Radio rétro-alvéolaire", "Radio panoramique", "Cone Beam CT"],
    },
    {
      value: "stomatologie",
      label: "Stomatologie",
      treatments: ["Biopsie", "Exérèse kyste", "Freinectomie"],
    },
    {
      value: "parodontologie",
      label: "Parodontologie",
      treatments: ["Surfaçage radiculaire", "Greffe gingivale", "Régénération osseuse"],
    },
    {
      value: "supplement",
      label: "Supplément",
      treatments: ["Anesthésie supplémentaire", "Digue", "Sédation consciente"],
    },
    {
      value: "prescription",
      label: "Prescription",
      treatments: ["Ordonnance antibiotiques", "Ordonnance antalgiques", "Ordonnance bain de bouche"],
    },
    {
      value: "personnel",
      label: "Traitement personnel",
      treatments: ["Traitement personnalisé"],
    },
  ]

  const handleTreatmentSelect = (treatment: string) => {
    setSelectedTreatment(treatment)
    setIsDialogOpen(true)
  }

  const handleAddTreatment = () => {
    const data = {
      treatment: selectedTreatment,
      category: selectedCategory,
      // Collect form data here
    }
    setTreatmentData(data)
    setIsDialogOpen(false)
    setIsBillingModalOpen(true)
  }

  const currentCategory = treatmentCategories.find((cat) => cat.value === selectedCategory)

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="category" className="text-xs mb-2 block">
                Catégorie de traitement
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Sélectionner une catégorie..." />
                </SelectTrigger>
                <SelectContent>
                  {treatmentCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && (
              <div className="flex-1">
                <Label htmlFor="treatment" className="text-xs mb-2 block">
                  Acte
                </Label>
                <Select value={selectedTreatment} onValueChange={handleTreatmentSelect}>
                  <SelectTrigger id="treatment">
                    <SelectValue placeholder="Sélectionner un acte..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currentCategory?.treatments.map((treatment) => (
                      <SelectItem key={treatment} value={treatment}>
                        {treatment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Treatment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un traitement</DialogTitle>
            <DialogDescription>{selectedTreatment}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tooth">Dent(s) concernée(s)</Label>
                <Input id="tooth" placeholder="Ex: 16, 17, 18" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" placeholder="Code mutuelle" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Couleur</Label>
                <Select>
                  <SelectTrigger id="color">
                    <SelectValue placeholder="Choisir une couleur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pink">Rose - Extraction</SelectItem>
                    <SelectItem value="cyan">Cyan - Obturation</SelectItem>
                    <SelectItem value="yellow">Jaune - Nouveau patient</SelectItem>
                    <SelectItem value="green">Vert - Prothèse</SelectItem>
                    <SelectItem value="red">Rouge - Urgence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix suggéré</Label>
                <Input id="price" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reimbursement">Remboursement</Label>
                <Input id="reimbursement" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-share">Ticket modérateur</Label>
                <Input id="patient-share" type="number" placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="practitioner">Praticien</Label>
              <Select>
                <SelectTrigger id="practitioner">
                  <SelectValue placeholder="Sélectionner un praticien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="halopian">Dr. Achat Halopian</SelectItem>
                  <SelectItem value="kahlaoui">Dr. Ana Kahlaoui</SelectItem>
                  <SelectItem value="nate">Dr. Berman Nate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Remarques</Label>
              <Textarea id="notes" placeholder="Notes sur le traitement..." rows={3} />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleAddTreatment}>
                <Plus className="w-4 h-4 mr-2" />
                Continuer vers la facturation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <NewBillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        attestation={treatmentData}
      />
    </>
  )
}
