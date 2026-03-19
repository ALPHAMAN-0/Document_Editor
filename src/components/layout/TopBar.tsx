"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  title?: string;
  className?: string;
  onNewDocument?: () => void;
}

function TopBar({ title, className, onNewDocument }: TopBarProps) {
  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-6",
        className
      )}
    >
      {/* Left: Breadcrumb / Page Title */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-[var(--foreground)]">
          {title || "Dashboard"}
        </h1>
      </div>

      {/* Right: New Document Button */}
      <div className="flex items-center gap-2">
        <Button onClick={onNewDocument} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          New Document
        </Button>
      </div>
    </header>
  );
}

export { TopBar };
