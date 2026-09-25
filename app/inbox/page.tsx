import { MessagesSquareIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function InboxPage() {
  return (
    <Empty className="my-auto">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MessagesSquareIcon />
        </EmptyMedia>
        <EmptyTitle>Pick a conversation</EmptyTitle>
        <EmptyDescription>
          Choose one from the list to read it and reply.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
