"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProfileImageModal } from "@/components/profile-image-modal"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Edit,
  Save,
  X,
  Upload,
  TrendingUp,
} from "lucide-react"
import type { SalaryRequest } from "@/lib/types"

export default function EmployeeProfile() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showSalaryRequest, setShowSalaryRequest] = useState(false)
  const [editedUser, setEditedUser] = useState(user)
  const [salaryRequestData, setSalaryRequestData] = useState({
    requestedAmount: user?.salary || 0,
    reason: "",
    overtimeHours: 0,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    } else if (!isLoading && user?.role !== "employee") {
      router.push("/admin/dashboard")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      setEditedUser(user)
    }
  }, [user])

  if (isLoading || !user) {
    return null
  }

  const handleSave = () => {
    if (!editedUser) return

    const users = JSON.parse(localStorage.getItem("dayflow_users") || "[]")
    const updatedUsers = users.map((u: any) => (u.id === user.id ? editedUser : u))
    localStorage.setItem("dayflow_users", JSON.stringify(updatedUsers))
    localStorage.setItem("dayflow_user", JSON.stringify(editedUser))
    setIsEditing(false)
    window.location.reload()
  }

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditedUser({ ...editedUser!, profilePicture: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSalaryRequest = () => {
    const request: SalaryRequest = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: user.employeeId,
      ...salaryRequestData,
      currentAmount: user.salary,
      status: "Pending",
      createdAt: new Date().toISOString(),
    }

    const requests = JSON.parse(localStorage.getItem("dayflow_salary_requests") || "[]")
    requests.push(request)
    localStorage.setItem("dayflow_salary_requests", JSON.stringify(requests))

    alert("Salary request submitted successfully!")
    setShowSalaryRequest(false)
    setSalaryRequestData({ requestedAmount: user.salary, reason: "", overtimeHours: 0 })
  }

  return (
    <div className="min-h-screen bg-(--color-background)">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-(--color-text-primary)">My Profile</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setEditedUser(user)
                }}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture Card */}
          <Card className="p-6 lg:col-span-1">
            <div className="flex flex-col items-center">
              <div className="cursor-pointer mb-4" onClick={() => setShowImageModal(true)}>
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl profile-image-hover">
                  <AvatarImage
                    src={editedUser?.profilePicture || "/placeholder.svg"}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                  <AvatarFallback className="bg-(--color-primary) text-white text-4xl">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-xl font-bold text-(--color-text-primary) text-center">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-(--color-text-secondary) text-center">{user.designation}</p>
              <p className="text-sm text-(--color-text-tertiary) text-center">{user.employeeId}</p>

              {isEditing && (
                <div className="mt-4 w-full">
                  <label htmlFor="profile-upload">
                    <Button variant="outline" className="w-full gap-2 bg-transparent" asChild>
                      <span>
                        <Upload className="w-4 h-4" />
                        Upload Photo
                      </span>
                    </Button>
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureUpload}
                  />
                </div>
              )}

              <Button
                onClick={() => setShowSalaryRequest(!showSalaryRequest)}
                variant="outline"
                className="w-full gap-2 mt-4"
              >
                <TrendingUp className="w-4 h-4" />
                Request Salary Increase
              </Button>
            </div>
          </Card>

          {/* Details Card */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-(--color-text-primary) mb-6">Personal Information</h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--color-text-secondary) flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name
                  </label>
                  <Input value={user.firstName} disabled className="bg-(--color-muted)" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--color-text-secondary) flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Last Name
                  </label>
                  <Input value={user.lastName} disabled className="bg-(--color-muted)" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-secondary) flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <Input value={user.email} disabled className="bg-(--color-muted)" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-secondary) flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                {isEditing ? (
                  <Input
                    value={editedUser?.phone}
                    onChange={(e) => setEditedUser({ ...editedUser!, phone: e.target.value })}
                  />
                ) : (
                  <Input value={user.phone} disabled className="bg-(--color-muted)" />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-secondary) flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                {isEditing ? (
                  <Input
                    value={editedUser?.address}
                    onChange={(e) => setEditedUser({ ...editedUser!, address: e.target.value })}
                  />
                ) : (
                  <Input value={user.address} disabled className="bg-(--color-muted)" />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--color-text-secondary) flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Department
                  </label>
                  <Input value={user.department} disabled className="bg-(--color-muted)" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--color-text-secondary) flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Designation
                  </label>
                  <Input value={user.designation} disabled className="bg-(--color-muted)" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--color-text-secondary) flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Join Date
                  </label>
                  <Input value={new Date(user.joinDate).toLocaleDateString()} disabled className="bg-(--color-muted)" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--color-text-secondary) flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Current Salary
                  </label>
                  <Input value={`$${user.salary.toLocaleString()}`} disabled className="bg-(--color-muted)" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Salary Request Form */}
        {showSalaryRequest && (
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-bold text-(--color-text-primary) mb-6">Request Salary Increase</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-secondary)">Requested Amount</label>
                <Input
                  type="number"
                  value={salaryRequestData.requestedAmount}
                  onChange={(e) =>
                    setSalaryRequestData({ ...salaryRequestData, requestedAmount: Number(e.target.value) })
                  }
                  placeholder="Enter requested salary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-secondary)">Overtime Hours (Optional)</label>
                <Input
                  type="number"
                  value={salaryRequestData.overtimeHours}
                  onChange={(e) =>
                    setSalaryRequestData({ ...salaryRequestData, overtimeHours: Number(e.target.value) })
                  }
                  placeholder="Enter overtime hours"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-secondary)">Reason</label>
                <textarea
                  className="w-full min-h-24 px-3 py-2 rounded-lg border border-(--color-border) focus:outline-none focus:ring-2 focus:ring-(--color-ring)"
                  value={salaryRequestData.reason}
                  onChange={(e) => setSalaryRequestData({ ...salaryRequestData, reason: e.target.value })}
                  placeholder="Explain why you deserve a salary increase..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSalaryRequest} className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Submit Request
                </Button>
                <Button variant="outline" onClick={() => setShowSalaryRequest(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}
      </main>

      <ProfileImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={editedUser?.profilePicture}
        name={`${user.firstName} ${user.lastName}`}
      />
    </div>
  )
}
