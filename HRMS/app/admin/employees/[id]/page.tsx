"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProfileImageModal } from "@/components/profile-image-modal"
import { ArrowLeft, Edit, Save, X } from "lucide-react"
import type { User } from "@/lib/types"
import Link from "next/link"

export default function EmployeeDetail() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [employee, setEmployee] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedEmployee, setEditedEmployee] = useState<User | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    } else if (!isLoading && user?.role !== "admin") {
      router.push("/employee/dashboard")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const allUsers = JSON.parse(localStorage.getItem("dayflow_users") || "[]")
    const emp = allUsers.find((u: User) => u.id === params.id)
    if (emp) {
      setEmployee(emp)
      setEditedEmployee(emp)
    }
  }, [params.id])

  if (isLoading || !user || !employee) {
    return null
  }

  const handleSave = () => {
    if (!editedEmployee) return

    const allUsers = JSON.parse(localStorage.getItem("dayflow_users") || "[]")
    const updatedUsers = allUsers.map((u: User) => (u.id === employee.id ? editedEmployee : u))
    localStorage.setItem("dayflow_users", JSON.stringify(updatedUsers))

    setEmployee(editedEmployee)
    setIsEditing(false)
    alert("Employee updated successfully!")
  }

  return (
    <div className="min-h-screen bg-(--color-background)">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/employees">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-(--color-text-primary)">Employee Details</h1>
              <p className="text-(--color-text-secondary)">Complete employee information</p>
            </div>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit className="w-4 h-4" />
              Edit Employee
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
                  setEditedEmployee(employee)
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
          <Card className="p-6 lg:col-span-1 h-fit">
            <div className="flex flex-col items-center">
              <div className="cursor-pointer mb-4" onClick={() => setShowImageModal(true)}>
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl profile-image-hover">
                  <AvatarImage
                    src={employee.profilePicture || "/placeholder.svg"}
                    alt={`${employee.firstName} ${employee.lastName}`}
                  />
                  <AvatarFallback className="bg-(--color-primary) text-white text-4xl">
                    {employee.firstName[0]}
                    {employee.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-xl font-bold text-(--color-text-primary) text-center">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-(--color-text-secondary) text-center">{employee.designation}</p>
              <p className="text-sm text-(--color-text-tertiary) text-center">{employee.employeeId}</p>
            </div>
          </Card>

          {/* Details Card */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-(--color-text-primary) mb-6">Employee Information</h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--color-text-secondary)">First Name</label>
                  {isEditing ? (
                    <Input
                      value={editedEmployee?.firstName}
                      onChange={(e) => setEditedEmployee({ ...editedEmployee!, firstName: e.target.value })}
                    />
                  ) : (
                    <Input value={employee.firstName} disabled className="bg-(--color-muted)" />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--color-text-secondary)">Last Name</label>
                  {isEditing ? (
                    <Input
                      value={editedEmployee?.lastName}
                      onChange={(e) => setEditedEmployee({ ...editedEmployee!, lastName: e.target.value })}
                    />
                  ) : (
                    <Input value={employee.lastName} disabled className="bg-(--color-muted)" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-secondary)">Email</label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editedEmployee?.email}
                    onChange={(e) => setEditedEmployee({ ...editedEmployee!, email: e.target.value })}
                  />
                ) : (
                  <Input value={employee.email} disabled className="bg-(--color-muted)" />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-secondary)">Phone</label>
                {isEditing ? (
                  <Input
                    value={editedEmployee?.phone}
                    onChange={(e) => setEditedEmployee({ ...editedEmployee!, phone: e.target.value })}
                  />
                ) : (
                  <Input value={employee.phone} disabled className="bg-(--color-muted)" />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-secondary)">Address</label>
                {isEditing ? (
                  <Input
                    value={editedEmployee?.address}
                    onChange={(e) => setEditedEmployee({ ...editedEmployee!, address: e.target.value })}
                  />
                ) : (
                  <Input value={employee.address} disabled className="bg-(--color-muted)" />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--color-text-secondary)">Department</label>
                  <Input value={employee.department} disabled className="bg-(--color-muted)" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--color-text-secondary)">Designation</label>
                  <Input value={employee.designation} disabled className="bg-(--color-muted)" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--color-text-secondary)">Join Date</label>
                  <Input
                    value={new Date(employee.joinDate).toLocaleDateString()}
                    disabled
                    className="bg-(--color-muted)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--color-text-secondary)">Salary</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedEmployee?.salary}
                      onChange={(e) => setEditedEmployee({ ...editedEmployee!, salary: Number(e.target.value) })}
                    />
                  ) : (
                    <Input value={`$${employee.salary.toLocaleString()}`} disabled className="bg-(--color-muted)" />
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <ProfileImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={employee.profilePicture}
        name={`${employee.firstName} ${employee.lastName}`}
      />
    </div>
  )
}
