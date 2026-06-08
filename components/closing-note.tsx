import HighlightedHeading from "@/components/highlighted-heading";
import Signature from "@/components/signature";

export default function ClosingNote() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <Signature />
        <p className="mt-5">I&apos;m in love with this quote</p>
        <HighlightedHeading className="mt-0 font-medium">
          “Power comes in response to a need, not desire. <br /> You have to
          create that need.”
        </HighlightedHeading>
      </div>
    </div>
  );
}
