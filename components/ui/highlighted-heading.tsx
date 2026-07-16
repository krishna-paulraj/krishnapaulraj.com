import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className: string;
}
const HighlightedHeading = ({ children, className }: Props) => {
  return (
    <h2
      className={cn(
        "text-foreground relative mt-4 w-fit max-w-lg text-sm font-normal md:text-base",
        className,
      )}
    >
      <div
        className="bg-muted absolute inset-0 h-full w-full scale-[1.04]"
        style={{ opacity: 1 }}
      >
        <div className="bg-border absolute -top-px -left-px h-1 w-1 animate-pulse rounded-full"></div>
        <div className="bg-border absolute -top-px -right-px h-1 w-1 animate-pulse rounded-full"></div>
        <div className="bg-border absolute -bottom-px -left-px h-1 w-1 animate-pulse rounded-full"></div>
        <div className="bg-border absolute -right-px -bottom-px h-1 w-1 animate-pulse rounded-full"></div>
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
