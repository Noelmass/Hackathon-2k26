"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, FileText, DollarSign, TrendingUp, Clock } from "lucide-react"
import { getUsers, getAttendance, getLeaveRequests, getPayroll } from "@/lib/store"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    totalPayroll: 0,
    avgAttendance: 0,
    activeEmployees: 0,
  })

  useEffect(() => {
    const users = getUsers()
    const attendance = getAttendance()
    const leaves = getLeaveRequests()
    const payroll = getPayroll()

    const employees = users.filter((u) => u.role === "employee")
    const today = new Date().toISOString().split("T")[0]
    const todayAttendance = attendance.filter((a) => a.date === today && a.status === "present")

    const pendingLeaves = leaves.filter((l) => l.status === "pending").length

    const currentMonth = new Date().toISOString().slice(0, 7)
    const monthPayroll = payroll.filter((p) => p.month === currentMonth)
    const totalPayroll = monthPayroll.reduce((sum, p) => sum + p.netSalary, 0)

    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)
    const last30DaysStr = last30Days.toISOString().split("T")[0]
    const recentAttendance = attendance.filter((a) => a.date >= last30DaysStr && a.status === "present")
    const avgAttendance =
      employees.length > 0 ? Math.round((recentAttendance.length / (employees.length * 30)) * 100) : 0

    setStats({
      totalEmployees: employees.length,
      presentToday: todayAttendance.length,
      pendingLeaves,
      totalPayroll,
      avgAttendance,
      activeEmployees: employees.length,
    })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your organization's workforce and operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.presentToday} / {stats.totalEmployees}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalEmployees > 0 ? Math.round((stats.presentToday / stats.totalEmployees) * 100) : 0}% attendance
              rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalPayroll.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">This month's total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance (30d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgAttendance}%</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently working</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/employees"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Manage Employees</p>
                <p className="text-sm text-muted-foreground">Add, edit, or remove employees</p>
              </div>
            </a>
            <a
              href="/admin/leave"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <FileText className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">Review Leave Requests</p>
                <p className="text-sm text-muted-foreground">Approve or reject pending leaves</p>
              </div>
            </a>
            <a
              href="/admin/payroll"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Process Payroll</p>
                <p className="text-sm text-muted-foreground">Generate and process salary payments</p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <span className="text-sm font-medium">{stats.totalEmployees + 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Attendance Tracking</span>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Leave Management</span>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Payroll System</span>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
