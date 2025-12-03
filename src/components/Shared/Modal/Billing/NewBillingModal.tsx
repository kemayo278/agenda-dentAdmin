"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, ChevronRight } from "lucide-react"

interface BillingModalProps {
  isOpen: boolean
  onClose: () => void
  attestation: any
}

export default function NewBillingModal({ isOpen, onClose, attestation }: BillingModalProps) {
  const [priceChoice, setPriceChoice] = useState("no-tm")
  const [sendMethod, setSendMethod] = useState("efact")
  const [thirdPartyPayment, setThirdPartyPayment] = useState("totality")
  const [treatmentReason, setTreatmentReason] = useState("other")
  const [patientPaymentMethod, setPatientPaymentMethod] = useState("bank-transfer")
  const [insurerSelection, setInsurerSelection] = useState("")

  const [amounts, setAmounts] = useState({
    fee: 28.84,
    intervention: 28.84,
    tm: 0.0,
    supplements: 0.0,
    patientPays: 0.0,
    insurerPays: 0.0,
    mutualityEfact: 28.84,
  })

  // Mock patient data
  const patientInfo = {
    name: "MAKHALFI Walid",
    birthDate: "27/01/1988",
    age: 37,
    bim: false,
    tierPayant: true,
    insuranceStartDate: "06/07/2025",
    insuranceEndDate: "31/12/2025",
    managingDoctor: "CHDLAOUI NORA",
    doctorId: "1-00155-59-004",
  }

  // Mock prestations data
  const [prestations, setPrestations] = useState([
    {
      code: "101076",
      date: "25/10/2025",
      relatedPrestation: "",
      sendMethodChoice: "efact",
      fee: 28.84,
      intervention: 28.84,
      tm: 0.0,
      supplements: 0.0,
      status: "",
    },
  ])

  useEffect(() => {
    const baseFee = 28.84
    const newAmounts = { ...amounts }

    switch (priceChoice) {
      case "official":
        newAmounts.fee = baseFee
        newAmounts.intervention = baseFee * 0.75
        newAmounts.tm = baseFee * 0.25
        newAmounts.patientPays = newAmounts.tm
        newAmounts.mutualityEfact = newAmounts.intervention
        break
      case "no-tm":
        newAmounts.fee = baseFee
        newAmounts.intervention = baseFee
        newAmounts.tm = 0.0
        newAmounts.patientPays = 0.0
        newAmounts.mutualityEfact = baseFee
        break
      case "rounded":
        newAmounts.fee = Math.round(baseFee)
        newAmounts.intervention = Math.round(baseFee * 0.75)
        newAmounts.tm = Math.round(baseFee * 0.25)
        newAmounts.patientPays = newAmounts.tm
        newAmounts.mutualityEfact = newAmounts.intervention
        break
      case "custom":
        // Keep current values for custom
        break
      case "special-requirements":
        newAmounts.fee = baseFee
        newAmounts.intervention = baseFee
        newAmounts.tm = 0.0
        newAmounts.patientPays = 0.0
        newAmounts.mutualityEfact = baseFee
        break
    }

    setAmounts(newAmounts)
  }, [priceChoice, sendMethod, thirdPartyPayment])

  const handleConsultETar = () => {
    // Open eTar consultation modal or window
    window.open("https://www.inami.fgov.be/fr/nomenclature", "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <DialogTitle className="text-xl font-semibold text-foreground truncate">{patientInfo.name}</DialogTitle>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-muted-foreground">Patient BIM:</span>
                  <Badge variant={patientInfo.bim ? "default" : "outline"} className="font-medium truncate">
                    {patientInfo.bim ? "Oui" : "Non"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-muted-foreground">Tiers Payant:</span>
                  <Badge
                    variant={patientInfo.tierPayant ? "default" : "outline"}
                    className="font-medium bg-amber-100 text-amber-700 border-amber-200 truncate"
                  >
                    {patientInfo.tierPayant ? "Oui" : "Non"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-muted-foreground">Date d'assurabilité:</span>
                  <span className="font-medium text-foreground truncate">
                    {patientInfo.insuranceStartDate} → {patientInfo.insuranceEndDate}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right sm:text-right min-w-0">
              <div className="text-xs text-muted-foreground mb-1">Gestionnaire du DMG:</div>
              <div className="font-semibold text-sm text-foreground truncate">{patientInfo.managingDoctor}</div>
              <div className="text-xs text-muted-foreground truncate">({patientInfo.doctorId})</div>
            </div>
          </div>
        </DialogHeader>

        {/* <div className="grid grid-cols-2 gap-6 py-4"> */}
          {/* Left column - Main content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-base text-foreground">Choix du prix</h3>
              <RadioGroup value={priceChoice} onValueChange={setPriceChoice} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="official" id="official" />
                  <Label htmlFor="official" className="cursor-pointer font-normal">
                    Prix officiel
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-tm" id="no-tm" />
                  <Label htmlFor="no-tm" className="cursor-pointer font-normal">
                    Pas de ticket modérateur
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rounded" id="rounded" />
                  <Label htmlFor="rounded" className="cursor-pointer font-normal">
                    Prix arrondi
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="cursor-pointer font-normal">
                    Prix personnalisé
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="special-requirements" id="special-requirements" />
                  <Label htmlFor="special-requirements" className="cursor-pointer font-normal">
                    Patient avec exigences particulières
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-base text-foreground bg-muted/30 px-3 py-2 rounded">
                Choix de la méthode d'envoi
              </h3>
            </div>

            <div className="border rounded-lg w-[98%] overflow-x-auto">
              <Table className="">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[100px]">Code</TableHead>
                    {/* <TableHead className="w-[120px]">Date</TableHead> */}
                    <TableHead className="w-[150px]">Prestation relative</TableHead>
                    <TableHead className="text-center w-[80]">eFact</TableHead>
                    <TableHead className="text-center w-[80]">eAttest</TableHead>
                    <TableHead className="text-center w-[80]">Papier</TableHead>
                    <TableHead className="text-right w-[100]">Honoraire</TableHead>
                    <TableHead className="text-right w-[100]">Intervention</TableHead>
                    <TableHead className="text-right w-[80]">TM</TableHead>
                    <TableHead className="text-right w-[100px]">Suppléments</TableHead>
                    <TableHead className="w-[80]">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prestations.map((prestation, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{prestation.code}</TableCell>
                      {/* <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{prestation.date}</span>
                        </div>
                      </TableCell> */}
                      <TableCell>
                        <Select value={prestation.relatedPrestation}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center">
                        <RadioGroup
                          value={prestation.sendMethodChoice}
                          onValueChange={(value) => {
                            const newPrestations = [...prestations]
                            newPrestations[index].sendMethodChoice = value
                            setPrestations(newPrestations)
                            setSendMethod(value)
                          }}
                        >
                          <RadioGroupItem value="efact" className="mx-auto" />
                        </RadioGroup>
                      </TableCell>
                      <TableCell className="text-center">
                        <RadioGroup
                          value={prestation.sendMethodChoice}
                          onValueChange={(value) => {
                            const newPrestations = [...prestations]
                            newPrestations[index].sendMethodChoice = value
                            setPrestations(newPrestations)
                            setSendMethod(value)
                          }}
                        >
                          <RadioGroupItem value="eattest" className="mx-auto" />
                        </RadioGroup>
                      </TableCell>
                      <TableCell className="text-center">
                        <RadioGroup
                          value={prestation.sendMethodChoice}
                          onValueChange={(value) => {
                            const newPrestations = [...prestations]
                            newPrestations[index].sendMethodChoice = value
                            setPrestations(newPrestations)
                            setSendMethod(value)
                          }}
                        >
                          <RadioGroupItem value="paper" className="mx-auto" />
                        </RadioGroup>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold bg-pink-100 text-pink-700 px-2 py-1 rounded text-sm">
                          {amounts.fee.toFixed(2)}€
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold bg-pink-100 text-pink-700 px-2 py-1 rounded text-sm">
                          {amounts.intervention.toFixed(2)}€
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium bg-cyan-50 text-cyan-700 px-2 py-1 rounded text-sm">
                          {amounts.tm.toFixed(2)}€
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium bg-cyan-50 text-cyan-700 px-2 py-1 rounded text-sm">
                          {amounts.supplements.toFixed(2)}€
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{prestation.status || "-"}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/30 font-semibold">
                    <TableCell colSpan={6} className="text-right">
                      TOTAL
                    </TableCell>
                    <TableCell className="text-right">{amounts.fee.toFixed(2)}€</TableCell>
                    <TableCell className="text-right">{amounts.intervention.toFixed(2)}€</TableCell>
                    <TableCell className="text-right">{amounts.tm.toFixed(2)}€</TableCell>
                    <TableCell className="text-right">{amounts.supplements.toFixed(2)}€</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-foreground">Prise en charge par un organisme payeur tiers</h3>
                <RadioGroup value={thirdPartyPayment} onValueChange={setThirdPartyPayment} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="tp-none" />
                    <Label htmlFor="tp-none" className="cursor-pointer font-normal text-sm">
                      Pas de prise en charge
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="totality" id="tp-totality" />
                    <Label htmlFor="tp-totality" className="cursor-pointer font-normal text-sm">
                      Totalité
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tm-only" id="tp-tm" />
                    <Label htmlFor="tp-tm" className="cursor-pointer font-normal text-sm">
                      Ticket modérateur seul
                    </Label>
                  </div>
                  <Button variant="link" className="h-auto p-0 text-sm text-primary">
                    Plus d'infos <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-foreground">Raison du traitement</h3>
                <RadioGroup value={treatmentReason} onValueChange={setTreatmentReason} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="reason-other" />
                    <Label htmlFor="reason-other" className="cursor-pointer font-normal text-sm">
                      Autre
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="chemo" id="reason-chemo" />
                    <Label htmlFor="reason-chemo" className="cursor-pointer font-normal text-sm">
                      Traitement chimiothérapie ambulant
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="professional" id="reason-professional" />
                    <Label htmlFor="reason-professional" className="cursor-pointer font-normal text-sm">
                      Maladies professionnelles
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="work-accident" id="reason-work" />
                    <Label htmlFor="reason-work" className="cursor-pointer font-normal text-sm">
                      Accidents de travail
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="common-law" id="reason-common" />
                    <Label htmlFor="reason-common" className="cursor-pointer font-normal text-sm">
                      Accidents - droits communs (responsabilité de tiers)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other-accidents" id="reason-accidents" />
                    <Label htmlFor="reason-accidents" className="cursor-pointer font-normal text-sm">
                      Autres accidents
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-sm text-foreground">Montant payé par</h3>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Le patient</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={`${amounts.patientPays.toFixed(2)} €`}
                    readOnly
                    className="flex-1 bg-background font-semibold"
                  />
                </div>
                <Select value={patientPaymentMethod} onValueChange={setPatientPaymentMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank-transfer">Virement bancaire</SelectItem>
                    <SelectItem value="cash">Liquide</SelectItem>
                    <SelectItem value="bancontact">Bancontact</SelectItem>
                    <SelectItem value="credit-card">Carte de crédit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">L'organisme payeur</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={`${amounts.insurerPays.toFixed(2)} €`}
                    readOnly
                    className="flex-1 bg-background font-semibold"
                  />
                </div>
                <Select value={insurerSelection} onValueChange={setInsurerSelection}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un OP" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">Mutualité Chrétienne</SelectItem>
                    <SelectItem value="ml">Mutualité Libérale</SelectItem>
                    <SelectItem value="ms">Mutualité Socialiste</SelectItem>
                    <SelectItem value="mn">Mutualité Neutre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Mutualité - eFact</Label>
                <div className="bg-pink-100 text-pink-700 rounded-md px-3 py-2 font-bold text-lg text-center">
                  {amounts.mutualityEfact.toFixed(2)} €
                </div>
              </div>
            </div>
          </div>
        {/* </div> */}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Retour
          </Button>
          <div className="flex gap-2">
            <Button
              variant="warning"
              className="text-white bg-amber-500"
              onClick={handleConsultETar}
            >
              Consulter eTar
            </Button>
            <Button variant={'primary'} className=" text-white">Valider</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
