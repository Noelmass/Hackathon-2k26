"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, X, UserPlus, TrendingUp } from "lucide-react"
import type { User, SalaryRequest } from "@/lib/types"

export default function AdminApprovals() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [pendingAccounts, setPendingAccounts] = useState<User[]>([])
  const [salaryRequests, setSalaryRequests] = useState<SalaryRequest[]>([])

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
    const pending = allUsers.filter((u: User) => u.role === "employee" && !u.accountApproved)
    setPendingAccounts(pending)

    const allSalaryRequests = JSON.parse(localStorage.getItem("dayflow_salary_requests") || "[]")
    const pendingRequests = allSalaryRequests.filter((r: SalaryRequest) => r.status === "Pending")
    setSalaryRequests(pendingRequests)
  }

  if (isLoading || !user) {
    return null
  }

  const handleApproveAccount = (userId: string, modifiedSalary?: number) => {
    const allUsers = JSON.parse(localStorage.getItem("dayflow_users") || "[]")
    const updatedUsers = allUsers.map((u: User) =>
      u.id === userId ? { ...u, accountApproved: true, salary: modifiedSalary || u.salary } : u,
    )
    localStorage.setItem("dayflow_users", JSON.stringify(updatedUsers))
    loadData()
    alert("Account approved successfully!")
  }

  const handleRejectAccount = (userId: string) => {
    const allUsers = JSON.parse(localStorage.getItem("dayflow_users") || "[]")
    const updatedUsers = allUsers.filter((u: User) => u.id !== userId)
    localStorage.setItem("dayflow_users", JSON.stringify(updatedUsers))
    loadData()
    alert("Account rejected and removed")
  }

  const handleApproveSalaryRequest = (requestId: string) => {
    const allRequests = JSON.parse(localStorage.getItem("dayflow_salary_requests") || "[]")
    const request = allRequests.find((r: SalaryRequest) => r.id === requestId)

    if (request) {
      // Update salary in users
      const allUsers = JSON.parse(localStorage.getItem("dayflow_users") || "[]")
      const updatedUsers = allUsers.map((u: User) =>
        u.employeeId === request.employeeId ? { ...u, salary: request.requestedAmount } : u,
      )
      localStorage.setItem("dayflow_users", JSON.stringify(updatedUsers))

      // Update request status
      const updatedRequests = allRequests.map((r: SalaryRequest) =>
        r.id === requestId ? { ...r, status: "Approved" } : r,
      )
      localStorage.setItem("dayflow_salary_requests", JSON.stringify(updatedRequests))
      loadData()
      alert("Salary request approved!")
    }
  }

  const handleRejectSalaryRequest = (requestId: string) => {
    const allRequests = JSON.parse(localStorage.getItem("dayflow_salary_requests") || "[]")
    const updatedRequests = allRequests.map((r: SalaryRequest) =>
      r.id === requestId ? { ...r, status: "Rejected" } : r,
    )
    localStorage.setItem("dayflow_salary_requests", JSON.stringify(updatedRequests))
    loadData()
    alert("Salary request rejected")
  }

  const getEmployeeDetails = (employeeId: string) => {
    const allUsers = JSON.parse(localStorage.getItem("dayflow_users") || "[]")
    return allUsers.find((u: User) => u.employeeId === employeeId)
  }

  return (
    <div className="min-h-screen bg-(--color-background)">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-(--color-text-primary) mb-2">Pending Approvals</h1>
          <p className="text-(--color-text-secondary)">Review and approve pending requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-(--color-primary)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">{pendingAccounts.length}</p>
                <p className="text-sm text-(--color-text-secondary)">Pending Account Approvals</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-(--color-success)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">{salaryRequests.length}</p>
                <p className="text-sm text-(--color-text-secondary)">Pending Salary Requests</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Accounts */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-(--color-text-primary) mb-6">Account Approvals</h2>

          {pendingAccounts.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="w-12 h-12 text-(--color-text-tertiary) mx-auto mb-3" />
              <p className="text-sm text-(--color-text-secondary)">No pending account approvals</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAccounts.map((account) => (
                <Card key={account.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex items-center gap-4 lg:w-64">
                      <Avatar className="h-14 w-14 border-2 border-(--color-border)">
                        <AvatarImage
                          src={account.profilePicture || "/placeholder.svg"}
                          alt={`${account.firstName} ${account.lastName}`}
                        />
                        <AvatarFallback className="bg-(--color-primary) text-white">
                          {account.firstName[0]}
                          {account.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-(--color-text-primary)">
                          {account.firstName} {account.lastName}
                        </h3>
                        <p className="text-sm text-(--color-text-secondary)">{account.employeeId}</p>
                        <p className="text-xs text-(--color-text-tertiary)">{account.email}</p>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-(--color-text-secondary) mb-1">Department</p>
                        <p className="text-sm font-medium text-(--color-text-primary)">{account.department}</p>
                      </div>

                      <div>
                        <p className="text-xs text-(--color-text-secondary) mb-1">Designation</p>
                        <p className="text-sm font-medium text-(--color-text-primary)">{account.designation}</p>
                      </div>

                      <div>
                        <p className="text-xs text-(--color-text-secondary) mb-1">Default Salary</p>
                        <Input
                          type="number"
                          defaultValue={account.salary}
                          id={`salary-${account.id}`}
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="gap-1 flex-1"
                          onClick={() => {
                            const input = document.getElementById(`salary-${account.id}`) as HTMLInputElement
                            handleApproveAccount(account.id, Number(input.value))
                          }}
                        >
                          <Check className="w-3 h-3" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRejectAccount(account.id)}
                          className="gap-1"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Salary Increase Requests */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-(--color-text-primary) mb-6">Salary Increase Requests</h2>

          {salaryRequests.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-(--color-text-tertiary) mx-auto mb-3" />
              <p className="text-sm text-(--color-text-secondary)">No pending salary requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {salaryRequests.map((request) => {
                const employee = getEmployeeDetails(request.employeeId)
                if (!employee) return null

                return (
                  <Card key={request.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
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

                      <div className="flex-1">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-(--color-text-secondary) mb-1">Current Salary</p>
                            <p className="text-lg font-bold text-(--color-text-primary)">
                              ${request.currentAmount.toLocaleString()}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-(--color-text-secondary) mb-1">Requested Salary</p>
                            <p className="text-lg font-bold text-(--color-success)">
                              ${request.requestedAmount.toLocaleString()}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-(--color-text-secondary) mb-1">Increase</p>
                            <p className="text-lg font-bold text-(--color-primary)">
                              +${(request.requestedAmount - request.currentAmount).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {request.overtimeHours && request.overtimeHours > 0 && (
                          <p className="text-sm text-(--color-text-secondary) mb-2">
                            <span className="font-medium">Overtime Hours:</span> {request.overtimeHours}
                          </p>
                        )}

                        <p className="text-sm text-(--color-text-secondary) mb-4">
                          <span className="font-medium">Reason:</span> {request.reason}
                        </p>

                        <div className="flex gap-2">
                          <Button onClick={() => handleApproveSalaryRequest(request.id)} className="gap-2">
                            <Check className="w-4 h-4" />
                            Approve Increase
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleRejectSalaryRequest(request.id)}
                            className="gap-2"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
