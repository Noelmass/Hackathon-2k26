"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, FileText, DollarSign, CheckCircle } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getAttendance, getLeaveRequests, getPayroll } from "@/lib/store"

export default function DashboardPage() {
  const [user, setUser] = useState(getCurrentUser())
  const [stats, setStats] = useState({
    todayAttendance: "Not checked in",
    pendingLeaves: 0,
    approvedLeaves: 0,
    currentSalary: 0,
    thisMonthHours: 0,
  })

  useEffect(() => {
    if (!user) return

    const attendance = getAttendance()
    const leaves = getLeaveRequests()
    const payroll = getPayroll()

    const today = new Date().toISOString().split("T")[0]
    const todayRecord = attendance.find((a) => a.userId === user.id && a.date === today)

    const userLeaves = leaves.filter((l) => l.userId === user.id)
    const pendingLeaves = userLeaves.filter((l) => l.status === "pending").length
    const approvedLeaves = userLeaves.filter((l) => l.status === "approved").length

    const currentMonth = new Date().toISOString().slice(0, 7)
    const monthPayroll = payroll.find((p) => p.userId === user.id && p.month === currentMonth)

    const monthAttendance = attendance.filter((a) => a.userId === user.id && a.date.startsWith(currentMonth))
    const totalHours = monthAttendance.reduce((sum, a) => sum + (a.workHours || 0), 0)

    setStats({
      todayAttendance: todayRecord ? `${todayRecord.status} - ${todayRecord.checkIn}` : "Not checked in",
      pendingLeaves,
      approvedLeaves,
      currentSalary: user.salary,
      thisMonthHours: totalHours,
    })
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Here's what's happening with your work today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAttendance}</div>
            <p className="text-xs text-muted-foreground mt-1">Current status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month Hours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthHours}h</div>
            <p className="text-xs text-muted-foreground mt-1">Work hours logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pendingLeaves} / {stats.approvedLeaves}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pending / Approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.currentSalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Base salary</p>
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
              href="/dashboard/attendance"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Mark Attendance</p>
                <p className="text-sm text-muted-foreground">Check in/out for today</p>
              </div>
            </a>
            <a
              href="/dashboard/leave"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Apply for Leave</p>
                <p className="text-sm text-muted-foreground">Submit a new leave request</p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Department</span>
              <span className="text-sm font-medium">{user?.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Position</span>
              <span className="text-sm font-medium">{user?.position}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Join Date</span>
              <span className="text-sm font-medium">{user?.joinDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Employee ID</span>
              <span className="text-sm font-medium">EMP{user?.id?.padStart(4, "0")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
