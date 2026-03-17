import { Skeleton } from "./ui/skeleton";

export function SkeletonLoaderLeaderboard(){
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      </div>
  )
}