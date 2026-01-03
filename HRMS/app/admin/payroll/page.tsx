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
import { Search, DollarSign, Edit, Save, X } from "lucide-react"
import type { User, PayrollRecord } from "@/lib/types"

export default function AdminPayroll() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [employees, setEmployees] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth())
  const [editingSalary, setEditingSalary] = useState<{ [key: string]: number }>({})

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

  const generatePayrollRecord = (emp: User): PayrollRecord => {
    const currentDate = new Date()
    const date = new Date(currentDate.getFullYear(), filterMonth, 1)
    const month = date.toLocaleString("default", { month: "long" })
    const year = date.getFullYear()

    const baseSalary = editingSalary[emp.id] ?? emp.salary
    const overtime = Math.floor(Math.random() * 500)
    const incentives = Math.floor(Math.random() * 1000)
    const deductions = Math.floor(Math.random() * 200) + 100

    return {
      id: `payroll-${emp.employeeId}-${year}-${filterMonth}`,
      employeeId: emp.employeeId,
      month,
      year,
      baseSalary,
      overtime,
      incentives,
      deductions,
      netSalary: baseSalary + overtime + incentives - deductions,
    }
  }

  const handleUpdateSalary = (empId: string) => {
    const allUsers = JSON.parse(localStorage.getItem("dayflow_users") || "[]")
    const updatedUsers = allUsers.map((u: User) =>
      u.id === empId && editingSalary[empId] ? { ...u, salary: editingSalary[empId] } : u,
    )
    localStorage.setItem("dayflow_users", JSON.stringify(updatedUsers))

    const updatedEmployees = employees.map((e) =>
      e.id === empId && editingSalary[empId] ? { ...e, salary: editingSalary[empId] } : e,
    )
    setEmployees(updatedEmployees)
    setEditingSalary({ ...editingSalary, [empId]: 0 })
    alert("Salary updated successfully!")
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

  const totalPayroll = filteredEmployees.reduce((sum, emp) => {
    const record = generatePayrollRecord(emp)
    return sum + record.netSalary
  }, 0)

  return (
    <div className="min-h-screen bg-(--color-background)">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-(--color-text-primary) mb-2">Payroll Management</h1>
          <p className="text-(--color-text-secondary)">Manage employee salaries and payroll</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-(--color-primary)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">${totalPayroll.toLocaleString()}</p>
                <p className="text-sm text-(--color-text-secondary)">Total Monthly Payroll</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-(--color-success)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">
                  ${Math.round(totalPayroll / filteredEmployees.length).toLocaleString()}
                </p>
                <p className="text-sm text-(--color-text-secondary)">Average Salary</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-(--color-accent)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">{filteredEmployees.length}</p>
                <p className="text-sm text-(--color-text-secondary)">Employees</p>
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

        {/* Payroll Table */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-(--color-text-primary) mb-6">Employee Payroll</h2>

          <div className="space-y-4">
            {filteredEmployees.map((emp) => {
              const record = generatePayrollRecord(emp)
              const isEditing = editingSalary[emp.id] !== undefined && editingSalary[emp.id] !== 0

              return (
                <Card key={emp.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Employee Info */}
                    <div className="flex items-center gap-4 lg:w-64">
                      <Avatar className="h-14 w-14 border-2 border-(--color-border)">
                        <AvatarImage
                          src={emp.profilePicture || "/placeholder.svg"}
                          alt={`${emp.firstName} ${emp.lastName}`}
                        />
                        <AvatarFallback className="bg-(--color-primary) text-white">
                          {emp.firstName[0]}
                          {emp.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-(--color-text-primary)">
                          {emp.firstName} {emp.lastName}
                        </h3>
                        <p className="text-sm text-(--color-text-secondary)">{emp.employeeId}</p>
                        <p className="text-xs text-(--color-text-tertiary)">{emp.designation}</p>
                      </div>
                    </div>

                    {/* Payroll Details */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div>
                        <p className="text-xs text-(--color-text-secondary) mb-1">Base Salary</p>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editingSalary[emp.id]}
                            onChange={(e) => setEditingSalary({ ...editingSalary, [emp.id]: Number(e.target.value) })}
                            className="h-8 text-sm"
                          />
                        ) : (
                          <p className="text-sm font-bold text-(--color-text-primary)">
                            ${record.baseSalary.toLocaleString()}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-(--color-text-secondary) mb-1">Overtime</p>
                        <p className="text-sm font-bold text-(--color-success)">${record.overtime.toLocaleString()}</p>
                      </div>

                      <div>
                        <p className="text-xs text-(--color-text-secondary) mb-1">Incentives</p>
                        <p className="text-sm font-bold text-(--color-success)">
                          ${record.incentives.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-(--color-text-secondary) mb-1">Deductions</p>
                        <p className="text-sm font-bold text-(--color-destructive)">
                          ${record.deductions.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-(--color-text-secondary) mb-1">Net Salary</p>
                        <p className="text-sm font-bold text-(--color-primary)">${record.netSalary.toLocaleString()}</p>
                      </div>

                      <div>
                        {!isEditing ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 mt-4 bg-transparent"
                            onClick={() => setEditingSalary({ ...editingSalary, [emp.id]: emp.salary })}
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                        ) : (
                          <div className="flex gap-1 mt-4">
                            <Button variant="default" size="sm" onClick={() => handleUpdateSalary(emp.id)}>
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingSalary({ ...editingSalary, [emp.id]: 0 })}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </Card>
      </main>
    </div>
  )
}
