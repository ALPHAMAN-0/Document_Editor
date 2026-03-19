"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/utils";

interface Document {
  id: string;
  title: string;
  deletedAt: string;
  updatedAt: string;
}

interface DocumentsResponse {
  documents: Document[];
}

export default function TrashPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchDeletedDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/documents?deleted=true");
      if (!res.ok) throw new Error("Failed to fetch deleted documents");
      const data: DocumentsResponse = await res.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error("Failed to fetch deleted documents:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeletedDocuments();
  }, [fetchDeletedDocuments]);

  const handleRestore = async (id: string) => {
    try {
      setActionInProgress(id);
      const res = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deletedAt: null }),
      });
      if (!res.ok) throw new Error("Failed to restore document");
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Failed to restore document:", error);
    } finally {
      setActionInProgress(null);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    try {
      setActionInProgress(id);
      const res = await fetch(`/api/documents/${id}?permanent=true`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to permanently delete document");
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Failed to delete document:", error);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Trash</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Documents you&apos;ve deleted. Restore or permanently remove them.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="h-5 w-1/3 rounded bg-[var(--muted)]" />
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--muted)]">
            <Trash2 className="h-7 w-7 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
            Trash is empty
          </h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Deleted documents will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              Documents in trash can be restored or permanently deleted.
            </span>
          </div>

          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium text-[var(--foreground)]">
                  {doc.title}
                </h3>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  Deleted {formatRelativeDate(doc.deletedAt)}
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(doc.id)}
                  disabled={actionInProgress === doc.id}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Restore
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handlePermanentDelete(doc.id)}
                  disabled={actionInProgress === doc.id}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
