export type UserRole = "admin" | "employee"

export type Department =
  | "Software Developer"
  | "Quality Assurance and Testing"
  | "Product Manager"
  | "IT Operations"
  | "Cybersecurity Engineer"

export type Designation = "Junior" | "Senior" | "Head of Department"

export type AttendanceStatus = "Present" | "Absent" | "Half-day" | "Late" | "Leave"

export type LeaveType = "Paid Leave" | "Sick Leave" | "Unpaid Leave" | "Casual Leave"

export type LeaveStatus = "Pending" | "Approved" | "Rejected"

export interface User {
  id: string
  employeeId: string
  email: string
  password: string
  role: UserRole
  firstName: string
  lastName: string
  department: Department
  designation: Designation
  joinDate: string
  phone: string
  address: string
  salary: number
  profilePicture?: string
  accountApproved: boolean
  createdAt: string
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  status: AttendanceStatus
  hoursWorked?: number
}

export interface LeaveRequest {
  id: string
  employeeId: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  remarks: string
  status: LeaveStatus
  adminComments?: string
  createdAt: string
  updatedAt: string
}

export interface SalaryRequest {
  id: string
  employeeId: string
  requestedAmount: number
  currentAmount: number
  reason: string
  overtimeHours?: number
  status: LeaveStatus
  createdAt: string
}

export interface PayrollRecord {
  id: string
  employeeId: string
  month: string
  year: number
  baseSalary: number
  overtime: number
  incentives: number
  deductions: number
  netSalary: number
}
