"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Editor } from "@/components/editor/Editor";
import { useEditorStore } from "@/stores/editor-store";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, Check } from "lucide-react";

interface Document {
  id: string;
  title: string;
  content: string;
  contentHtml: string;
  updatedAt: string;
}

export default function DocumentEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isSaving, lastSavedAt, setIsSaving, setLastSavedAt } =
    useEditorStore();

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [title, setTitle] = useState("");

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<string>("");

  // Fetch document on mount
  useEffect(() => {
    async function fetchDocument() {
      try {
        const res = await fetch(`/api/documents/${params.id}`);
        if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch document");

        const data = await res.json();
        setDocument(data);
        setTitle(data.title);
        contentRef.current = data.contentHtml || data.content || "";
        setLoading(false);
      } catch {
        setNotFound(true);
        setLoading(false);
      }
    }

    fetchDocument();
  }, [params.id]);

  // Save function
  const saveDocument = useCallback(
    async (updates: { title?: string; contentHtml?: string }) => {
      setIsSaving(true);
      try {
        const res = await fetch(`/api/documents/${params.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          setLastSavedAt(new Date());
        }
      } catch {
        // Silently fail - user sees no "Saved" indicator
      } finally {
        setIsSaving(false);
      }
    },
    [params.id, setIsSaving, setLastSavedAt]
  );

  // Handle content update with debounce
  const handleContentUpdate = useCallback(
    (html: string) => {
      contentRef.current = html;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        saveDocument({ contentHtml: html });
      }, 2000);
    },
    [saveDocument]
  );

  // Handle title save on blur
  const handleTitleBlur = useCallback(() => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== document?.title) {
      saveDocument({ title: trimmed });
    }
  }, [title, document?.title, saveDocument]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Format last saved time
  const formatLastSaved = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 5) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full max-w-5xl mx-auto w-full px-4 py-6 gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-10 w-full rounded-t-lg" />
        <Skeleton className="h-[500px] w-full rounded-b-lg" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Document not found
        </h1>
        <p className="text-[var(--muted-foreground)]">
          The document you are looking for does not exist or you do not have
          access.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full px-4 py-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => router.push("/dashboard")}
            className="shrink-0 p-1.5 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            className="flex-1 min-w-0 text-xl font-semibold bg-transparent border-none outline-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-0"
            placeholder="Untitled Document"
          />
        </div>

        {/* Save status */}
        <div className="shrink-0 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          {isSaving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : lastSavedAt ? (
            <>
              <Check size={14} className="text-green-500" />
              <span>Saved {formatLastSaved(lastSavedAt)}</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          content={document?.contentHtml || document?.content || ""}
          onUpdate={handleContentUpdate}
          editable
        />
      </div>
    </div>
  );
}
