"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { isAuthenticated, isAdmin } from "@/lib/auth"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/")
    } else if (!isAdmin()) {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar isAdmin />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
