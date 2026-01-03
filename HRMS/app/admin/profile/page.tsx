"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Shield } from "lucide-react"

export default function AdminProfile() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    } else if (!isLoading && user?.role !== "admin") {
      router.push("/employee/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-(--color-background)">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-(--color-text-primary) mb-2">My Profile</h1>
          <p className="text-(--color-text-secondary)">Administrator account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-1">
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                <AvatarImage
                  src={user.profilePicture || "/placeholder.svg"}
                  alt={`${user.firstName} ${user.lastName}`}
                />
                <AvatarFallback className="bg-(--color-primary) text-white text-4xl">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-(--color-text-primary) text-center mt-4">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-(--color-text-secondary) text-center">{user.designation}</p>
              <div className="mt-2 px-3 py-1 bg-(--color-primary) bg-opacity-10 rounded-full flex items-center gap-2">
                <Shield className="w-4 h-4 text-(--color-primary)" />
                <span className="text-sm font-medium text-(--color-primary)">Administrator</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-(--color-text-primary) mb-6">Personal Information</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-(--color-muted) rounded-lg">
                <User className="w-5 h-5 text-(--color-text-secondary)" />
                <div className="flex-1">
                  <p className="text-xs text-(--color-text-secondary)">Full Name</p>
                  <p className="text-sm font-medium text-(--color-text-primary)">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-(--color-muted) rounded-lg">
                <Mail className="w-5 h-5 text-(--color-text-secondary)" />
                <div className="flex-1">
                  <p className="text-xs text-(--color-text-secondary)">Email</p>
                  <p className="text-sm font-medium text-(--color-text-primary)">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-(--color-muted) rounded-lg">
                <Phone className="w-5 h-5 text-(--color-text-secondary)" />
                <div className="flex-1">
                  <p className="text-xs text-(--color-text-secondary)">Phone</p>
                  <p className="text-sm font-medium text-(--color-text-primary)">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-(--color-muted) rounded-lg">
                <MapPin className="w-5 h-5 text-(--color-text-secondary)" />
                <div className="flex-1">
                  <p className="text-xs text-(--color-text-secondary)">Address</p>
                  <p className="text-sm font-medium text-(--color-text-primary)">{user.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-(--color-muted) rounded-lg">
                <Briefcase className="w-5 h-5 text-(--color-text-secondary)" />
                <div className="flex-1">
                  <p className="text-xs text-(--color-text-secondary)">Department & Designation</p>
                  <p className="text-sm font-medium text-(--color-text-primary)">
                    {user.designation} - {user.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-(--color-muted) rounded-lg">
                <Calendar className="w-5 h-5 text-(--color-text-secondary)" />
                <div className="flex-1">
                  <p className="text-xs text-(--color-text-secondary)">Join Date</p>
                  <p className="text-sm font-medium text-(--color-text-primary)">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
