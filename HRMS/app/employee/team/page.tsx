"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProfileImageModal } from "@/components/profile-image-modal"
import { Search, Filter, Users, Mail, Phone, Briefcase } from "lucide-react"
import type { User } from "@/lib/types"

export default function TeamMembers() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [teamMembers, setTeamMembers] = useState<User[]>([])
  const [filteredMembers, setFilteredMembers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [selectedImage, setSelectedImage] = useState<{ url?: string; name: string } | null>(null)
  const [selectedMember, setSelectedMember] = useState<User | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    } else if (!isLoading && user?.role !== "employee") {
      router.push("/admin/dashboard")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const allUsers = JSON.parse(localStorage.getItem("dayflow_users") || "[]")
    const members = allUsers.filter((u: User) => u.role === "employee" && u.accountApproved && u.id !== user?.id)
    setTeamMembers(members)
    setFilteredMembers(members)
  }, [user])

  useEffect(() => {
    const filtered = teamMembers.filter((member) => {
      const matchesSearch =
        member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.employeeId.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter

      return matchesSearch && matchesDepartment
    })

    setFilteredMembers(filtered)
  }, [searchQuery, departmentFilter, teamMembers])

  if (isLoading || !user) {
    return null
  }

  const departments = Array.from(new Set(teamMembers.map((m) => m.department)))

  const departmentCounts = teamMembers.reduce(
    (acc, member) => {
      acc[member.department] = (acc[member.department] || 0) + 1
      return acc
    },
    {} as { [key: string]: number },
  )

  return (
    <div className="min-h-screen bg-(--color-background)">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-(--color-text-primary) mb-2">Team Members</h1>
          <p className="text-(--color-text-secondary)">Connect with your colleagues</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-(--color-primary)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--color-text-primary)">{teamMembers.length}</p>
                <p className="text-xs text-(--color-text-secondary)">Total Members</p>
              </div>
            </div>
          </Card>

          {Object.entries(departmentCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([dept, count]) => (
              <Card key={dept} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-(--color-accent)" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-(--color-text-primary)">{count}</p>
                    <p className="text-xs text-(--color-text-secondary) truncate">{dept}</p>
                  </div>
                </div>
              </Card>
            ))}
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--color-text-secondary) flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Team Members
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
                Filter by Department
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
          </div>

          <div className="mt-4 pt-4 border-t border-(--color-border)">
            <p className="text-sm text-(--color-text-secondary)">
              Showing {filteredMembers.length} of {teamMembers.length} team members
            </p>
          </div>
        </Card>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card
              key={member.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <div className="flex flex-col items-center mb-4">
                <div
                  className="cursor-pointer mb-3"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage({ url: member.profilePicture, name: `${member.firstName} ${member.lastName}` })
                  }}
                >
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg profile-image-hover">
                    <AvatarImage
                      src={member.profilePicture || "/placeholder.svg"}
                      alt={`${member.firstName} ${member.lastName}`}
                    />
                    <AvatarFallback className="bg-(--color-primary) text-white text-xl">
                      {member.firstName[0]}
                      {member.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="text-lg font-bold text-(--color-text-primary) text-center hover:text-(--color-primary) transition-colors">
                  {member.firstName} {member.lastName}
                </h3>
                <p className="text-sm text-(--color-text-secondary) text-center">{member.employeeId}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 p-2 bg-(--color-muted) rounded">
                  <Briefcase className="w-4 h-4 text-(--color-text-secondary)" />
                  <div className="flex-1">
                    <p className="text-xs text-(--color-text-tertiary)">Department</p>
                    <p className="text-sm font-medium text-(--color-text-primary)">{member.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-(--color-muted) rounded">
                  <Briefcase className="w-4 h-4 text-(--color-text-secondary)" />
                  <div className="flex-1">
                    <p className="text-xs text-(--color-text-tertiary)">Designation</p>
                    <p className="text-sm font-medium text-(--color-text-primary)">{member.designation}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMember(null)}
        >
          <Card className="max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center mb-6">
              <div
                className="cursor-pointer mb-4"
                onClick={() =>
                  setSelectedImage({
                    url: selectedMember.profilePicture,
                    name: `${selectedMember.firstName} ${selectedMember.lastName}`,
                  })
                }
              >
                <Avatar className="h-24 w-24 border-4 border-white shadow-xl profile-image-hover">
                  <AvatarImage
                    src={selectedMember.profilePicture || "/placeholder.svg"}
                    alt={`${selectedMember.firstName} ${selectedMember.lastName}`}
                  />
                  <AvatarFallback className="bg-(--color-primary) text-white text-2xl">
                    {selectedMember.firstName[0]}
                    {selectedMember.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-2xl font-bold text-(--color-text-primary) text-center">
                {selectedMember.firstName} {selectedMember.lastName}
              </h2>
              <p className="text-(--color-text-secondary) text-center">{selectedMember.designation}</p>
              <p className="text-sm text-(--color-text-tertiary) text-center">{selectedMember.employeeId}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-(--color-muted) rounded-lg">
                <Mail className="w-5 h-5 text-(--color-text-secondary)" />
                <div className="flex-1">
                  <p className="text-xs text-(--color-text-secondary) mb-1">Email</p>
                  <p className="text-sm font-medium text-(--color-text-primary)">{selectedMember.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-(--color-muted) rounded-lg">
                <Phone className="w-5 h-5 text-(--color-text-secondary)" />
                <div className="flex-1">
                  <p className="text-xs text-(--color-text-secondary) mb-1">Phone</p>
                  <p className="text-sm font-medium text-(--color-text-primary)">{selectedMember.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-(--color-muted) rounded-lg">
                <Briefcase className="w-5 h-5 text-(--color-text-secondary)" />
                <div className="flex-1">
                  <p className="text-xs text-(--color-text-secondary) mb-1">Department</p>
                  <p className="text-sm font-medium text-(--color-text-primary)">{selectedMember.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-(--color-muted) rounded-lg">
                <Briefcase className="w-5 h-5 text-(--color-text-secondary)" />
                <div className="flex-1">
                  <p className="text-xs text-(--color-text-secondary) mb-1">Designation</p>
                  <p className="text-sm font-medium text-(--color-text-primary)">{selectedMember.designation}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="mt-6 w-full py-2 bg-(--color-primary) text-white rounded-lg hover:bg-(--color-primary-dark) transition-colors"
            >
              Close
            </button>
          </Card>
        </div>
      )}

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
