import { Sidebar } from "@/components/sidebar"
import { User, Mail, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="scrum-master" />

      <div className="flex-1">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">View and manage your profile information</p>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <Card className="p-6 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">John Doe</h2>
                <p className="text-muted-foreground">Scrum Master</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5" />
                <span>john.doe@example.com</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span>Joined January 2024</span>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
