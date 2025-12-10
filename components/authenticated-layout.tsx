"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "./sidebar"

interface AuthenticatedLayoutProps {
  children: ReactNode
  boardId?: string // Added boardId prop to pass to Sidebar
}

export function AuthenticatedLayout({ children, boardId }: AuthenticatedLayoutProps) {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar boardId={boardId} /> {/* Pass boardId to Sidebar */}
      <main className="flex-1 ml-64">{children}</main>
    </div>
  )
}
