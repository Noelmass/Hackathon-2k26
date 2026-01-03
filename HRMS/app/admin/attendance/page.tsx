"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import type { AttendanceRecord, User } from "@/lib/types"

export default function AdminAttendance() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [employees, setEmployees] = useState<User[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth())

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
  }, [])

  if (isLoading || !user) {
    return null
  }

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getEmployeeAttendance = (employeeId: string) => {
    return attendance.filter((a) => {
      const date = new Date(a.date)
      return a.employeeId === employeeId && date.getMonth() === filterMonth
    })
  }

  const calculateStats = (records: AttendanceRecord[]) => {
    const present = records.filter((r) => r.status === "Present").length
    const late = records.filter((r) => r.status === "Late").length
    const absent = records.filter((r) => r.status === "Absent").length
    const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0)

    return { present, late, absent, totalHours }
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const displayEmployees =
    selectedEmployee === "all" ? filteredEmployees : filteredEmployees.filter((e) => e.id === selectedEmployee)

  return (
    <div className="min-h-screen bg-(--color-background)">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-(--color-text-primary) mb-2">Attendance Management</h1>
          <p className="text-(--color-text-secondary)">View and manage employee attendance records</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--color-text-secondary)">Search Employee</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-text-tertiary)" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-(--color-text-secondary)">Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-(--color-text-secondary)">Month</label>
              <Select value={filterMonth.toString()} onValueChange={(v) => setFilterMonth(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Employee Attendance Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayEmployees.map((emp) => {
            const empAttendance = getEmployeeAttendance(emp.employeeId)
            const stats = calculateStats(empAttendance)
            const attendanceRate =
              empAttendance.length > 0 ? ((stats.present + stats.late) / empAttendance.length) * 100 : 0

            return (
              <Card key={emp.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="h-16 w-16 border-2 border-(--color-border)">
                    <AvatarImage
                      src={emp.profilePicture || "/placeholder.svg"}
                      alt={`${emp.firstName} ${emp.lastName}`}
                    />
                    <AvatarFallback className="bg-(--color-primary) text-white">
                      {emp.firstName[0]}
                      {emp.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-(--color-text-primary)">
                      {emp.firstName} {emp.lastName}
                    </h3>
                    <p className="text-sm text-(--color-text-secondary)">{emp.employeeId}</p>
                    <p className="text-sm text-(--color-text-tertiary)">
                      {emp.designation} • {emp.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-(--color-text-primary)">{attendanceRate.toFixed(0)}%</div>
                    <div className="text-xs text-(--color-text-tertiary)">Attendance</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-(--color-muted) rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-(--color-success)">{stats.present}</div>
                    <div className="text-xs text-(--color-text-secondary)">Present</div>
                  </div>
                  <div className="bg-(--color-muted) rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-(--color-warning)">{stats.late}</div>
                    <div className="text-xs text-(--color-text-secondary)">Late</div>
                  </div>
                  <div className="bg-(--color-muted) rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-(--color-destructive)">{stats.absent}</div>
                    <div className="text-xs text-(--color-text-secondary)">Absent</div>
                  </div>
                  <div className="bg-(--color-muted) rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-(--color-primary)">{stats.totalHours.toFixed(0)}</div>
                    <div className="text-xs text-(--color-text-secondary)">Hours</div>
                  </div>
                </div>

                {/* Recent attendance */}
                <div className="mt-4 pt-4 border-t border-(--color-border)">
                  <h4 className="text-sm font-medium text-(--color-text-secondary) mb-3">Recent Records</h4>
                  <div className="space-y-2">
                    {empAttendance.slice(0, 3).map((record) => (
                      <div key={record.id} className="flex items-center justify-between text-sm">
                        <span className="text-(--color-text-primary)">
                          {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <div className="flex items-center gap-2">
                          {record.checkIn && record.checkOut && (
                            <span className="text-(--color-text-tertiary) text-xs">
                              {record.checkIn} - {record.checkOut}
                            </span>
                          )}
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
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
