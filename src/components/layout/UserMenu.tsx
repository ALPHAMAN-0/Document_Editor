"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  collapsed?: boolean;
}

function UserMenu({ collapsed = false }: UserMenuProps) {
  const { data: session } = useSession();

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-[var(--muted)] cursor-pointer",
            collapsed && "justify-center px-2"
          )}
        >
          <Avatar
            src={userImage}
            alt={userName}
            fallback={getInitials(userName)}
            size="sm"
          />
          {!collapsed && (
            <div className="flex-1 overflow-hidden text-left">
              <p className="truncate font-medium text-[var(--foreground)]">
                {userName}
              </p>
              <p className="truncate text-xs text-[var(--muted-foreground)]">
                {userEmail}
              </p>
            </div>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* User info in dropdown header */}
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-[var(--foreground)]">
            {userName}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">{userEmail}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {}}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserMenu };
