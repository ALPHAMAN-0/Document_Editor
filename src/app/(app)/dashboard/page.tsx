"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeDate, getInitials } from "@/lib/utils";

interface DocumentOwner {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Document {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  owner: DocumentOwner;
}

interface DocumentsResponse {
  documents: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data: DocumentsResponse = await res.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleCreateDocument = async () => {
    try {
      setCreating(true);
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to create document");
      const doc = await res.json();
      router.push(`/documents/${doc.id}`);
    } catch (error) {
      console.error("Failed to create document:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            My Documents
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Create and manage your documents
          </p>
        </div>
        <Button onClick={handleCreateDocument} disabled={creating}>
          <Plus className="mr-2 h-4 w-4" />
          {creating ? "Creating..." : "New Document"}
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="mb-3 h-5 w-3/4 rounded bg-[var(--muted)]" />
              <div className="mb-4 h-4 w-1/2 rounded bg-[var(--muted)]" />
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[var(--muted)]" />
                <div className="h-3 w-20 rounded bg-[var(--muted)]" />
              </div>
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--muted)]">
            <FileText className="h-7 w-7 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
            No documents yet
          </h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Get started by creating your first document.
          </p>
          <Button className="mt-6" onClick={handleCreateDocument} disabled={creating}>
            <Plus className="mr-2 h-4 w-4" />
            Create your first document
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => router.push(`/documents/${doc.id}`)}
              className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-left transition-all hover:border-[var(--primary)]/30 hover:shadow-md"
            >
              <div className="mb-1 flex items-start justify-between">
                <FileText className="h-5 w-5 shrink-0 text-[var(--muted-foreground)] group-hover:text-[var(--primary)]" />
              </div>
              <h3 className="mt-2 truncate text-sm font-semibold text-[var(--foreground)]">
                {doc.title}
              </h3>
              <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                <Clock className="h-3 w-3" />
                <span>{formatRelativeDate(doc.updatedAt)}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Avatar
                  src={doc.owner.image}
                  alt={doc.owner.name || ""}
                  fallback={getInitials(doc.owner.name)}
                  size="sm"
                />
                <span className="truncate text-xs text-[var(--muted-foreground)]">
                  {doc.owner.name || doc.owner.email}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
