"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import type { AttendanceRecord } from "@/lib/types"

export default function EmployeeAttendance() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [holidays, setHolidays] = useState<{ date: string; name: string }[]>([])

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

      // Set upcoming holidays
      const upcomingHolidays = [
        { date: "2026-01-26", name: "Republic Day" },
        { date: "2026-03-14", name: "Holi" },
        { date: "2026-04-14", name: "Dr. Ambedkar Jayanti" },
        { date: "2026-05-01", name: "Labour Day" },
        { date: "2026-08-15", name: "Independence Day" },
        { date: "2026-10-02", name: "Gandhi Jayanti" },
        { date: "2026-10-24", name: "Diwali" },
        { date: "2026-12-25", name: "Christmas" },
      ]
      setHolidays(upcomingHolidays)
    }
  }, [user])

  if (isLoading || !user) {
    return null
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)

  const getAttendanceForDate = (date: string) => {
    return attendance.find((a) => a.date === date)
  }

  const isHoliday = (date: string) => {
    return holidays.find((h) => h.date === date)
  }

  const isToday = (year: number, month: number, day: number) => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

  const isFutureDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date > today
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const thisMonthAttendance = attendance.filter((a) => {
    const date = new Date(a.date)
    return date.getMonth() === month && date.getFullYear() === year
  })

  const presentDays = thisMonthAttendance.filter((a) => a.status === "Present").length
  const lateDays = thisMonthAttendance.filter((a) => a.status === "Late").length
  const absentDays = thisMonthAttendance.filter((a) => a.status === "Absent").length
  const totalHours = thisMonthAttendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0)

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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="min-h-screen bg-(--color-background)">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-(--color-text-primary) mb-2">My Attendance</h1>
          <p className="text-(--color-text-secondary)">View your attendance history and check-in/check-out times</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-(--color-success) rounded-full" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">{presentDays}</p>
                <p className="text-xs text-(--color-text-secondary)">Present</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-(--color-warning) rounded-full" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">{lateDays}</p>
                <p className="text-xs text-(--color-text-secondary)">Late</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-(--color-destructive) rounded-full" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">{absentDays}</p>
                <p className="text-xs text-(--color-text-secondary)">Absent</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-(--color-primary)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">{totalHours.toFixed(1)}</p>
                <p className="text-xs text-(--color-text-secondary)">Total Hours</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Calendar View */}
          <Card className="p-6 xl:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-(--color-text-primary)">
                {monthNames[month]} {year}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-(--color-text-secondary) py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Calendar Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                const attendanceRecord = getAttendanceForDate(dateStr)
                const holiday = isHoliday(dateStr)
                const isCurrentDay = isToday(year, month, day)
                const isFuture = isFutureDate(year, month, day)
                const dayOfWeek = new Date(year, month, day).getDay()
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

                return (
                  <div
                    key={day}
                    className={`aspect-square border border-(--color-border) rounded-lg p-2 flex flex-col items-center justify-center relative ${
                      isCurrentDay ? "ring-2 ring-(--color-primary)" : ""
                    } ${isWeekend || holiday ? "bg-(--color-muted)" : ""} ${isFuture ? "opacity-50" : ""}`}
                  >
                    <span
                      className={`text-sm font-medium ${isCurrentDay ? "text-(--color-primary)" : "text-(--color-text-primary)"}`}
                    >
                      {day}
                    </span>
                    {attendanceRecord && (
                      <div
                        className={`w-2 h-2 rounded-full mt-1 ${
                          attendanceRecord.status === "Present"
                            ? "bg-(--color-success)"
                            : attendanceRecord.status === "Late"
                              ? "bg-(--color-warning)"
                              : "bg-(--color-destructive)"
                        }`}
                      />
                    )}
                    {holiday && <div className="text-xs text-(--color-accent) font-medium mt-1">H</div>}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-(--color-border)">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-(--color-success) rounded-full" />
                <span className="text-xs text-(--color-text-secondary)">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-(--color-warning) rounded-full" />
                <span className="text-xs text-(--color-text-secondary)">Late</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-(--color-destructive) rounded-full" />
                <span className="text-xs text-(--color-text-secondary)">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-(--color-accent) font-medium">H</div>
                <span className="text-xs text-(--color-text-secondary)">Holiday</span>
              </div>
            </div>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Check-ins */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-(--color-text-primary) mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Check-ins
              </h3>
              <div className="space-y-3">
                {thisMonthAttendance.slice(0, 5).map((record) => (
                  <div key={record.id} className="p-3 bg-(--color-muted) rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-(--color-text-primary)">
                        {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
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
                    {record.checkIn && record.checkOut && (
                      <div className="flex items-center gap-2 text-xs text-(--color-text-secondary)">
                        <span>{record.checkIn}</span>
                        <span>-</span>
                        <span>{record.checkOut}</span>
                      </div>
                    )}
                    {record.hoursWorked && (
                      <div className="text-xs text-(--color-text-tertiary) mt-1">{record.hoursWorked} hours worked</div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Upcoming Holidays */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-(--color-text-primary) mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Upcoming Holidays
              </h3>
              <div className="space-y-3">
                {holidays
                  .filter((h) => new Date(h.date) > new Date())
                  .slice(0, 5)
                  .map((holiday) => (
                    <div
                      key={holiday.date}
                      className="flex items-center justify-between p-3 bg-(--color-muted) rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-(--color-text-primary)">{holiday.name}</p>
                        <p className="text-xs text-(--color-text-tertiary)">
                          {new Date(holiday.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="w-8 h-8 bg-(--color-accent) bg-opacity-10 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-4 h-4 text-(--color-accent)" />
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
