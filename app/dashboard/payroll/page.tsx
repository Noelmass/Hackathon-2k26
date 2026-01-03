"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPayroll, type PayrollRecord } from "@/lib/store"
import { getCurrentUser } from "@/lib/auth"
import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function PayrollPage() {
  const user = getCurrentUser()
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])

  useEffect(() => {
    if (!user) return
    loadPayroll()
  }, [user])

  const loadPayroll = () => {
    if (!user) return
    const allPayroll = getPayroll()
    const userPayroll = allPayroll.filter((p) => p.userId === user.id).sort((a, b) => b.month.localeCompare(a.month))
    setPayroll(userPayroll)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      processed: "outline",
      paid: "default",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthPayroll = payroll.find((p) => p.month === currentMonth)

  const stats = {
    currentSalary: currentMonthPayroll?.netSalary || user?.salary || 0,
    ytdEarnings: payroll.reduce((sum, p) => sum + p.netSalary, 0),
    avgSalary: payroll.length > 0 ? Math.round(payroll.reduce((sum, p) => sum + p.netSalary, 0) / payroll.length) : 0,
    paidCount: payroll.filter((p) => p.status === "paid").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payroll</h1>
        <p className="text-muted-foreground">View your salary details and payment history</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.currentSalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.ytdEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Year to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgSalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Average per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Months</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Payments received</p>
          </CardContent>
        </Card>
      </div>

      {currentMonthPayroll && (
        <Card>
          <CardHeader>
            <CardTitle>Current Month Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium text-green-900">Base Salary</span>
                <span className="text-lg font-bold text-green-700">
                  ${currentMonthPayroll.baseSalary.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-medium text-blue-900">Allowances</span>
                <span className="text-lg font-bold text-blue-700">
                  +${currentMonthPayroll.allowances.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-sm font-medium text-red-900">Deductions</span>
                <span className="text-lg font-bold text-red-700">
                  -${currentMonthPayroll.deductions.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-primary/10 border border-primary rounded-lg">
                <span className="text-sm font-medium">Net Salary</span>
                <span className="text-2xl font-bold text-primary">
                  ${currentMonthPayroll.netSalary.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payroll.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No payroll records found
                  </TableCell>
                </TableRow>
              ) : (
                payroll.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
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
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
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
