import Image from "next/image"
import { getLastPlayed } from "@/lib/music"

export default async function NowPlaying() {
  const track = await getLastPlayed()
  if (!track) return null

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 group"
    >
      {track.image ? (
        <Image
          src={track.image}
          alt={track.album}
          width={40}
          height={40}
          className="rounded"
        />
      ) : (
        <span className="text-xl text-zinc-400 dark:text-zinc-500">♫</span>
      )}
      <div>
        <p className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-0.5">
          {track.nowPlaying ? "Now playing" : "Last played"}
        </p>
        <p className="text-sm font-medium text-zinc-900 dark:text-white group-hover:underline">
          {track.name}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{track.artist}</p>
      </div>
    </a>
  )
}
