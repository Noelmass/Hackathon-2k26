"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, Clock, CheckCircle, XCircle } from "lucide-react"
import type { LeaveRequest } from "@/lib/types"

export default function EmployeeLeave() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [newRequest, setNewRequest] = useState({
    leaveType: "Paid Leave",
    startDate: "",
    endDate: "",
    remarks: "",
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
      loadLeaveRequests()
    }
  }, [user])

  const loadLeaveRequests = () => {
    const allLeaves = JSON.parse(localStorage.getItem("dayflow_leave_requests") || "[]")
    const userLeaves = allLeaves.filter((l: LeaveRequest) => l.employeeId === user?.employeeId)
    setLeaveRequests(
      userLeaves.sort(
        (a: LeaveRequest, b: LeaveRequest) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    )
  }

  if (isLoading || !user) {
    return null
  }

  const handleSubmitRequest = () => {
    if (!newRequest.startDate || !newRequest.endDate || !newRequest.remarks) {
      alert("Please fill all fields")
      return
    }

    const request: LeaveRequest = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: user.employeeId,
      leaveType: newRequest.leaveType as any,
      startDate: newRequest.startDate,
      endDate: newRequest.endDate,
      remarks: newRequest.remarks,
      status: "Pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const allLeaves = JSON.parse(localStorage.getItem("dayflow_leave_requests") || "[]")
    allLeaves.push(request)
    localStorage.setItem("dayflow_leave_requests", JSON.stringify(allLeaves))

    setShowNewRequest(false)
    setNewRequest({ leaveType: "Paid Leave", startDate: "", endDate: "", remarks: "" })
    loadLeaveRequests()
    alert("Leave request submitted successfully!")
  }

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const pendingCount = leaveRequests.filter((l) => l.status === "Pending").length
  const approvedCount = leaveRequests.filter((l) => l.status === "Approved").length
  const rejectedCount = leaveRequests.filter((l) => l.status === "Rejected").length

  return (
    <div className="min-h-screen bg-(--color-background)">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-(--color-text-primary) mb-2">Leave Management</h1>
            <p className="text-(--color-text-secondary)">Apply for leave and track your requests</p>
          </div>
          <Button onClick={() => setShowNewRequest(!showNewRequest)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Leave Request
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-(--color-warning)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">{pendingCount}</p>
                <p className="text-sm text-(--color-text-secondary)">Pending Requests</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-(--color-success)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">{approvedCount}</p>
                <p className="text-sm text-(--color-text-secondary)">Approved Leaves</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-(--color-destructive)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">{rejectedCount}</p>
                <p className="text-sm text-(--color-text-secondary)">Rejected Requests</p>
              </div>
            </div>
          </Card>
        </div>

        {/* New Request Form */}
        {showNewRequest && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-bold text-(--color-text-primary) mb-6">New Leave Request</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-secondary)">Leave Type</label>
                <Select
                  value={newRequest.leaveType}
                  onValueChange={(v) => setNewRequest({ ...newRequest, leaveType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid Leave">Paid Leave</SelectItem>
                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                    <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                    <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-secondary)">
                  Days:{" "}
                  {newRequest.startDate && newRequest.endDate
                    ? calculateDays(newRequest.startDate, newRequest.endDate)
                    : 0}
                </label>
                <div className="h-10" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-secondary)">Start Date</label>
                <Input
                  type="date"
                  value={newRequest.startDate}
                  onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-secondary)">End Date</label>
                <Input
                  type="date"
                  value={newRequest.endDate}
                  onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-(--color-text-secondary)">Remarks</label>
                <textarea
                  className="w-full min-h-24 px-3 py-2 rounded-lg border border-(--color-border) focus:outline-none focus:ring-2 focus:ring-(--color-ring)"
                  value={newRequest.remarks}
                  onChange={(e) => setNewRequest({ ...newRequest, remarks: e.target.value })}
                  placeholder="Reason for leave..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleSubmitRequest}>Submit Request</Button>
              <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Leave Requests List */}
        <div className="space-y-4">
          {leaveRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 text-(--color-text-tertiary) mx-auto mb-4" />
              <h3 className="text-lg font-medium text-(--color-text-primary) mb-2">No leave requests yet</h3>
              <p className="text-(--color-text-secondary) mb-6">Start by creating your first leave request</p>
              <Button onClick={() => setShowNewRequest(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                New Leave Request
              </Button>
            </Card>
          ) : (
            leaveRequests.map((leave) => (
              <Card key={leave.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-(--color-text-primary)">{leave.leaveType}</h3>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
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
                    <div className="flex items-center gap-4 text-sm text-(--color-text-secondary) mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(leave.startDate).toLocaleDateString()} -{" "}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </span>
                      <span className="font-medium">{calculateDays(leave.startDate, leave.endDate)} days</span>
                    </div>
                    <p className="text-sm text-(--color-text-secondary) mb-2">
                      <span className="font-medium">Reason:</span> {leave.remarks}
                    </p>
                    {leave.adminComments && (
                      <div className="mt-3 p-3 bg-(--color-muted) rounded-lg">
                        <p className="text-xs font-medium text-(--color-text-secondary) mb-1">Admin Comments:</p>
                        <p className="text-sm text-(--color-text-primary)">{leave.adminComments}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-(--color-text-tertiary)">
                    Applied {new Date(leave.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
