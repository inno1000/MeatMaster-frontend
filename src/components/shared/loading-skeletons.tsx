import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SelectFieldSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-12 w-full rounded-2xl", className)} />;
}

export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  );
}

export function FormFieldsGridSkeleton({
  count = 4,
  cols = 2,
}: {
  count?: number;
  cols?: 1 | 2;
}) {
  return (
    <div className={cn("grid gap-3", cols === 2 && "sm:grid-cols-2")}>
      {Array.from({ length: count }).map((_, i) => (
        <FormFieldSkeleton key={i} />
      ))}
    </div>
  );
}

export function MobileCardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3 md:hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-border/70 p-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function DataTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="hidden space-y-2 md:block">
      <Skeleton className="h-10 w-full rounded-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function ListPageSkeleton() {
  return (
    <>
      <MobileCardListSkeleton count={4} />
      <DataTableSkeleton rows={5} />
    </>
  );
}

export function StatsCardsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div
      className={cn(
        "grid gap-3",
        count <= 2 ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4",
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-3xl" />
      ))}
    </div>
  );
}

export function SimpleChoiceGridSkeleton({
  count = 4,
  columns = 2,
}: {
  count?: number;
  columns?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2",
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="min-h-[5.5rem] rounded-2xl" />
      ))}
    </div>
  );
}

export function SimpleNumericPadSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="mx-auto h-8 w-40" />
      <Skeleton className="mx-auto h-12 w-36 rounded-xl" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function DistributionBlockSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-border/50 bg-card p-5 shadow-card max-md:rounded-3xl">
      <Skeleton className="h-5 w-36" />
      <FormFieldSkeleton />
      <FormFieldsGridSkeleton count={2} />
    </div>
  );
}
