"use client";

import { useEffect, useRef, useState } from "react";
import SignatureAnimation from "signature-animation";

export default function Signature() {
  const ref = useRef<HTMLDivElement>(null);
  // The package draws on mount, so delay mounting until the signature
  // scrolls into view — otherwise it finishes while you're still at the top.
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="signature-wrap text-foreground flex min-h-[51px] items-center justify-center"
    >
      {inView && (
        <SignatureAnimation duration={0.4} delay={0}>
          Krishna
        </SignatureAnimation>
      )}
    </div>
  );
}
