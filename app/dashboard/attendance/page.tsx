"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAttendance, saveAttendance, type AttendanceRecord } from "@/lib/store"
import { getCurrentUser } from "@/lib/auth"
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function AttendancePage() {
  const user = getCurrentUser()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!user) return
    loadAttendance()
  }, [user])

  const loadAttendance = () => {
    if (!user) return
    const allAttendance = getAttendance()
    const userAttendance = allAttendance
      .filter((a) => a.userId === user.id)
      .sort((a, b) => b.date.localeCompare(a.date))
    setAttendance(userAttendance.slice(0, 10))

    const today = new Date().toISOString().split("T")[0]
    const todayRec = allAttendance.find((a) => a.userId === user.id && a.date === today)
    setTodayRecord(todayRec || null)
  }

  const handleCheckIn = () => {
    if (!user) return

    const now = new Date()
    const time = now.toTimeString().split(" ")[0]
    const date = now.toISOString().split("T")[0]

    const allAttendance = getAttendance()
    const newRecord: AttendanceRecord = {
      id: String(allAttendance.length + 1),
      userId: user.id,
      date,
      checkIn: time,
      checkOut: null,
      status: "present",
      workHours: 0,
    }

    saveAttendance([...allAttendance, newRecord])
    loadAttendance()
  }

  const handleCheckOut = () => {
    if (!user || !todayRecord) return

    const now = new Date()
    const checkOutTime = now.toTimeString().split(" ")[0]

    const checkInDate = new Date(`2000-01-01T${todayRecord.checkIn}`)
    const checkOutDate = new Date(`2000-01-01T${checkOutTime}`)
    const workHours = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60)

    const allAttendance = getAttendance()
    const updatedAttendance = allAttendance.map((a) =>
      a.id === todayRecord.id
        ? {
            ...a,
            checkOut: checkOutTime,
            workHours: Math.round(workHours * 100) / 100,
          }
        : a,
    )

    saveAttendance(updatedAttendance)
    loadAttendance()
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      present: "default",
      absent: "destructive",
      late: "secondary",
      "half-day": "outline",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance Tracking</h1>
        <p className="text-muted-foreground">Mark your attendance and view your history</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-primary mb-2">{currentTime}</div>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            {!todayRecord ? (
              <Button onClick={handleCheckIn} className="w-full" size="lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                Check In
              </Button>
            ) : !todayRecord.checkOut ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-900">Checked In</p>
                  <p className="text-2xl font-bold text-green-700">{todayRecord.checkIn}</p>
                </div>
                <Button onClick={handleCheckOut} variant="outline" className="w-full bg-transparent" size="lg">
                  <XCircle className="h-5 w-5 mr-2" />
                  Check Out
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-900">Checked In</p>
                  <p className="text-2xl font-bold text-green-700">{todayRecord.checkIn}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">Checked Out</p>
                  <p className="text-2xl font-bold text-blue-700">{todayRecord.checkOut}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm font-medium">Total Work Hours</p>
                  <p className="text-xl font-bold">{todayRecord.workHours}h</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const currentMonth = new Date().toISOString().slice(0, 7)
              const monthAttendance = attendance.filter((a) => a.date.startsWith(currentMonth))
              const totalDays = monthAttendance.length
              const presentDays = monthAttendance.filter((a) => a.status === "present").length
              const totalHours = monthAttendance.reduce((sum, a) => sum + (a.workHours || 0), 0)
              const avgHours = totalDays > 0 ? totalHours / totalDays : 0

              return (
                <>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Days Present</p>
                      <p className="text-2xl font-bold">{presentDays}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                      <p className="text-2xl font-bold">{Math.round(totalHours)}h</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Hours/Day</p>
                      <p className="text-2xl font-bold">{avgHours.toFixed(1)}h</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                </>
              )
            })()}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Work Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.date}</TableCell>
                    <TableCell>{record.checkIn}</TableCell>
                    <TableCell>{record.checkOut || "-"}</TableCell>
                    <TableCell>{record.workHours ? `${record.workHours}h` : "-"}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
