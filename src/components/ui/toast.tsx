"use client";

import * as React from "react";
import { create } from "zustand";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({ toasts: [...state.toasts, toast] })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

let toastCounter = 0;

function toast(message: string, variant: ToastVariant = "info") {
  const id = `toast-${++toastCounter}-${Date.now()}`;
  useToastStore.getState().addToast({ id, message, variant });

  setTimeout(() => {
    useToastStore.getState().removeToast(id);
  }, 3000);
}

const variantClasses: Record<ToastVariant, string> = {
  success:
    "border-green-500/30 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100",
  error:
    "border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100",
  info: "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]",
};

const iconMap: Record<ToastVariant, React.ReactNode> = {
  success: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  ),
  info: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
};

function ToastItem({ toast: t }: { toast: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right-full",
        variantClasses[t.variant]
      )}
      role="alert"
    >
      <span className="shrink-0">{iconMap[t.variant]}</span>
      <p className="flex-1 text-sm font-medium">{t.message}</p>
      <button
        type="button"
        className="shrink-0 rounded-sm opacity-70 hover:opacity-100"
        onClick={() => removeToast(t.id)}
        aria-label="Dismiss"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}

function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

export { toast, Toaster, useToastStore };
