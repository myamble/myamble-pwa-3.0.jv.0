import { cn } from "~/pages/_lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-2 border-primary",
        className,
      )}
      style={{ width: "20px", height: "20px" }}
      {...props}
    />
  );
}
