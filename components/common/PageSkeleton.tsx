interface PageSkeletonProps { rows?: number; }

export function PageSkeleton({ rows = 4 }: PageSkeletonProps) {
  return (
    <div role="status" aria-label="Loading content" className="animate-pulse space-y-4">
      <div className="h-12 rounded-2xl bg-stone-200" />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="h-4 w-2/3 rounded bg-stone-200" />
          <div className="mt-3 h-3 w-full rounded bg-stone-100" />
          <div className="mt-2 h-3 w-1/2 rounded bg-stone-100" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
