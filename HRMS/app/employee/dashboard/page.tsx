"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import { ProfileImageModal } from "@/components/profile-image-modal"
import type { AttendanceRecord, LeaveRequest } from "@/lib/types"
import Link from "next/link"

export default function EmployeeDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [showImageModal, setShowImageModal] = useState(false)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    } else if (!isLoading && user?.role !== "employee") {
      router.push("/admin/dashboard")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      const allAttendance = JSON.parse(localStorage.getItem("dayflow_attendance") || "[]")
      const userAttendance = allAttendance.filter((a: AttendanceRecord) => a.employeeId === user.employeeId)
      setAttendance(userAttendance)

      const allLeaves = JSON.parse(localStorage.getItem("dayflow_leave_requests") || "[]")
      const userLeaves = allLeaves.filter((l: LeaveRequest) => l.employeeId === user.employeeId)
      setLeaveRequests(userLeaves)
    }
  }, [user])

  if (isLoading || !user) {
    return null
  }

  const thisMonthAttendance = attendance.filter((a) => {
    const date = new Date(a.date)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  })

  const presentDays = thisMonthAttendance.filter((a) => a.status === "Present").length
  const lateDays = thisMonthAttendance.filter((a) => a.status === "Late").length

  const pendingLeaves = leaveRequests.filter((l) => l.status === "Pending").length
  const approvedLeaves = leaveRequests.filter((l) => l.status === "Approved").length

  return (
    <div className="min-h-screen bg-(--color-background)">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-6">
            <div className="cursor-pointer" onClick={() => setShowImageModal(true)}>
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg profile-image-hover">
                <AvatarImage
                  src={user.profilePicture || "/placeholder.svg"}
                  alt={`${user.firstName} ${user.lastName}`}
                />
                <AvatarFallback className="bg-(--color-primary) text-white text-2xl">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-(--color-text-primary) mb-1">Welcome back, {user.firstName}!</h1>
              <p className="text-(--color-text-secondary)">
                {user.designation} • {user.department}
              </p>
              <p className="text-sm text-(--color-text-tertiary)">{user.employeeId}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-(--color-primary)" />
              </div>
              <span className="text-2xl font-bold text-(--color-text-primary)">{presentDays}</span>
            </div>
            <h3 className="text-sm font-medium text-(--color-text-secondary) mb-1">Present Days</h3>
            <p className="text-xs text-(--color-text-tertiary)">This month</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-(--color-warning)" />
              </div>
              <span className="text-2xl font-bold text-(--color-text-primary)">{lateDays}</span>
            </div>
            <h3 className="text-sm font-medium text-(--color-text-secondary) mb-1">Late Arrivals</h3>
            <p className="text-xs text-(--color-text-tertiary)">This month</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-(--color-accent)" />
              </div>
              <span className="text-2xl font-bold text-(--color-text-primary)">{pendingLeaves}</span>
            </div>
            <h3 className="text-sm font-medium text-(--color-text-secondary) mb-1">Pending Leaves</h3>
            <p className="text-xs text-(--color-text-tertiary)">Awaiting approval</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-(--color-success)" />
              </div>
              <span className="text-2xl font-bold text-(--color-text-primary)">{approvedLeaves}</span>
            </div>
            <h3 className="text-sm font-medium text-(--color-text-secondary) mb-1">Approved Leaves</h3>
            <p className="text-xs text-(--color-text-tertiary)">This year</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Attendance */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-(--color-text-primary)">Recent Attendance</h2>
              <Link href="/employee/attendance">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {attendance.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-(--color-muted) rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        record.status === "Present"
                          ? "bg-(--color-success)"
                          : record.status === "Late"
                            ? "bg-(--color-warning)"
                            : "bg-(--color-destructive)"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-(--color-text-primary)">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-(--color-text-tertiary)">
                        {record.checkIn} - {record.checkOut}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      record.status === "Present"
                        ? "bg-green-100 text-green-700"
                        : record.status === "Late"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Leave Requests */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-(--color-text-primary)">Leave Requests</h2>
              <Link href="/employee/leave">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            {leaveRequests.length > 0 ? (
              <div className="space-y-3">
                {leaveRequests.slice(0, 5).map((leave) => (
                  <div key={leave.id} className="p-3 bg-(--color-muted) rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-(--color-text-primary)">{leave.leaveType}</span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          leave.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : leave.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </div>
                    <p className="text-xs text-(--color-text-tertiary)">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-(--color-text-tertiary) mx-auto mb-3" />
                <p className="text-sm text-(--color-text-secondary)">No leave requests yet</p>
                <Link href="/employee/leave">
                  <Button className="mt-4" size="sm">
                    Apply for Leave
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </main>

      <ProfileImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={user.profilePicture}
        name={`${user.firstName} ${user.lastName}`}
      />
    </div>
  )
}
