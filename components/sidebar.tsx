/**
 * =============================================================================
 * SIDEBAR COMPONENT
 * =============================================================================
 * Main navigation sidebar for authenticated pages.
 *
 * Features:
 * - Navigation links to main sections (Boards, Profile, Manage)
 * - Dynamic "Manage" link visibility based on Scrum Master status
 * - Current user display with name and email
 * - Logout functionality
 *
 * The "Manage" option is only visible when:
 * 1. User is viewing a specific board (boardId is provided)
 * 2. User is the Scrum Master of that board (their email matches creator email)
 * =============================================================================
 */

"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { boardsApi } from "@/lib/api";

// -----------------------------------------------------------------------------
// Component Props
// -----------------------------------------------------------------------------

interface SidebarProps {
  /** Optional board ID - when provided, enables board-specific features */
  boardId?: string;
}

// -----------------------------------------------------------------------------
// Sidebar Component
// -----------------------------------------------------------------------------

export function Sidebar({ boardId }: SidebarProps) {
  // Current route for active link highlighting
  const pathname = usePathname();

  // Get current user from auth context
  const { user, logout } = useAuth();

  // Track if current user is the Scrum Master of the current board
  const [isScrumMaster, setIsScrumMaster] = useState(false);

  // ---------------------------------------------------------------------------
  // Check Scrum Master status when board or user changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (boardId && user) {
      // Check if user is Scrum Master of the current team/board
      const currentTeam = user.teams?.find(
        (team) => team.id.toString() === boardId
      );
      setIsScrumMaster(currentTeam?.scrumMaster || false);
    } else {
      setIsScrumMaster(false);
    }
  }, [boardId, user]);

  // ---------------------------------------------------------------------------
  // Navigation Items Configuration
  // ---------------------------------------------------------------------------
  const navItems = [
    {
      label: "My Boards",
      href: "/boards",
      icon: <LayoutGrid className="h-5 w-5" />,
      visible: true, // Always visible
    },
    {
      label: "My Profile",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
      visible: true, // Always visible
    },
    {
      label: "Manage",
      href: boardId ? `/board/${boardId}/manage` : "/manage",
      icon: <Settings className="h-5 w-5" />,
      // Only visible if viewing a board AND user is Scrum Master
      visible: boardId ? isScrumMaster : false,
    },
  ];

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handles logout with confirmation
   */
  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <aside className="w-64 border-r border-border bg-card h-screen sticky top-0 flex flex-col">
      {/* Header with app branding */}
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Kanban Board</h2>
        <p className="text-sm text-muted-foreground mt-1">Project Management</p>
      </div>

      {/* Navigation Links */}
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
                      pathname === item.href &&
                        "bg-muted text-foreground font-medium"
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

      {/* Footer with user info and logout */}
      <div className="p-4 border-t border-border space-y-3">
        {/* User Info Card */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-base bg-transparent"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
