"use client";

import { useEffect, useId, useRef } from "react";
import type { Transition } from "motion/react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { metalClickSound } from "@/lib/metal-click";
import { useSound } from "@/hooks/soundcn/use-sound";

const transition: Transition = {
  type: "spring",
  mass: 0.5,
  damping: 18,
  stiffness: 200,
};

/**
 * An isometric "SK." mark whose outline is traced by a gradient highlight
 * that follows the cursor, paired with a springy press effect and a tactile
 * click sound. Based on @ncdai/spotlight-logo; the artwork is generated —
 * pixel-style letters, each drawn as a single polygon on a 2:1 isometric grid
 * (x = 0.5 + (w+h)·55.425, y = 301.58 + (h−w)·32) and extruded 32px down.
 * The S is bars 1.25 thick; the K is a 1.25-wide stem plus five identical
 * 1.5×1.5 staircase cells; the dot cube sits baseline-aligned after the K.
 * Wall edges are stroked beneath the top faces so the faces occlude them
 * where they pass behind; outlines are stroked on top. Pressing sinks the
 * top plane 16px; the paired normal/pressed `d` values keep an identical
 * command structure so the path morph interpolates cleanly.
 */
export function SpotlightLogo() {
  const id = useId();
  const ids = {
    facePattern: `spotlight-logo-face-pattern-${id}`,
    faceFill: `spotlight-logo-face-fill-${id}`,
    strokeBelow: `spotlight-logo-stroke-below-${id}`,
    strokeAbove: `spotlight-logo-stroke-above-${id}`,
    radialGradient: `spotlight-logo-radial-gradient-${id}`,
  };

  const ref = useRef<SVGSVGElement>(null);

  const [play] = useSound(metalClickSound);

  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(ref, { margin: "80px" });

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const cx = useSpring(useTransform(mouseX, [0, 1], [0, 930]), {
    stiffness: 300,
    damping: 30,
    mass: 0.1,
  });

  const cy = useSpring(useTransform(mouseY, [0, 1], [0, 507]), {
    stiffness: 300,
    damping: 30,
    mass: 0.1,
  });

  useEffect(() => {
    if (shouldReduceMotion || !isInView) {
      return;
    }

    if (window.matchMedia("(hover: none)").matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;

      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [shouldReduceMotion, isInView, mouseX, mouseY]);

  return (
    <motion.svg
      ref={ref}
      className="h-auto w-full touch-manipulation [--pattern:color-mix(in_oklab,var(--foreground)_12%,var(--background))] [--stroke:color-mix(in_oklab,var(--foreground)_16%,var(--background))]"
      viewBox="0 0 930 507"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      initial="normal"
      whileTap="pressed"
      onTap={() => play()}
    >
      <defs>
        <pattern
          id={ids.facePattern}
          x="0"
          y="0"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M-1 1l2 -2M0 10l10 -10M9 11l2 -2"
            stroke="var(--pattern)"
            strokeWidth="1"
          />
        </pattern>

        <motion.g
          id={ids.faceFill}
          variants={{
            normal: {
              transform: "translate(0px, 0px)",
            },
            pressed: {
              transform: "translate(0px, 16px)",
            },
          }}
          transition={transition}
        >
          <path d="M0.5 301.58L194.49 189.58L263.77 229.58L139.06 301.58L173.7 321.58L298.41 249.58L471.61 349.58L277.63 461.58L208.34 421.58L333.05 349.58L298.41 329.58L173.7 401.58Z" />
          <path d="M263.77 149.58L333.05 109.58L430.04 165.58L464.68 145.58L416.19 117.58L464.68 89.58L416.19 61.58L499.33 13.58L582.46 61.58L533.97 89.58L582.46 117.58L533.97 145.58L547.82 153.58L596.32 125.58L644.82 153.58L693.31 125.58L776.45 173.58L693.31 221.58L644.82 193.58L596.32 221.58L547.82 193.58L513.18 213.58L610.17 269.58L540.89 309.58Z" />
        </motion.g>

        <motion.path
          id={ids.strokeBelow}
          variants={{
            normal: {
              d: "M263.77 261.58L139.06 333.58M263.77 229.58L263.77 261.58M139.06 301.58L139.06 333.58M471.61 381.58L277.63 493.58L208.34 453.58M471.61 349.58L471.61 381.58M277.63 461.58L277.63 493.58M208.34 421.58L208.34 453.58M333.05 381.58L298.41 361.58L173.7 433.58L0.5 333.58M333.05 349.58L333.05 381.58M298.41 329.58L298.41 361.58M173.7 401.58L173.7 433.58M0.5 301.58L0.5 333.58M464.68 177.58L416.19 149.58M464.68 145.58L464.68 177.58M416.19 117.58L416.19 149.58M464.68 121.58L416.19 93.58M464.68 89.58L464.68 121.58M416.19 61.58L416.19 93.58M582.46 93.58L533.97 121.58M582.46 61.58L582.46 93.58M533.97 89.58L533.97 121.58M582.46 149.58L533.97 177.58M582.46 117.58L582.46 149.58M533.97 145.58L533.97 177.58M776.45 205.58L693.31 253.58L644.82 225.58L596.32 253.58L547.82 225.58L513.18 245.58M776.45 173.58L776.45 205.58M693.31 221.58L693.31 253.58M644.82 193.58L644.82 225.58M596.32 221.58L596.32 253.58M547.82 193.58L547.82 225.58M513.18 213.58L513.18 245.58M610.17 301.58L540.89 341.58L263.77 181.58M610.17 269.58L610.17 301.58M540.89 309.58L540.89 341.58M263.77 149.58L263.77 181.58",
            },
            pressed: {
              d: "M263.77 261.58L139.06 333.58M263.77 245.58L263.77 261.58M139.06 317.58L139.06 333.58M471.61 381.58L277.63 493.58L208.34 453.58M471.61 365.58L471.61 381.58M277.63 477.58L277.63 493.58M208.34 437.58L208.34 453.58M333.05 381.58L298.41 361.58L173.7 433.58L0.5 333.58M333.05 365.58L333.05 381.58M298.41 345.58L298.41 361.58M173.7 417.58L173.7 433.58M0.5 317.58L0.5 333.58M464.68 177.58L416.19 149.58M464.68 161.58L464.68 177.58M416.19 133.58L416.19 149.58M464.68 121.58L416.19 93.58M464.68 105.58L464.68 121.58M416.19 77.58L416.19 93.58M582.46 93.58L533.97 121.58M582.46 77.58L582.46 93.58M533.97 105.58L533.97 121.58M582.46 149.58L533.97 177.58M582.46 133.58L582.46 149.58M533.97 161.58L533.97 177.58M776.45 205.58L693.31 253.58L644.82 225.58L596.32 253.58L547.82 225.58L513.18 245.58M776.45 189.58L776.45 205.58M693.31 237.58L693.31 253.58M644.82 209.58L644.82 225.58M596.32 237.58L596.32 253.58M547.82 209.58L547.82 225.58M513.18 229.58L513.18 245.58M610.17 301.58L540.89 341.58L263.77 181.58M610.17 285.58L610.17 301.58M540.89 325.58L540.89 341.58M263.77 165.58L263.77 181.58",
            },
          }}
          transition={transition}
        />

        <motion.path
          id={ids.strokeAbove}
          variants={{
            normal: {
              d: "M0.5 301.58L194.49 189.58L263.77 229.58L139.06 301.58L173.7 321.58L298.41 249.58L471.61 349.58L277.63 461.58L208.34 421.58L333.05 349.58L298.41 329.58L173.7 401.58ZM263.77 149.58L333.05 109.58L430.04 165.58L464.68 145.58L416.19 117.58L464.68 89.58L416.19 61.58L499.33 13.58L582.46 61.58L533.97 89.58L582.46 117.58L533.97 145.58L547.82 153.58L596.32 125.58L644.82 153.58L693.31 125.58L776.45 173.58L693.31 221.58L644.82 193.58L596.32 221.58L547.82 193.58L513.18 213.58L610.17 269.58L540.89 309.58ZM818.02 85.58L873.44 53.58L928.87 85.58L873.44 117.58ZM928.87 117.58L873.44 149.58L818.02 117.58M928.87 85.58L928.87 117.58M873.44 117.58L873.44 149.58M818.02 85.58L818.02 117.58",
            },
            pressed: {
              d: "M0.5 317.58L194.49 205.58L263.77 245.58L139.06 317.58L173.7 337.58L298.41 265.58L471.61 365.58L277.63 477.58L208.34 437.58L333.05 365.58L298.41 345.58L173.7 417.58ZM263.77 165.58L333.05 125.58L430.04 181.58L464.68 161.58L416.19 133.58L464.68 105.58L416.19 77.58L499.33 29.58L582.46 77.58L533.97 105.58L582.46 133.58L533.97 161.58L547.82 169.58L596.32 141.58L644.82 169.58L693.31 141.58L776.45 189.58L693.31 237.58L644.82 209.58L596.32 237.58L547.82 209.58L513.18 229.58L610.17 285.58L540.89 325.58ZM818.02 101.58L873.44 69.58L928.87 101.58L873.44 133.58ZM928.87 117.58L873.44 149.58L818.02 117.58M928.87 101.58L928.87 117.58M873.44 133.58L873.44 149.58M818.02 101.58L818.02 117.58",
            },
          }}
          transition={transition}
        />

        <motion.radialGradient
          id={ids.radialGradient}
          cx={cx}
          cy={cy}
          r="335"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            className="dark:[stop-color:#fff]"
            stopColor="var(--foreground)"
          />
          <stop offset="1" stopColor="var(--foreground)" stopOpacity="0" />
        </motion.radialGradient>
      </defs>

      <g className="fill-background" fillRule="evenodd" clipRule="evenodd">
        <motion.path
          variants={{
            normal: {
              d: "M263.77 229.58L139.06 301.58L139.06 333.58L263.77 261.58Z",
            },
            pressed: {
              d: "M263.77 245.58L139.06 317.58L139.06 333.58L263.77 261.58Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M471.61 349.58L277.63 461.58L208.34 421.58L208.34 453.58L277.63 493.58L471.61 381.58Z",
            },
            pressed: {
              d: "M471.61 365.58L277.63 477.58L208.34 437.58L208.34 453.58L277.63 493.58L471.61 381.58Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M333.05 349.58L298.41 329.58L173.7 401.58L0.5 301.58L0.5 333.58L173.7 433.58L298.41 361.58L333.05 381.58Z",
            },
            pressed: {
              d: "M333.05 365.58L298.41 345.58L173.7 417.58L0.5 317.58L0.5 333.58L173.7 433.58L298.41 361.58L333.05 381.58Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M464.68 145.58L416.19 117.58L416.19 149.58L464.68 177.58Z",
            },
            pressed: {
              d: "M464.68 161.58L416.19 133.58L416.19 149.58L464.68 177.58Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M464.68 89.58L416.19 61.58L416.19 93.58L464.68 121.58Z",
            },
            pressed: {
              d: "M464.68 105.58L416.19 77.58L416.19 93.58L464.68 121.58Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M582.46 61.58L533.97 89.58L533.97 121.58L582.46 93.58Z",
            },
            pressed: {
              d: "M582.46 77.58L533.97 105.58L533.97 121.58L582.46 93.58Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M582.46 117.58L533.97 145.58L533.97 177.58L582.46 149.58Z",
            },
            pressed: {
              d: "M582.46 133.58L533.97 161.58L533.97 177.58L582.46 149.58Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M776.45 173.58L693.31 221.58L644.82 193.58L596.32 221.58L547.82 193.58L513.18 213.58L513.18 245.58L547.82 225.58L596.32 253.58L644.82 225.58L693.31 253.58L776.45 205.58Z",
            },
            pressed: {
              d: "M776.45 189.58L693.31 237.58L644.82 209.58L596.32 237.58L547.82 209.58L513.18 229.58L513.18 245.58L547.82 225.58L596.32 253.58L644.82 225.58L693.31 253.58L776.45 205.58Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M610.17 269.58L540.89 309.58L263.77 149.58L263.77 181.58L540.89 341.58L610.17 301.58Z",
            },
            pressed: {
              d: "M610.17 285.58L540.89 325.58L263.77 165.58L263.77 181.58L540.89 341.58L610.17 301.58Z",
            },
          }}
          transition={transition}
        />
      </g>

      <use href={`#${ids.strokeBelow}`} stroke="var(--stroke)" />
      <use
        href={`#${ids.strokeBelow}`}
        stroke={`url(#${ids.radialGradient})`}
      />

      <use href={`#${ids.faceFill}`} className="fill-background" />
      <use href={`#${ids.faceFill}`} fill={`url(#${ids.facePattern})`} />

      <motion.path
        className="fill-neutral-600 dark:fill-neutral-500"
        variants={{
          normal: {
            d: "M873.44 117.58L928.87 85.58L928.87 117.58L873.44 149.58Z",
          },
          pressed: {
            d: "M873.44 133.58L928.87 101.58L928.87 117.58L873.44 149.58Z",
          },
        }}
        transition={transition}
      />
      <motion.path
        className="fill-neutral-700 dark:fill-neutral-600"
        variants={{
          normal: {
            d: "M818.02 85.58L873.44 117.58L873.44 149.58L818.02 117.58Z",
          },
          pressed: {
            d: "M818.02 101.58L873.44 133.58L873.44 149.58L818.02 117.58Z",
          },
        }}
        transition={transition}
      />

      <motion.g
        className="fill-neutral-500 dark:fill-neutral-400"
        variants={{
          normal: {
            transform: "translate(0px, 0px)",
          },
          pressed: {
            transform: "translate(0px, 16px)",
          },
        }}
        transition={transition}
      >
        <path d="M818.02 85.58L873.44 53.58L928.87 85.58L873.44 117.58Z" />
      </motion.g>

      <use href={`#${ids.strokeAbove}`} stroke="var(--stroke)" />
      <use
        href={`#${ids.strokeAbove}`}
        stroke={`url(#${ids.radialGradient})`}
      />
    </motion.svg>
  );
}
