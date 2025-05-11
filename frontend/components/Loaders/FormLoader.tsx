import { Skeleton } from "@/components/ui/skeleton";

export default function FormLoader() {
  return (
    <div className="p-6 space-y-6 w-full max-w-2xl mx-auto">
      <Skeleton className="h-6 w-1/3" /> {/* Form title */}
      
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-1/4" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>
      ))}

      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" /> {/* Submit button */}
      </div>
    </div>
  );
}
