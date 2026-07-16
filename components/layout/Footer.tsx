import VisitorCount from "@/components/ui/VisitorCount";

export default function Footer() {
  return (
    <footer className="border-border text-muted-foreground mt-auto border-t">
      <div className="mx-auto w-full max-w-2xl px-6 py-6">
        <div className="flex flex-col gap-1 text-xs sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} Suresh Krishna Paulraj. All rights
            reserved.
          </p>
          <VisitorCount />
        </div>
      </div>
    </footer>
  );
}
