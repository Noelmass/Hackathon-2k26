"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PayrollRecord } from "@/lib/types"

export default function EmployeePayroll() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    } else if (!isLoading && user?.role !== "employee") {
      router.push("/admin/dashboard")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      // Generate payroll records for the last 6 months
      const records: PayrollRecord[] = []
      const currentDate = new Date()

      for (let i = 0; i < 6; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const month = date.toLocaleString("default", { month: "long" })
        const year = date.getFullYear()

        const baseSalary = user.salary
        const overtime = Math.floor(Math.random() * 500)
        const incentives = Math.floor(Math.random() * 1000)
        const deductions = Math.floor(Math.random() * 200) + 100

        records.push({
          id: `payroll-${user.employeeId}-${year}-${date.getMonth()}`,
          employeeId: user.employeeId,
          month,
          year,
          baseSalary,
          overtime,
          incentives,
          deductions,
          netSalary: baseSalary + overtime + incentives - deductions,
        })
      }

      setPayrollRecords(records)
    }
  }, [user])

  if (isLoading || !user) {
    return null
  }

  const currentMonth = payrollRecords[0]
  const totalEarned = payrollRecords.reduce((sum, record) => sum + record.netSalary, 0)

  return (
    <div className="min-h-screen bg-(--color-background)">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-(--color-text-primary) mb-2">My Payroll</h1>
          <p className="text-(--color-text-secondary)">View your salary details and history</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-(--color-primary)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">
                  ${currentMonth?.baseSalary.toLocaleString()}
                </p>
                <p className="text-sm text-(--color-text-secondary)">Base Salary</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-(--color-success)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">
                  ${currentMonth?.netSalary.toLocaleString()}
                </p>
                <p className="text-sm text-(--color-text-secondary)">Current Month</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-(--color-accent)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">${totalEarned.toLocaleString()}</p>
                <p className="text-sm text-(--color-text-secondary)">Last 6 Months</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Current Month Breakdown */}
        {currentMonth && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-(--color-text-primary)">
                {currentMonth.month} {currentMonth.year} Breakdown
              </h2>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Download Slip
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-(--color-text-secondary) uppercase">Earnings</h3>

                <div className="flex items-center justify-between p-3 bg-(--color-muted) rounded-lg">
                  <span className="text-sm text-(--color-text-primary)">Base Salary</span>
                  <span className="text-sm font-bold text-(--color-text-primary)">
                    ${currentMonth.baseSalary.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-(--color-muted) rounded-lg">
                  <span className="text-sm text-(--color-text-primary)">Overtime</span>
                  <span className="text-sm font-bold text-(--color-success)">
                    +${currentMonth.overtime.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-(--color-muted) rounded-lg">
                  <span className="text-sm text-(--color-text-primary)">Incentives</span>
                  <span className="text-sm font-bold text-(--color-success)">
                    +${currentMonth.incentives.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-2 border-(--color-success)">
                  <span className="text-sm font-medium text-(--color-text-primary)">Total Earnings</span>
                  <span className="text-lg font-bold text-(--color-success)">
                    ${(currentMonth.baseSalary + currentMonth.overtime + currentMonth.incentives).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-(--color-text-secondary) uppercase">Deductions</h3>

                <div className="flex items-center justify-between p-3 bg-(--color-muted) rounded-lg">
                  <span className="text-sm text-(--color-text-primary)">Tax & Others</span>
                  <span className="text-sm font-bold text-(--color-destructive)">
                    -${currentMonth.deductions.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-2 border-(--color-primary) mt-auto">
                  <span className="text-sm font-medium text-(--color-text-primary)">Net Salary</span>
                  <span className="text-2xl font-bold text-(--color-primary)">
                    ${currentMonth.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Payroll History */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-(--color-text-primary) mb-6">Payroll History</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-(--color-border)">
                  <th className="text-left py-3 px-4 text-sm font-medium text-(--color-text-secondary)">Month</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-(--color-text-secondary)">
                    Base Salary
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-(--color-text-secondary)">Overtime</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-(--color-text-secondary)">Incentives</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-(--color-text-secondary)">Deductions</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-(--color-text-secondary)">Net Salary</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-(--color-text-secondary)">Action</th>
                </tr>
              </thead>
              <tbody>
                {payrollRecords.map((record) => (
                  <tr key={record.id} className="border-b border-(--color-border) hover:bg-(--color-muted)">
                    <td className="py-3 px-4 text-sm font-medium text-(--color-text-primary)">
                      {record.month} {record.year}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-(--color-text-primary)">
                      ${record.baseSalary.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-(--color-success)">
                      ${record.overtime.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-(--color-success)">
                      ${record.incentives.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-(--color-destructive)">
                      ${record.deductions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-bold text-(--color-primary)">
                      ${record.netSalary.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Download className="w-3 h-3" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}
