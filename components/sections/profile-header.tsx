import { AvatarPreview } from "@/components/sections/avatar-preview";
import { CopyEmail } from "@/components/ui/copy-email";

export function ProfileHeader() {
  return (
    <div className="mt-3 flex items-center gap-4">
      <AvatarPreview />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Suresh Krishna
        </h1>
        <p className="text-muted-foreground text-sm">
          <span className="sm:hidden">Jr. Blockchain Dev</span>
          <span className="hidden sm:inline">
            Jr. Blockchain Developer
          </span> at{" "}
          <a
            href="https://blocsys.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Blocsys
          </a>
        </p>
        <p className="text-muted-foreground flex items-center text-sm">
          <CopyEmail email="krishnapaulraj2004@gmail.com" />
        </p>
      </div>
    </div>
  );
}
