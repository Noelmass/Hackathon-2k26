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
import { ProfileImageModal } from "@/components/profile-image-modal"
import { Search, Filter, ArrowUpDown } from "lucide-react"
import type { User } from "@/lib/types"
import Link from "next/link"

export default function AdminEmployees() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [employees, setEmployees] = useState<User[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [designationFilter, setDesignationFilter] = useState("all")
  const [sortBy, setSortBy] = useState("id-asc")
  const [selectedImage, setSelectedImage] = useState<{ url?: string; name: string } | null>(null)

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
    setFilteredEmployees(employeeList)
  }, [])

  useEffect(() => {
    let filtered = employees.filter((emp) => {
      const matchesSearch =
        emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDepartment = departmentFilter === "all" || emp.department === departmentFilter
      const matchesDesignation = designationFilter === "all" || emp.designation === designationFilter

      return matchesSearch && matchesDepartment && matchesDesignation
    })

    // Sort
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "id-asc":
          return a.employeeId.localeCompare(b.employeeId)
        case "id-desc":
          return b.employeeId.localeCompare(a.employeeId)
        case "salary-asc":
          return a.salary - b.salary
        case "salary-desc":
          return b.salary - a.salary
        case "name-asc":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case "name-desc":
          return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`)
        default:
          return 0
      }
    })

    setFilteredEmployees(filtered)
  }, [searchQuery, departmentFilter, designationFilter, sortBy, employees])

  if (isLoading || !user) {
    return null
  }

  const departments = Array.from(new Set(employees.map((e) => e.department)))
  const designations = Array.from(new Set(employees.map((e) => e.designation)))

  return (
    <div className="min-h-screen bg-(--color-background)">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-(--color-text-primary) mb-2">Employee Management</h1>
          <p className="text-(--color-text-secondary)">View and manage all employees</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--color-text-secondary) flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </label>
              <Input
                placeholder="Search by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-(--color-text-secondary) flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Department
              </label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-(--color-text-secondary) flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Designation
              </label>
              <Select value={designationFilter} onValueChange={setDesignationFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Designations</SelectItem>
                  {designations.map((desig) => (
                    <SelectItem key={desig} value={desig}>
                      {desig}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-(--color-text-secondary) flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Sort By
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id-asc">Employee ID (Ascending)</SelectItem>
                  <SelectItem value="id-desc">Employee ID (Descending)</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="salary-asc">Salary (Low to High)</SelectItem>
                  <SelectItem value="salary-desc">Salary (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-(--color-border) flex items-center justify-between">
            <p className="text-sm text-(--color-text-secondary)">
              Showing {filteredEmployees.length} of {employees.length} employees
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setDepartmentFilter("all")
                setDesignationFilter("all")
                setSortBy("id-asc")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Employee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => (
            <Card key={emp.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center mb-4">
                <div
                  className="cursor-pointer mb-3"
                  onClick={() =>
                    setSelectedImage({ url: emp.profilePicture, name: `${emp.firstName} ${emp.lastName}` })
                  }
                >
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg profile-image-hover">
                    <AvatarImage
                      src={emp.profilePicture || "/placeholder.svg"}
                      alt={`${emp.firstName} ${emp.lastName}`}
                    />
                    <AvatarFallback className="bg-(--color-primary) text-white text-xl">
                      {emp.firstName[0]}
                      {emp.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <Link href={`/admin/employees/${emp.id}`}>
                  <h3 className="text-lg font-bold text-(--color-text-primary) hover:text-(--color-primary) transition-colors cursor-pointer text-center">
                    {emp.firstName} {emp.lastName}
                  </h3>
                </Link>
                <p className="text-sm text-(--color-text-secondary) text-center">{emp.employeeId}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-(--color-text-secondary)">Department:</span>
                  <span className="text-(--color-text-primary) font-medium">{emp.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--color-text-secondary)">Designation:</span>
                  <span className="text-(--color-text-primary) font-medium">{emp.designation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--color-text-secondary)">Email:</span>
                  <span className="text-(--color-text-primary) font-medium text-xs truncate max-w-[150px]">
                    {emp.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--color-text-secondary)">Phone:</span>
                  <span className="text-(--color-text-primary) font-medium">{emp.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--color-text-secondary)">Joined:</span>
                  <span className="text-(--color-text-primary) font-medium">
                    {new Date(emp.joinDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-(--color-border)">
                  <span className="text-(--color-text-secondary)">Salary:</span>
                  <span className="text-(--color-primary) font-bold">${emp.salary.toLocaleString()}</span>
                </div>
              </div>

              <Link href={`/admin/employees/${emp.id}`}>
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  View Full Profile
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </main>

      {selectedImage && (
        <ProfileImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.url}
          name={selectedImage.name}
        />
      )}
    </div>
  )
}
