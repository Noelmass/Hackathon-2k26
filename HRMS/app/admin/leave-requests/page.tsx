"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Check, X, Search, Filter } from "lucide-react"
import type { LeaveRequest, User } from "@/lib/types"

export default function AdminLeaveRequests() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [employees, setEmployees] = useState<User[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [adminComments, setAdminComments] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    } else if (!isLoading && user?.role !== "admin") {
      router.push("/employee/dashboard")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allUsers = JSON.parse(localStorage.getItem("dayflow_users") || "[]")
    const employeeList = allUsers.filter((u: User) => u.role === "employee")
    setEmployees(employeeList)

    const allLeaves = JSON.parse(localStorage.getItem("dayflow_leave_requests") || "[]")
    setLeaveRequests(
      allLeaves.sort(
        (a: LeaveRequest, b: LeaveRequest) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    )
  }

  if (isLoading || !user) {
    return null
  }

  const getEmployeeDetails = (employeeId: string) => {
    return employees.find((e) => e.employeeId === employeeId)
  }

  const handleApprove = (leaveId: string) => {
    const allLeaves = JSON.parse(localStorage.getItem("dayflow_leave_requests") || "[]")
    const updatedLeaves = allLeaves.map((l: LeaveRequest) =>
      l.id === leaveId
        ? {
            ...l,
            status: "Approved",
            adminComments: adminComments[leaveId] || "Approved by admin",
            updatedAt: new Date().toISOString(),
          }
        : l,
    )
    localStorage.setItem("dayflow_leave_requests", JSON.stringify(updatedLeaves))
    loadData()
    setAdminComments({ ...adminComments, [leaveId]: "" })
  }

  const handleReject = (leaveId: string) => {
    const comment = adminComments[leaveId] || "Rejected by admin"
    if (!adminComments[leaveId]) {
      alert("Please provide a reason for rejection")
      return
    }

    const allLeaves = JSON.parse(localStorage.getItem("dayflow_leave_requests") || "[]")
    const updatedLeaves = allLeaves.map((l: LeaveRequest) =>
      l.id === leaveId
        ? {
            ...l,
            status: "Rejected",
            adminComments: comment,
            updatedAt: new Date().toISOString(),
          }
        : l,
    )
    localStorage.setItem("dayflow_leave_requests", JSON.stringify(updatedLeaves))
    loadData()
    setAdminComments({ ...adminComments, [leaveId]: "" })
  }

  const handleModify = (leaveId: string, field: string, value: string) => {
    const allLeaves = JSON.parse(localStorage.getItem("dayflow_leave_requests") || "[]")
    const updatedLeaves = allLeaves.map((l: LeaveRequest) =>
      l.id === leaveId
        ? {
            ...l,
            [field]: value,
            updatedAt: new Date().toISOString(),
          }
        : l,
    )
    localStorage.setItem("dayflow_leave_requests", JSON.stringify(updatedLeaves))
    loadData()
  }

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const filteredRequests = leaveRequests.filter((leave) => {
    const employee = getEmployeeDetails(leave.employeeId)
    const matchesSearch =
      employee?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || leave.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const pendingCount = leaveRequests.filter((l) => l.status === "Pending").length
  const approvedCount = leaveRequests.filter((l) => l.status === "Approved").length
  const rejectedCount = leaveRequests.filter((l) => l.status === "Rejected").length

  return (
    <div className="min-h-screen bg-(--color-background)">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-(--color-text-primary) mb-2">Leave Requests</h1>
          <p className="text-(--color-text-secondary)">Review and manage employee leave requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-(--color-warning)" />
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
                <Check className="w-6 h-6 text-(--color-success)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">{approvedCount}</p>
                <p className="text-sm text-(--color-text-secondary)">Approved</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <X className="w-6 h-6 text-(--color-destructive)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">{rejectedCount}</p>
                <p className="text-sm text-(--color-text-secondary)">Rejected</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--color-text-secondary) flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Employee
              </label>
              <Input
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-(--color-text-secondary) flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Status
              </label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Leave Requests */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 text-(--color-text-tertiary) mx-auto mb-4" />
              <h3 className="text-lg font-medium text-(--color-text-primary) mb-2">No leave requests found</h3>
              <p className="text-(--color-text-secondary)">Try adjusting your filters</p>
            </Card>
          ) : (
            filteredRequests.map((leave) => {
              const employee = getEmployeeDetails(leave.employeeId)
              if (!employee) return null

              return (
                <Card key={leave.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Employee Info */}
                    <div className="flex items-center gap-4 lg:w-64">
                      <Avatar className="h-14 w-14 border-2 border-(--color-border)">
                        <AvatarImage
                          src={employee.profilePicture || "/placeholder.svg"}
                          alt={`${employee.firstName} ${employee.lastName}`}
                        />
                        <AvatarFallback className="bg-(--color-primary) text-white">
                          {employee.firstName[0]}
                          {employee.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-(--color-text-primary)">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-sm text-(--color-text-secondary)">{employee.employeeId}</p>
                        <p className="text-xs text-(--color-text-tertiary)">{employee.designation}</p>
                      </div>
                    </div>

                    {/* Leave Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-bold text-(--color-text-primary)">{leave.leaveType}</h4>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-(--color-text-secondary)">Start Date</label>
                          {leave.status === "Pending" ? (
                            <Input
                              type="date"
                              value={leave.startDate}
                              onChange={(e) => handleModify(leave.id, "startDate", e.target.value)}
                              className="h-9"
                            />
                          ) : (
                            <p className="text-sm text-(--color-text-primary)">
                              {new Date(leave.startDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-(--color-text-secondary)">End Date</label>
                          {leave.status === "Pending" ? (
                            <Input
                              type="date"
                              value={leave.endDate}
                              onChange={(e) => handleModify(leave.id, "endDate", e.target.value)}
                              className="h-9"
                            />
                          ) : (
                            <p className="text-sm text-(--color-text-primary)">
                              {new Date(leave.endDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-(--color-text-secondary) mb-1">
                        <span className="font-medium">Duration:</span> {calculateDays(leave.startDate, leave.endDate)}{" "}
                        days
                      </p>

                      <p className="text-sm text-(--color-text-secondary) mb-3">
                        <span className="font-medium">Reason:</span> {leave.remarks}
                      </p>

                      {/* Admin Comments */}
                      {leave.status === "Pending" ? (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-(--color-text-secondary)">Admin Comments</label>
                          <textarea
                            className="w-full min-h-20 px-3 py-2 text-sm rounded-lg border border-(--color-border) focus:outline-none focus:ring-2 focus:ring-(--color-ring)"
                            value={adminComments[leave.id] || ""}
                            onChange={(e) => setAdminComments({ ...adminComments, [leave.id]: e.target.value })}
                            placeholder="Add comments (required for rejection)..."
                          />
                        </div>
                      ) : (
                        leave.adminComments && (
                          <div className="p-3 bg-(--color-muted) rounded-lg">
                            <p className="text-xs font-medium text-(--color-text-secondary) mb-1">Admin Comments:</p>
                            <p className="text-sm text-(--color-text-primary)">{leave.adminComments}</p>
                          </div>
                        )
                      )}

                      {/* Actions */}
                      {leave.status === "Pending" && (
                        <div className="flex gap-2 mt-4">
                          <Button onClick={() => handleApprove(leave.id)} className="gap-2" size="sm">
                            <Check className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(leave.id)}
                            variant="destructive"
                            className="gap-2"
                            size="sm"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      )}

                      <p className="text-xs text-(--color-text-tertiary) mt-3">
                        Applied {new Date(leave.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
