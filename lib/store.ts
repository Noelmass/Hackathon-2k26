"use client"

// Mock data store for the HRMS application
export interface User {
  id: string
  email: string
  password: string
  role: "admin" | "employee"
  name: string
  department: string
  position: string
  joinDate: string
  salary: number
  avatar?: string
}

export interface AttendanceRecord {
  id: string
  userId: string
  date: string
  checkIn: string
  checkOut: string | null
  status: "present" | "absent" | "late" | "half-day"
  workHours: number
}

export interface LeaveRequest {
  id: string
  userId: string
  userName: string
  type: "sick" | "casual" | "vacation" | "unpaid"
  startDate: string
  endDate: string
  days: number
  reason: string
  status: "pending" | "approved" | "rejected"
  appliedDate: string
}

export interface PayrollRecord {
  id: string
  userId: string
  userName: string
  month: string
  baseSalary: number
  allowances: number
  deductions: number
  netSalary: number
  status: "pending" | "processed" | "paid"
}

// Initialize default users
const defaultUsers: User[] = [
  {
    id: "1",
    email: "admin@dayflow.com",
    password: "admin123",
    role: "admin",
    name: "Sarah Johnson",
    department: "Human Resources",
    position: "HR Manager",
    joinDate: "2020-01-15",
    salary: 85000,
  },
  {
    id: "2",
    email: "john@dayflow.com",
    password: "john123",
    role: "employee",
    name: "John Smith",
    department: "Engineering",
    position: "Senior Developer",
    joinDate: "2021-03-20",
    salary: 75000,
  },
  {
    id: "3",
    email: "emma@dayflow.com",
    password: "emma123",
    role: "employee",
    name: "Emma Wilson",
    department: "Marketing",
    position: "Marketing Specialist",
    joinDate: "2022-06-10",
    salary: 60000,
  },
  {
    id: "4",
    email: "michael@dayflow.com",
    password: "michael123",
    role: "employee",
    name: "Michael Brown",
    department: "Sales",
    position: "Sales Executive",
    joinDate: "2021-09-05",
    salary: 65000,
  },
]

// Data management functions
export const getUsers = (): User[] => {
  if (typeof window === "undefined") return defaultUsers
  const stored = localStorage.getItem("dayflow_users")
  return stored ? JSON.parse(stored) : defaultUsers
}

export const saveUsers = (users: User[]) => {
  localStorage.setItem("dayflow_users", JSON.stringify(users))
}

export const getAttendance = (): AttendanceRecord[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("dayflow_attendance")
  return stored ? JSON.parse(stored) : []
}

export const saveAttendance = (attendance: AttendanceRecord[]) => {
  localStorage.setItem("dayflow_attendance", JSON.stringify(attendance))
}

export const getLeaveRequests = (): LeaveRequest[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("dayflow_leaves")
  return stored ? JSON.parse(stored) : []
}

export const saveLeaveRequests = (leaves: LeaveRequest[]) => {
  localStorage.setItem("dayflow_leaves", JSON.stringify(leaves))
}

export const getPayroll = (): PayrollRecord[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("dayflow_payroll")
  return stored ? JSON.parse(stored) : []
}

export const savePayroll = (payroll: PayrollRecord[]) => {
  localStorage.setItem("dayflow_payroll", JSON.stringify(payroll))
}

// Initialize data
if (typeof window !== "undefined") {
  const users = getUsers()
  if (users.length === 0) {
    saveUsers(defaultUsers)
  }
}
