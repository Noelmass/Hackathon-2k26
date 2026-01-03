import { LoginForm } from "@/components/auth/login-form"
import { Calendar } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center mb-8 space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calendar className="h-10 w-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-balance">Dayflow</h1>
        </div>
        <p className="text-lg text-muted-foreground text-balance">Every workday, perfectly aligned.</p>
      </div>
      <LoginForm />
    </div>
  )
}
