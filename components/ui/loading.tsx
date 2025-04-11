import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({ size = "md", className }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex items-center justify-center relative", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-current border-white border-t-gold  border-b-gold",
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      ></div>
      <span className="text-white text-sm absolute text-gold">
        L<span>&</span>K
      </span>
    </div>
  );
}
