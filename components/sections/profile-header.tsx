import { AvatarPreview } from "@/components/sections/avatar-preview";
import { CopyEmail } from "@/components/ui/copy-email";

export function ProfileHeader() {
  return (
    <div className="flex items-center gap-4 mt-3">
      <AvatarPreview />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Suresh Krishna
        </h1>
        <p className="text-sm text-muted-foreground">
          <span className="sm:hidden">Jr. Blockchain Dev</span>
          <span className="hidden sm:inline">Jr. Blockchain Developer</span> at{" "}
          <a
            href="https://blocsys.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline underline-offset-4"
          >
            Blocsys
          </a>
        </p>
        <p className="flex items-center text-sm text-muted-foreground">
          <CopyEmail email="krishnapaulraj2004@gmail.com" />
        </p>
      </div>
    </div>
  );
}
