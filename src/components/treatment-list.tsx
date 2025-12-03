"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, StickyNote } from "lucide-react"

export default function TreatmentList() {
  const treatments = [
    {
      id: 1,
      tooth: "16",
      code: "305",
      color: "cyan",
      date: "15/03/2024",
      attestation: "Envoyée",
      category: "Endodontie",
      therapeutic: "Dévitalisation",
      notes: "Traitement en 2 séances",
      practitioner: "Dr. Halopian",
      suggestedPrice: "250.00",
      reimbursement: "180.00",
      patientShare: "70.00",
      reminder: "15/09/2024",
      lab: "-",
      tariff: "250.00",
      ic: "E01",
    },
    {
      id: 2,
      tooth: "26",
      code: "371",
      color: "pink",
      date: "10/03/2024",
      attestation: "En attente",
      category: "Prothèse",
      therapeutic: "Couronne céramique",
      notes: "Empreinte prise",
      practitioner: "Dr. Halopian",
      suggestedPrice: "650.00",
      reimbursement: "200.00",
      patientShare: "450.00",
      reminder: "24/03/2024",
      lab: "Labo Dentaire Pro",
      tariff: "650.00",
      ic: "P12",
    },
    {
      id: 3,
      tooth: "46",
      code: "304",
      color: "cyan",
      date: "05/03/2024",
      attestation: "Envoyée",
      category: "Prévention",
      therapeutic: "Détartrage",
      notes: "Détartrage complet",
      practitioner: "Dr. Kahlaoui",
      suggestedPrice: "80.00",
      reimbursement: "60.00",
      patientShare: "20.00",
      reminder: "05/09/2024",
      lab: "-",
      tariff: "80.00",
      ic: "P01",
    },
  ]

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      cyan: "bg-cyan-500",
      pink: "bg-pink-500",
      yellow: "bg-yellow-500",
      green: "bg-green-500",
      red: "bg-red-500",
    }
    return colors[color] || "bg-gray-500"
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Liste des traitements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Dent</TableHead>
                <TableHead className="w-16">Code</TableHead>
                <TableHead className="w-12">Couleur</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Attestation</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Thérapeutique</TableHead>
                <TableHead>Remarque</TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead>Praticien</TableHead>
                <TableHead className="text-right">Prix suggéré</TableHead>
                <TableHead className="text-right">Rembours.</TableHead>
                <TableHead className="text-right">Ticket mod.</TableHead>
                <TableHead>Rappel</TableHead>
                <TableHead>Labo</TableHead>
                <TableHead className="text-right">Tarif</TableHead>
                <TableHead>IC</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatments.map((treatment) => (
                <TableRow key={treatment.id}>
                  <TableCell className="font-medium">{treatment.tooth}</TableCell>
                  <TableCell>{treatment.code}</TableCell>
                  <TableCell>
                    <div className={`w-6 h-6 rounded ${getColorClass(treatment.color)}`} />
                  </TableCell>
                  <TableCell className="text-sm">{treatment.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={treatment.attestation === "Envoyée" ? "default" : "secondary"}
                      className={
                        treatment.attestation === "Envoyée"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {treatment.attestation}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{treatment.category}</TableCell>
                  <TableCell className="text-sm">{treatment.therapeutic}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{treatment.notes}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <StickyNote className="w-4 h-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-sm">{treatment.practitioner}</TableCell>
                  <TableCell className="text-right text-sm">€{treatment.suggestedPrice}</TableCell>
                  <TableCell className="text-right text-sm">€{treatment.reimbursement}</TableCell>
                  <TableCell className="text-right text-sm">€{treatment.patientShare}</TableCell>
                  <TableCell className="text-sm">{treatment.reminder}</TableCell>
                  <TableCell className="text-sm">{treatment.lab}</TableCell>
                  <TableCell className="text-right font-medium">€{treatment.tariff}</TableCell>
                  <TableCell className="text-sm">{treatment.ic}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
