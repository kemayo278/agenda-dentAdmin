export interface User{
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    role: string
    isActive?: boolean
    avatar?: string
    company?: string
    createdAt?: string
}