"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/layout/UserMenu";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "All Documents", href: "/documents", icon: FileText },
  { label: "Trash", href: "/trash", icon: Trash2 },
] as const;

function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-[var(--border)] bg-[var(--background)] transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo / App Name */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <FileEdit className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-lg font-semibold text-[var(--foreground)]">
              DocEditor
            </span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className={cn(
            "inline-flex items-center justify-center rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--muted)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-[var(--border)] p-2">
        <UserMenu collapsed={collapsed} />
      </div>
    </aside>
  );
}

export { Sidebar };
