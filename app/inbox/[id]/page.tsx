import { ThreadView } from "@/components/sections/inbox/thread-view";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Keyed so moving between conversations remounts rather than merging one
  // thread's messages into another's state.
  return <ThreadView key={id} threadId={id} />;
}
