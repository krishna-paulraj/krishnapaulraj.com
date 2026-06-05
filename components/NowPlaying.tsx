import Image from "next/image";
import appleMusicIcon from "@/assets/apple-music.svg";
import { getLastPlayed } from "@/lib/music";

export default async function NowPlaying() {
  const track = await getLastPlayed();
  if (!track) return null;

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <Image
        src={appleMusicIcon}
        alt="Apple Music"
        width={18}
        height={18}
        className="shrink-0"
      />
      <span className="shrink-0 whitespace-nowrap">
        {track.nowPlaying ? "Now playing" : "Last played"}
      </span>
      <span className="shrink-0 text-muted-foreground/50">—</span>
      <span className="min-w-0 truncate text-foreground">
        {track.name}
        <span className="text-muted-foreground"> · {track.artist}</span>
      </span>
    </a>
  );
}
