"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { seedInitialData } from "@/lib/seed-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Eye, EyeOff, Building2, Users, Clock, TrendingUp } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { user, login, signup, isLoading } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    employeeId: "",
    department: "",
    designation: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    seedInitialData()
  }, [])

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/employee/dashboard")
      }
    }
  }, [user, isLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await login(loginData.email, loginData.password)
    if (!success) {
      alert("Invalid credentials or account not approved")
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await signup(signupData)
    if (success) {
      alert("Account created! Please wait for admin approval.")
      setIsSignup(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-[#2563eb]" />
            </div>
            <h1 className="text-3xl font-bold">Dayflow</h1>
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl font-bold leading-tight">
              Every workday,
              <br />
              perfectly aligned.
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
              Streamline your HR operations with our comprehensive management system.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <Users className="w-8 h-8 text-blue-200" />
            <div className="text-2xl font-bold">500+</div>
            <div className="text-sm text-blue-100">Active Employees</div>
          </div>
          <div className="space-y-2">
            <Clock className="w-8 h-8 text-blue-200" />
            <div className="text-2xl font-bold">99.8%</div>
            <div className="text-sm text-blue-100">Attendance Rate</div>
          </div>
          <div className="space-y-2">
            <TrendingUp className="w-8 h-8 text-blue-200" />
            <div className="text-2xl font-bold">95%</div>
            <div className="text-sm text-blue-100">Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-8 shadow-xl border-(--color-border)">
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-(--color-primary) rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-(--color-text-primary)">Dayflow</h1>
            </div>
            <h2 className="text-3xl font-bold text-(--color-text-primary) mb-2">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-(--color-text-secondary)">
              {isSignup ? "Sign up to get started" : "Sign in to your account"}
            </p>
          </div>

          {!isSignup ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-primary)">Email</label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-primary)">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-tertiary) hover:text-(--color-text-secondary)"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-(--color-primary) hover:bg-(--color-primary-dark) text-white font-medium"
              >
                Sign In
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-(--color-text-secondary)">Demo accounts: admin@dayflow.com / admin123</p>
                <p className="text-sm text-(--color-text-secondary)">Employee: john.smith@dayflow.com / password123</p>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignup(true)}
                  className="text-(--color-primary) hover:text-(--color-primary-dark) font-medium text-sm"
                >
                  Need an account? Sign up
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--color-text-primary)">First Name</label>
                  <Input
                    placeholder="John"
                    value={signupData.firstName}
                    onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--color-text-primary)">Last Name</label>
                  <Input
                    placeholder="Doe"
                    value={signupData.lastName}
                    onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-primary)">Employee ID</label>
                <Input
                  placeholder="EMP001"
                  value={signupData.employeeId}
                  onChange={(e) => setSignupData({ ...signupData, employeeId: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-primary)">Email</label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-primary)">Password</label>
                <Input
                  type="password"
                  placeholder="Create a password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-primary)">Department</label>
                <Select
                  value={signupData.department}
                  onValueChange={(v) => setSignupData({ ...signupData, department: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software Developer">Software Developer</SelectItem>
                    <SelectItem value="Quality Assurance and Testing">Quality Assurance and Testing</SelectItem>
                    <SelectItem value="Product Manager">Product Manager</SelectItem>
                    <SelectItem value="IT Operations">IT Operations</SelectItem>
                    <SelectItem value="Cybersecurity Engineer">Cybersecurity Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-primary)">Designation</label>
                <Select
                  value={signupData.designation}
                  onValueChange={(v) => setSignupData({ ...signupData, designation: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Head of Department">Head of Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-primary)">Phone</label>
                <Input
                  type="tel"
                  placeholder="+1234567890"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--color-text-primary)">Address</label>
                <Input
                  placeholder="Your address"
                  value={signupData.address}
                  onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-(--color-primary) hover:bg-(--color-primary-dark) text-white font-medium"
              >
                Create Account
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignup(false)}
                  className="text-(--color-primary) hover:text-(--color-primary-dark) font-medium text-sm"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
