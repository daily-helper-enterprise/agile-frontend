"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, User, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type SidebarProps = {
  userRole?: "user" | "scrum-master"
}

export function Sidebar({ userRole = "user" }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      label: "Task Board",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
      visible: true,
    },
    {
      label: "My Profile",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
      visible: true,
    },
    {
      label: "Manage",
      href: "/manage",
      icon: <Settings className="h-5 w-5" />,
      visible: userRole === "scrum-master",
    },
  ]

  return (
    <aside className="w-64 border-r border-border bg-card h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Kanban Board</h2>
        <p className="text-sm text-muted-foreground mt-1">Project Management</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems
            .filter((item) => item.visible)
            .map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 text-base",
                      pathname === item.href && "bg-muted text-foreground font-medium",
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                </Link>
              </li>
            ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">John Doe</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole.replace("-", " ")}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
