"use client"

import { type User, getUsers } from "./store"

export const login = (email: string, password: string): User | null => {
  const users = getUsers()
  const user = users.find((u) => u.email === email && u.password === password)
  if (user) {
    localStorage.setItem("dayflow_current_user", JSON.stringify(user))
    return user
  }
  return null
}

export const logout = () => {
  localStorage.removeItem("dayflow_current_user")
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("dayflow_current_user")
  return stored ? JSON.parse(stored) : null
}

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}

export const isAdmin = (): boolean => {
  const user = getCurrentUser()
  return user?.role === "admin"
}
