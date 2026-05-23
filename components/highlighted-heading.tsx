import { cn } from "@/utils";

interface Props {
  children: React.ReactNode;
  className: string;
}
const HighlightedHeading = ({ children, className }: Props) => {
  return (
    <h2
      className={cn(
        "relative mt-4 w-fit max-w-lg text-sm font-normal text-foreground md:text-base",
        className,
      )}
    >
      <div
        className="absolute inset-0 h-full w-full scale-[1.04] bg-muted"
        style={{ opacity: 1 }}
      >
        <div className="absolute -left-px -top-px h-1 w-1 animate-pulse rounded-full bg-border"></div>
        <div className="absolute -right-px -top-px h-1 w-1 animate-pulse rounded-full bg-border"></div>
        <div className="absolute -bottom-px -left-px h-1 w-1 animate-pulse rounded-full bg-border"></div>
        <div className="absolute -bottom-px -right-px h-1 w-1 animate-pulse rounded-full bg-border"></div>
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
