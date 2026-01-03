"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPayroll, savePayroll, getUsers, type PayrollRecord, type User } from "@/lib/store"
import { Plus, DollarSign, TrendingUp, Calendar, CheckCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function AdminPayrollPage() {
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  const [formData, setFormData] = useState({
    userId: "",
    month: new Date().toISOString().slice(0, 7),
    baseSalary: "",
    allowances: "",
    deductions: "",
  })

  useEffect(() => {
    loadData()
  }, [selectedMonth])

  const loadData = () => {
    const allPayroll = getPayroll()
    const allUsers = getUsers()
    setPayroll(allPayroll.filter((p) => p.month === selectedMonth))
    setUsers(allUsers.filter((u) => u.role === "employee"))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const user = users.find((u) => u.id === formData.userId)
    if (!user) return

    const baseSalary = Number(formData.baseSalary)
    const allowances = Number(formData.allowances)
    const deductions = Number(formData.deductions)
    const netSalary = baseSalary + allowances - deductions

    const allPayroll = getPayroll()

    const newPayroll: PayrollRecord = {
      id: String(allPayroll.length + 1),
      userId: user.id,
      userName: user.name,
      month: formData.month,
      baseSalary,
      allowances,
      deductions,
      netSalary,
      status: "pending",
    }

    savePayroll([...allPayroll, newPayroll])
    setIsAddOpen(false)
    setFormData({
      userId: "",
      month: new Date().toISOString().slice(0, 7),
      baseSalary: "",
      allowances: "",
      deductions: "",
    })
    loadData()
  }

  const handleStatusChange = (payrollId: string, newStatus: PayrollRecord["status"]) => {
    const allPayroll = getPayroll()
    const updatedPayroll = allPayroll.map((p) => (p.id === payrollId ? { ...p, status: newStatus } : p))
    savePayroll(updatedPayroll)
    loadData()
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      processed: "outline",
      paid: "default",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  const generateMonthOptions = () => {
    const options = []
    for (let i = 0; i < 12; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const value = date.toISOString().slice(0, 7)
      const label = date.toLocaleDateString("en-US", { year: "numeric", month: "long" })
      options.push({ value, label })
    }
    return options
  }

  const stats = {
    totalPayroll: payroll.reduce((sum, p) => sum + p.netSalary, 0),
    pending: payroll.filter((p) => p.status === "pending").length,
    processed: payroll.filter((p) => p.status === "processed").length,
    paid: payroll.filter((p) => p.status === "paid").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Generate and manage employee payroll</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {generateMonthOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Payroll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Payroll</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee</Label>
                  <Select
                    value={formData.userId}
                    onValueChange={(value) => {
                      const user = users.find((u) => u.id === value)
                      setFormData({
                        ...formData,
                        userId: value,
                        baseSalary: user ? String(user.salary) : "",
                      })
                    }}
                  >
                    <SelectTrigger id="employee">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} - {user.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baseSalary">Base Salary ($)</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowances">Allowances ($)</Label>
                  <Input
                    id="allowances"
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deductions">Deductions ($)</Label>
                  <Input
                    id="deductions"
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                    placeholder="0"
                  />
                </div>

                {formData.baseSalary && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-900">
                      Net Salary:{" "}
                      <span className="font-bold">
                        $
                        {(
                          Number(formData.baseSalary) +
                          Number(formData.allowances || 0) -
                          Number(formData.deductions || 0)
                        ).toLocaleString()}
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Generate</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalPayroll.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Not processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processed}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paid}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payroll.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No payroll records found for this month
                  </TableCell>
                </TableRow>
              ) : (
                payroll.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.userName}</TableCell>
                    <TableCell>
                      {new Date(record.month + "-01").toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </TableCell>
                    <TableCell>${record.baseSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">+${record.allowances.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">-${record.deductions.toLocaleString()}</TableCell>
                    <TableCell className="font-bold">${record.netSalary.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {record.status === "pending" && (
                          <Button variant="ghost" size="sm" onClick={() => handleStatusChange(record.id, "processed")}>
                            Process
                          </Button>
                        )}
                        {record.status === "processed" && (
                          <Button variant="ghost" size="sm" onClick={() => handleStatusChange(record.id, "paid")}>
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </TableCell>
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
