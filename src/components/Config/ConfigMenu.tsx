import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Database, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfigMenuProps {
  onReconfigure: () => void
}

export function ConfigMenu({ onReconfigure }: ConfigMenuProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleReconfigure = () => {
    localStorage.removeItem('db-config')
    setShowConfirm(false)
    onReconfigure()
  }

  const getConnectionInfo = () => {
    try {
      const config = localStorage.getItem('db-config')
      if (config) {
        const parsed = JSON.parse(config)
        return {
          server: parsed.server,
          database: parsed.database,
          user: parsed.user
        }
      }
    } catch (err) {
      console.error('Erreur lecture config:', err)
    }
    return null
  }

  const connectionInfo = getConnectionInfo()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Base de données</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-2 py-1.5 text-sm font-medium">
            Connexion active
          </div>
          {connectionInfo && (
            <div className="px-2 py-1 text-xs text-muted-foreground space-y-1">
              <div>Serveur: {connectionInfo.server}</div>
              <div>Base: {connectionInfo.database}</div>
              <div>Utilisateur: {connectionInfo.user}</div>
            </div>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowConfirm(true)} className="text-orange-600">
            <Settings className="w-4 h-4 mr-2" />
            Reconfigurer la connexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Reconfigurer la base de données
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vous allez être redirigé vers la page de configuration pour modifier 
              les paramètres de connexion à la base de données.
              <br /><br />
              Ceci fermera votre session actuelle et vous devrez vous reconnecter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleReconfigure} className="bg-orange-600 hover:bg-orange-700">
              <LogOut className="w-4 h-4 mr-2" />
              Reconfigurer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}