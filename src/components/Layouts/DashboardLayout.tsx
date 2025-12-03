"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, Users, Calendar, FileText, CreditCard, Settings, LogOut, Search, Mail, Menu, Bell, ChevronDown, Sun, Moon, Monitor, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState("light")
  const [notifications, setNotifications] = useState(3)

  const navItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: LayoutDashboard, 
      href: "/dashboard",
      badge: null
    },
    { 
      id: "patients", 
      label: "Patients", 
      icon: Users, 
      href: "/patients",
      badge: "124"
    },
    { 
      id: "appointments", 
      label: "Rendez-vous", 
      icon: Calendar, 
      href: "/appointments",
      badge: "12"
    },
    { 
      id: "messages", 
      label: "Messagerie", 
      icon: Mail, 
      href: "/messages",
      badge: "5"
    },
    { 
      id: "billing", 
      label: "Facturation", 
      icon: CreditCard, 
      href: "/billing",
      badge: null
    },
    { 
      id: "settings", 
      label: "Paramètres", 
      icon: Settings, 
      href: "/settings",
      badge: null
    },
  ]

  const quickActions = [
    { label: "Nouveau patient", icon: Users, href: "/patients/new" },
    { label: "Nouveau RDV", icon: Calendar, href: "/appointments/new" },
    { label: "Nouvelle facture", icon: CreditCard, href: "/billing/new" },
  ]

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex flex-col h-full ${isMobile ? '' : 'bg-sidebar border-r border-sidebar-border shadow-soft'}`}>
      {/* Logo */}
      <div className="p-4 md:p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-primary via-primary/90 to-primary/80 rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-105">
            <img 
              src="/teeth.png" 
              alt="DentaDesk Logo" 
              className="w-6 h-6 md:w-7 md:h-7 object-contain filter brightness-0 invert"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-primary truncate">DentaCRM</h1>
            <p className="text-xs text-muted-foreground hidden md:block">Cabinet dentaire</p>
          </div>
        </Link>
      </div>

      {/* Quick Actions - Mobile only */}
      {isMobile && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="grid grid-cols-1 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <action.icon className="w-4 h-4" />
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 md:p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group w-full flex items-center justify-between px-3 md:px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-primary' : ''
                }`} />
                <span className="font-medium truncate text-sm md:text-base">{item.label}</span>
              </div>
              {item.badge && (
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-0.5 ${
                    isActive 
                      ? 'bg-primary/20 text-primary border-primary/30' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Status - Desktop only */}
      {!isMobile && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-300">Statut: En ligne</span>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              Cabinet ouvert • 12 RDV aujourd'hui
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="p-3 md:p-4 border-t border-sidebar-border">
        <Link href="/">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 transition-all group"
          >
            <LogOut className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
            <span className="font-medium">Déconnexion</span>
          </Button>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-linear-to-br from-background to-muted/20 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0 bg-sidebar">
          <SidebarContent isMobile={true} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Enhanced Header */}
        <header className="bg-card/95 backdrop-blur-sm border-b border-border px-4 md:px-6 lg:px-8 py-4 shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden p-2 hover:bg-accent/80"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
            </Sheet>

            {/* Search */}
            <div className="flex-1 max-w-lg xl:max-w-xl">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type="search"
                  placeholder="Rechercher un patient, RDV..."
                  className="pl-10 md:pl-12 h-10 md:h-11 bg-secondary/50 border-input/60 focus:border-primary/40 focus:bg-background transition-all text-sm md:text-base"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Quick Actions - Desktop */}
              <div className="hidden xl:flex items-center gap-1">
                {quickActions.slice(0, 2).map((action) => (
                  <Link key={action.label} href={action.href}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 h-9 px-3 hover:bg-accent/80 transition-all hover:scale-105"
                    >
                      <action.icon className="w-4 h-4" />
                      <span className="hidden 2xl:inline">{action.label}</span>
                    </Button>
                  </Link>
                ))}
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative p-2 hover:bg-accent/80 transition-all">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] animate-pulse"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* User Profile */}
              <div className="flex items-center gap-2 md:gap-3 ml-2">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-foreground">Dr. Martin Dupont</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-xs text-muted-foreground">En consultation</p>
                  </div>
                </div>
                <Button variant="ghost" className="p-1 h-auto hover:bg-accent/80 rounded-lg transition-all group">
                  <Avatar className="w-9 h-9 md:w-10 md:h-10 ring-2 ring-border group-hover:ring-primary/30 transition-all">
                    <AvatarImage src="/caring-doctor.png" className="object-cover" />
                    <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-white text-sm font-semibold">
                      DM
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-3 h-3 text-muted-foreground ml-1 hidden md:block transition-transform group-hover:rotate-180" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Page Content */}
        <main className="flex-1 overflow-y-auto bg-linear-to-br from-background via-background to-muted/10">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}