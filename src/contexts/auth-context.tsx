"use client"
import { useToast } from "@/hooks/use-toast"
import { AxiosClient } from "@/lib/axiosClient"
import { User } from "@/types/User"
import { useRouter } from "next/navigation"
import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface AuthContextType {
  user: User | null
  users: User[]
  login: (userId: string, password?: string) => Promise<{ success?: boolean; message?: string; token?: string | null }>;
  logout: () => void
  forgotPassword?: (email : string) => Promise<{ success?: boolean; message?: string }>;
  isLoading: boolean
  isLoadingAuth?: boolean
  checkAuth?: () => void
  loadUsers: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data: response } = await AxiosClient.get("/users")
      const { success, data } = response
      
      if (success && data) {
        setUsers(data)
      }
    } catch (error) {
      console.error("Error loading users:", error)
      setUsers([
        {
          id: "1",
          firstName: "Dr. Martin",
          lastName: "Dupont",
          email: "martin.dupont@dentadesk.com",
          role: "dentist",
          avatar: "/caring-doctor.png",
          isActive: true
        },
        {
          id: "2", 
          firstName: "Dr. Sophie",
          lastName: "Bernard",
          email: "sophie.bernard@dentadesk.com",
          role: "dentist",
          avatar: "/diverse-woman-portrait.png",
          isActive: true
        },
        {
          id: "3",
          firstName: "Ana",
          lastName: "Kahlaoui", 
          email: "ana.kahlaoui@dentadesk.com",
          role: "assistant",
          avatar: "/diverse-group-women.png",
          isActive: true
        }
      ])
    }
  }

  const checkAuth = async () => {
    try {
      const savedUser = localStorage.getItem("currentUser")
      const savedToken = localStorage.getItem("accessToken")
      
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser))
        setAccessToken(savedToken)
      } else {
        setUser(null)
        setAccessToken(null)
        
        // Rediriger seulement si on est sur une page protégée
        const currentPath = window.location.pathname
        const isProtectedRoute = !["/", "/auth/login", "/auth/register", "/auth/forgot-password"].includes(currentPath)
        
        if (isProtectedRoute) {
          router.push("/")
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      setUser(null)
      setAccessToken(null)
    } finally {
      setIsLoadingAuth(false)
    }
  }

  const login = async (userId: string, password?: string) => {
    try {
      setIsLoading(true)
      console.log('[Auth] Starting login process with user ID...');

      // Vérifier si l'utilisateur existe dans la liste
      const selectedUser = users.find(u => u.id === userId)
      if (!selectedUser) {
        throw new Error("Utilisateur non trouvé")
      }

      if (!selectedUser.isActive) {
        throw new Error("Compte utilisateur désactivé")
      }

      // Tentative de connexion avec l'API
      const { data: loginResponse } = await AxiosClient.post("/login", { 
        userId, 
        password: password || undefined 
      });
      const { success, data, message } = loginResponse;      

      if (!success) {
        throw new Error(message || "Login failed");
      }
        
      const { token: accessToken, user: userData } = data;
      setAccessToken(accessToken);
      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("accessToken", accessToken);
      
      toast({ 
        title: "Succès", 
        description: "Connexion réussie", 
        variant: "success"
      })
      
      toast({ 
        title: "Bienvenue", 
        description: `Bonjour Dr. ${userData.firstName} ${userData.lastName}`, 
        variant: "primary"
      })

      console.log('[Auth] User and access token set successfully.');
      return { success: true, token: accessToken };

    } catch (error : any) {
      const response = error.response;
      const message = response?.data?.message || error.message || process.env.NEXT_PUBLIC_ERROR_CONNECTION as string;
      
      toast({ 
        title: "Erreur de connexion", 
        description: message, 
        variant: "destructive"
      })        
      
      return { success: false, message };
    } finally {
      setIsLoading(false)
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true)
      console.log('[Auth] Starting forgot password process...');
        
      const { data: response } = await AxiosClient.post("/forgot-password", { email });
      const { success } = response;
      if (!success) {
        throw new Error("Forgot password request failed");
      }

      toast({ title: "Succès", description: "Un email de réinitialisation a été envoyé si l'adresse est valide.", variant: "success"})
      console.log('[Auth] Forgot password request successful.');
      return { success: true };

    } catch (error : any) {
      const response = error.response;
      const message = response?.data?.message || error.message || process.env.NEXT_PUBLIC_ERROR_CONNECTION as string;
      toast({ title: "Erreur", description: message, variant: "destructive"})        
      return { success: false };
    }finally{
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
    localStorage.removeItem("accessToken")
    
    toast({ 
      title: "Déconnexion", 
      description: "Vous avez été déconnecté avec succès.", 
      variant: "primary"
    })
    
    window.location.href = "/"
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        users,
        login, 
        logout, 
        isLoading, 
        forgotPassword, 
        checkAuth, 
        isLoadingAuth,
        loadUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}