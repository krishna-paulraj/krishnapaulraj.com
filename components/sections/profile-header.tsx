import Image from "next/image";

import { CopyEmail } from "@/components/ui/copy-email";
import pfpDark from "@/assets/pfp_dark.png";
import pfpLight from "@/assets/pfp_light.png";

export function ProfileHeader() {
  return (
    <div className="flex items-center gap-4 mt-3">
      <Image
        src={pfpLight}
        alt="Suresh Krishna Paulraj"
        width={110}
        height={110}
        className="size-20 rounded-full object-cover shrink-0 sm:size-[110px] dark:hidden"
        priority
      />
      <Image
        src={pfpDark}
        alt="Suresh Krishna Paulraj"
        width={110}
        height={110}
        className="size-20 rounded-full object-cover shrink-0 hidden sm:size-[110px] dark:block"
        priority
      />
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
