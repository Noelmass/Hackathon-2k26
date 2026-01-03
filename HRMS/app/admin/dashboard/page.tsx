"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Clock, Calendar, DollarSign, AlertCircle, CheckCircle, TrendingUp } from "lucide-react"
import type { User, AttendanceRecord, LeaveRequest } from "@/lib/types"
import Link from "next/link"

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [employees, setEmployees] = useState<User[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    } else if (!isLoading && user?.role !== "admin") {
      router.push("/employee/dashboard")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const allUsers = JSON.parse(localStorage.getItem("dayflow_users") || "[]")
    const employeeList = allUsers.filter((u: User) => u.role === "employee" && u.accountApproved)
    setEmployees(employeeList)

    const allAttendance = JSON.parse(localStorage.getItem("dayflow_attendance") || "[]")
    setAttendance(allAttendance)

    const allLeaves = JSON.parse(localStorage.getItem("dayflow_leave_requests") || "[]")
    setLeaveRequests(allLeaves)
  }, [])

  if (isLoading || !user) {
    return null
  }

  const today = new Date().toISOString().split("T")[0]
  const todayAttendance = attendance.filter((a) => a.date === today)
  const presentToday = todayAttendance.filter((a) => a.status === "Present" || a.status === "Late").length

  const pendingLeaves = leaveRequests.filter((l) => l.status === "Pending").length

  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const monthAttendance = attendance.filter((a) => {
    const date = new Date(a.date)
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear
  })

  const avgAttendanceRate =
    monthAttendance.length > 0
      ? (monthAttendance.filter((a) => a.status === "Present" || a.status === "Late").length / monthAttendance.length) *
        100
      : 0

  const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0)

  const departmentCounts = employees.reduce(
    (acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1
      return acc
    },
    {} as { [key: string]: number },
  )

  const recentEmployees = employees
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-(--color-background)">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-(--color-text-primary) mb-2">Admin Dashboard</h1>
          <p className="text-(--color-text-secondary)">Overview of your organization</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-(--color-primary)" />
              </div>
              <span className="text-2xl font-bold text-(--color-text-primary)">{employees.length}</span>
            </div>
            <h3 className="text-sm font-medium text-(--color-text-secondary) mb-1">Total Employees</h3>
            <p className="text-xs text-(--color-text-tertiary)">Active workforce</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-(--color-success)" />
              </div>
              <span className="text-2xl font-bold text-(--color-text-primary)">{presentToday}</span>
            </div>
            <h3 className="text-sm font-medium text-(--color-text-secondary) mb-1">Present Today</h3>
            <p className="text-xs text-(--color-text-tertiary)">
              {employees.length > 0 ? ((presentToday / employees.length) * 100).toFixed(0) : 0}% attendance
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-(--color-warning)" />
              </div>
              <span className="text-2xl font-bold text-(--color-text-primary)">{pendingLeaves}</span>
            </div>
            <h3 className="text-sm font-medium text-(--color-text-secondary) mb-1">Pending Leaves</h3>
            <p className="text-xs text-(--color-text-tertiary)">Require action</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-(--color-accent)" />
              </div>
              <span className="text-2xl font-bold text-(--color-text-primary)">
                ${(totalPayroll / 1000).toFixed(0)}K
              </span>
            </div>
            <h3 className="text-sm font-medium text-(--color-text-secondary) mb-1">Monthly Payroll</h3>
            <p className="text-xs text-(--color-text-tertiary)">Total salaries</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Attendance Rate */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-(--color-text-primary)">Avg. Attendance Rate</h3>
              <Clock className="w-5 h-5 text-(--color-primary)" />
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-bold text-(--color-text-primary)">{avgAttendanceRate.toFixed(1)}%</span>
              <span className="text-sm text-(--color-success) mb-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +2.4%
              </span>
            </div>
            <p className="text-sm text-(--color-text-secondary)">This month's performance</p>
          </Card>

          {/* Department Distribution */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-(--color-text-primary)">Department Distribution</h3>
              <Users className="w-5 h-5 text-(--color-primary)" />
            </div>
            <div className="space-y-3">
              {Object.entries(departmentCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([dept, count]) => (
                  <div key={dept} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-(--color-text-primary)">{dept}</span>
                        <span className="text-sm text-(--color-text-secondary)">{count} employees</span>
                      </div>
                      <div className="w-full bg-(--color-muted) rounded-full h-2">
                        <div
                          className="bg-(--color-primary) h-2 rounded-full"
                          style={{ width: `${(count / employees.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Employees */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-(--color-text-primary)">Recent Employees</h2>
              <Link href="/admin/employees">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 p-3 bg-(--color-muted) rounded-lg">
                  <div className="w-10 h-10 bg-(--color-primary) rounded-full flex items-center justify-center text-white font-medium">
                    {emp.firstName[0]}
                    {emp.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-(--color-text-primary)">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p className="text-xs text-(--color-text-tertiary)">{emp.designation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-(--color-text-secondary)">{emp.department}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-(--color-text-primary) mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/employees">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 bg-transparent">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Manage Employees</span>
                </Button>
              </Link>
              <Link href="/admin/attendance">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 bg-transparent">
                  <Clock className="w-6 h-6" />
                  <span className="text-sm">Attendance</span>
                </Button>
              </Link>
              <Link href="/admin/leave-requests">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 bg-transparent">
                  <Calendar className="w-6 h-6" />
                  <span className="text-sm">Leave Requests</span>
                </Button>
              </Link>
              <Link href="/admin/payroll">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 bg-transparent">
                  <DollarSign className="w-6 h-6" />
                  <span className="text-sm">Payroll</span>
                </Button>
              </Link>
              <Link href="/admin/approvals">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 bg-transparent">
                  <AlertCircle className="w-6 h-6" />
                  <span className="text-sm">Approvals</span>
                </Button>
              </Link>
              <Link href="/admin/profile">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 bg-transparent">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">My Profile</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
