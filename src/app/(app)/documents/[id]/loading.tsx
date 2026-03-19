import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentEditorLoading() {
  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full px-4 py-6 gap-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Toolbar skeleton */}
      <div className="flex items-center gap-1 border border-[var(--border)] rounded-t-lg p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={`fmt-${i}`} className="h-7 w-7 rounded" />
        ))}
        <div className="w-px h-6 bg-[var(--border)] mx-1" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={`head-${i}`} className="h-7 w-7 rounded" />
        ))}
        <div className="w-px h-6 bg-[var(--border)] mx-1" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={`align-${i}`} className="h-7 w-7 rounded" />
        ))}
        <div className="w-px h-6 bg-[var(--border)] mx-1" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={`list-${i}`} className="h-7 w-7 rounded" />
        ))}
        <div className="w-px h-6 bg-[var(--border)] mx-1" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={`ins-${i}`} className="h-7 w-7 rounded" />
        ))}
      </div>

      {/* Editor content skeleton */}
      <div className="flex-1 border border-t-0 border-[var(--border)] rounded-b-lg p-8 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="h-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}
