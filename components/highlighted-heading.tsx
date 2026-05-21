import { cn } from "@/utils";

interface Props {
  children: React.ReactNode;
  className: string;
}
const HighlightedHeading = ({ children, className }: Props) => {
  return (
    <h2
      className={cn(
        "relative mt-4 w-fit max-w-lg text-sm font-normal text-neutral-800 dark:text-neutral-200 md:text-base",
        className,
      )}
    >
      <div
        className="absolute inset-0 h-full w-full scale-[1.04] bg-neutral-100 dark:bg-neutral-800"
        style={{ opacity: 1 }}
      >
        <div className="absolute -left-px -top-px h-1 w-1 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-600"></div>
        <div className="absolute -right-px -top-px h-1 w-1 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-600"></div>
        <div className="absolute -bottom-px -left-px h-1 w-1 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-600"></div>
        <div className="absolute -bottom-px -right-px h-1 w-1 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-600"></div>
      </div>
      <span
        className="inline-block text-base"
        style={{ opacity: 1, filter: "blur(0px)", transform: "none" }}
      >
        {children}
      </span>
    </h2>
  );
};

export default HighlightedHeading;
