"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  signup: (data: SignupData) => Promise<boolean>
  isLoading: boolean
}

interface SignupData {
  email: string
  password: string
  firstName: string
  lastName: string
  employeeId: string
  department: string
  designation: string
  phone: string
  address: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("dayflow_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("dayflow_users") || "[]")
    const foundUser = users.find((u: User) => u.email === email && u.password === password)

    if (foundUser) {
      if (!foundUser.accountApproved && foundUser.role === "employee") {
        alert("Your account is pending admin approval")
        return false
      }
      setUser(foundUser)
      localStorage.setItem("dayflow_user", JSON.stringify(foundUser))
      return true
    }
    return false
  }

  const signup = async (data: SignupData): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("dayflow_users") || "[]")

    if (users.find((u: User) => u.email === data.email)) {
      alert("Email already exists")
      return false
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      role: "employee",
      department: data.department as any,
      designation: data.designation as any,
      salary: 50000,
      accountApproved: false,
      joinDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("dayflow_users", JSON.stringify(users))

    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("dayflow_user")
  }

  return <AuthContext.Provider value={{ user, login, logout, signup, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
