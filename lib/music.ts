export type Track = {
  name: string;
  artist: string;
  url: string;
  nowPlaying: boolean;
};

export async function getLastPlayed(): Promise<Track | null> {
  const { LASTFM_API_KEY, LASTFM_USERNAME } = process.env;
  if (!LASTFM_API_KEY || !LASTFM_USERNAME) return null;

  try {
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&limit=1&format=json`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;

    const data = await res.json();
    const track = data?.recenttracks?.track?.[0];
    if (!track) return null;

    return {
      name: track.name,
      artist: track.artist["#text"],
      url: track.url,
      nowPlaying: track["@attr"]?.nowplaying === "true",
    };
  } catch {
    return null;
  }
}
