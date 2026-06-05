import HighlightedHeading from "@/components/highlighted-heading";
import Signature from "@/components/signature";

export default function ClosingNote() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <Signature />
        <p className="mt-5">Ending on a note I try to live by</p>
        <HighlightedHeading className="mt-0 font-medium">
          “There’s nothing to lose, only experience to gain.”
        </HighlightedHeading>
      </div>
    </div>
  );
}
