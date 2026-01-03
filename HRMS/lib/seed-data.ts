import type { User, AttendanceRecord, AttendanceStatus } from "./types"

export function seedInitialData() {
  if (typeof window === "undefined") return

  const existingUsers = localStorage.getItem("dayflow_users")
  if (existingUsers) return

  const users: User[] = [
    // Admin
    {
      id: "admin-001",
      employeeId: "EMP001",
      email: "admin@dayflow.com",
      password: "admin123",
      role: "admin",
      firstName: "Sarah",
      lastName: "Johnson",
      department: "IT Operations",
      designation: "Head of Department",
      joinDate: "2020-01-15",
      phone: "+1234567890",
      address: "123 Admin Street, Tech City",
      salary: 120000,
      accountApproved: true,
      createdAt: "2020-01-15T00:00:00Z",
      profilePicture: "/professional-woman-executive.png",
    },
    // Software Developers
    {
      id: "emp-002",
      employeeId: "EMP002",
      email: "john.smith@dayflow.com",
      password: "password123",
      role: "employee",
      firstName: "John",
      lastName: "Smith",
      department: "Software Developer",
      designation: "Senior",
      joinDate: "2021-03-20",
      phone: "+1234567891",
      address: "456 Dev Avenue, Code Town",
      salary: 95000,
      accountApproved: true,
      createdAt: "2021-03-20T00:00:00Z",
      profilePicture: "/professional-man-developer.png",
    },
    {
      id: "emp-003",
      employeeId: "EMP003",
      email: "emily.davis@dayflow.com",
      password: "password123",
      role: "employee",
      firstName: "Emily",
      lastName: "Davis",
      department: "Software Developer",
      designation: "Junior",
      joinDate: "2022-06-15",
      phone: "+1234567892",
      address: "789 Code Lane, Silicon Valley",
      salary: 65000,
      accountApproved: true,
      createdAt: "2022-06-15T00:00:00Z",
      profilePicture: "/professional-woman-programmer.jpg",
    },
    // QA and Testing
    {
      id: "emp-004",
      employeeId: "EMP004",
      email: "michael.brown@dayflow.com",
      password: "password123",
      role: "employee",
      firstName: "Michael",
      lastName: "Brown",
      department: "Quality Assurance and Testing",
      designation: "Senior",
      joinDate: "2020-09-10",
      phone: "+1234567893",
      address: "321 Test Street, QA City",
      salary: 85000,
      accountApproved: true,
      createdAt: "2020-09-10T00:00:00Z",
      profilePicture: "/professional-man-qa-tester.jpg",
    },
    {
      id: "emp-005",
      employeeId: "EMP005",
      email: "lisa.wilson@dayflow.com",
      password: "password123",
      role: "employee",
      firstName: "Lisa",
      lastName: "Wilson",
      department: "Quality Assurance and Testing",
      designation: "Junior",
      joinDate: "2023-01-12",
      phone: "+1234567894",
      address: "654 Bug Lane, Test Town",
      salary: 60000,
      accountApproved: true,
      createdAt: "2023-01-12T00:00:00Z",
      profilePicture: "/professional-woman-quality-assurance.jpg",
    },
    // Product Managers
    {
      id: "emp-006",
      employeeId: "EMP006",
      email: "david.martinez@dayflow.com",
      password: "password123",
      role: "employee",
      firstName: "David",
      lastName: "Martinez",
      department: "Product Manager",
      designation: "Senior",
      joinDate: "2019-11-05",
      phone: "+1234567895",
      address: "987 Product Road, PM City",
      salary: 110000,
      accountApproved: true,
      createdAt: "2019-11-05T00:00:00Z",
      profilePicture: "/professional-product-manager.png",
    },
    {
      id: "emp-007",
      employeeId: "EMP007",
      email: "jennifer.lee@dayflow.com",
      password: "password123",
      role: "employee",
      firstName: "Jennifer",
      lastName: "Lee",
      department: "Product Manager",
      designation: "Junior",
      joinDate: "2023-04-18",
      phone: "+1234567896",
      address: "147 Strategy Avenue, Business Bay",
      salary: 75000,
      accountApproved: true,
      createdAt: "2023-04-18T00:00:00Z",
      profilePicture: "/professional-woman-product-manager.png",
    },
    // IT Operations
    {
      id: "emp-008",
      employeeId: "EMP008",
      email: "robert.anderson@dayflow.com",
      password: "password123",
      role: "employee",
      firstName: "Robert",
      lastName: "Anderson",
      department: "IT Operations",
      designation: "Senior",
      joinDate: "2020-07-22",
      phone: "+1234567897",
      address: "258 Ops Boulevard, Server City",
      salary: 90000,
      accountApproved: true,
      createdAt: "2020-07-22T00:00:00Z",
      profilePicture: "/professional-man-it-operations.jpg",
    },
    {
      id: "emp-009",
      employeeId: "EMP009",
      email: "amanda.taylor@dayflow.com",
      password: "password123",
      role: "employee",
      firstName: "Amanda",
      lastName: "Taylor",
      department: "IT Operations",
      designation: "Junior",
      joinDate: "2022-10-30",
      phone: "+1234567898",
      address: "369 Network Lane, Cloud Town",
      salary: 62000,
      accountApproved: true,
      createdAt: "2022-10-30T00:00:00Z",
      profilePicture: "/professional-woman-it-support.jpg",
    },
    // Cybersecurity Engineers
    {
      id: "emp-010",
      employeeId: "EMP010",
      email: "kevin.garcia@dayflow.com",
      password: "password123",
      role: "employee",
      firstName: "Kevin",
      lastName: "Garcia",
      department: "Cybersecurity Engineer",
      designation: "Senior",
      joinDate: "2021-02-14",
      phone: "+1234567899",
      address: "741 Security Road, Safe City",
      salary: 105000,
      accountApproved: true,
      createdAt: "2021-02-14T00:00:00Z",
      profilePicture: "/professional-man-cybersecurity.jpg",
    },
    {
      id: "emp-011",
      employeeId: "EMP011",
      email: "sophia.rodriguez@dayflow.com",
      password: "password123",
      role: "employee",
      firstName: "Sophia",
      lastName: "Rodriguez",
      department: "Cybersecurity Engineer",
      designation: "Junior",
      joinDate: "2023-08-25",
      phone: "+1234567800",
      address: "852 Firewall Street, Cyber Town",
      salary: 70000,
      accountApproved: true,
      createdAt: "2023-08-25T00:00:00Z",
      profilePicture: "/professional-woman-cybersecurity.jpg",
    },
  ]

  // Seed attendance data for the last 30 days
  const attendance: AttendanceRecord[] = []
  const today = new Date()

  users
    .filter((u) => u.role === "employee")
    .forEach((user) => {
      for (let i = 0; i < 30; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue

        const statuses: AttendanceStatus[] = ["Present", "Present", "Present", "Present", "Late"]
        const status = statuses[Math.floor(Math.random() * statuses.length)]

        attendance.push({
          id: `att-${user.id}-${dateStr}`,
          employeeId: user.employeeId,
          date: dateStr,
          checkIn: status !== "Absent" ? "09:00" : undefined,
          checkOut: status !== "Absent" ? "18:00" : undefined,
          status,
          hoursWorked: status === "Present" ? 9 : status === "Half-day" ? 4.5 : 0,
        })
      }
    })

  localStorage.setItem("dayflow_users", JSON.stringify(users))
  localStorage.setItem("dayflow_attendance", JSON.stringify(attendance))
  localStorage.setItem("dayflow_leave_requests", JSON.stringify([]))
  localStorage.setItem("dayflow_salary_requests", JSON.stringify([]))
  localStorage.setItem("dayflow_payroll", JSON.stringify([]))
}
