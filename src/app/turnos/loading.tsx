export default function Loading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
      </div>
      <div className="h-96 bg-muted animate-pulse rounded-lg" />
    </div>
  )
}

