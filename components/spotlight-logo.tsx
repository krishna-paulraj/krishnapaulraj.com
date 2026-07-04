"use client"

import { useEffect, useId, useRef } from "react"
import type { Transition } from "motion/react"
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"

import { metalClickSound } from "@/lib/metal-click"
import { useSound } from "@/hooks/soundcn/use-sound"

const transition: Transition = {
  type: "spring",
  mass: 0.5,
  damping: 18,
  stiffness: 200,
}

/**
 * An isometric "K." mark whose outline is traced by a gradient highlight that
 * follows the cursor, paired with a springy press effect and a tactile click
 * sound. Based on @ncdai/spotlight-logo; the artwork is generated — a blocky K
 * built from overlapping slabs plus a dot cube, extruded on a 2:1 isometric
 * grid (unit 55.425×32, depth 32). Pressing sinks the top plane 16px; the
 * paired normal/pressed `d` values keep an identical command structure so the
 * path morph interpolates cleanly.
 */
export function SpotlightLogo() {
  const id = useId()
  const ids = {
    facePattern: `spotlight-logo-face-pattern-${id}`,
    faceFill: `spotlight-logo-face-fill-${id}`,
    stroke: `spotlight-logo-stroke-${id}`,
    radialGradient: `spotlight-logo-radial-gradient-${id}`,
  }

  const ref = useRef<SVGSVGElement>(null)

  const [play] = useSound(metalClickSound)

  const shouldReduceMotion = useReducedMotion()
  const isInView = useInView(ref, { margin: "80px" })

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const cx = useSpring(useTransform(mouseX, [0, 1], [0, 667]), {
    stiffness: 300,
    damping: 30,
    mass: 0.1,
  })

  const cy = useSpring(useTransform(mouseY, [0, 1], [0, 354]), {
    stiffness: 300,
    damping: 30,
    mass: 0.1,
  })

  useEffect(() => {
    if (shouldReduceMotion || !isInView) {
      return
    }

    if (window.matchMedia("(hover: none)").matches) {
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect()
      if (!rect) return

      mouseX.set((e.clientX - rect.left) / rect.width)
      mouseY.set((e.clientY - rect.top) / rect.height)
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [shouldReduceMotion, isInView, mouseX, mouseY])

  return (
    <motion.svg
      ref={ref}
      className="h-auto w-full touch-manipulation [--pattern:color-mix(in_oklab,var(--foreground)_12%,var(--background))] [--stroke:color-mix(in_oklab,var(--foreground)_16%,var(--background))]"
      viewBox="0 0 667 354"
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
          <path d="M0.5 160.58L55.92 128.58L166.77 192.58L222.2 160.58L277.63 192.58L222.2 224.58L333.05 288.58L277.63 320.58Z" />
          <path d="M166.77 128.58L277.63 64.58L333.05 96.58L222.2 160.58Z" />
          <path d="M166.77 64.58L277.63 0.58L333.05 32.58L222.2 96.58Z" />
          <path d="M277.63 192.58L388.47 128.58L443.9 160.58L333.05 224.58Z" />
          <path d="M388.47 192.58L499.32 128.58L554.75 160.58L443.9 224.58Z" />
        </motion.g>

        <motion.path
          id={ids.stroke}
          variants={{
            normal: {
              d: "M0.5 160.58L55.92 128.58L166.77 192.58L222.2 160.58L277.63 192.58L222.2 224.58L333.05 288.58L277.63 320.58ZM166.77 128.58L277.63 64.58L333.05 96.58L222.2 160.58ZM166.77 64.58L277.63 0.58L333.05 32.58L222.2 96.58ZM277.63 192.58L388.47 128.58L443.9 160.58L333.05 224.58ZM388.47 192.58L499.32 128.58L554.75 160.58L443.9 224.58ZM554.75 96.58L610.17 64.58L665.6 96.58L610.17 128.58ZM0.5 192.58L277.63 352.58M277.63 352.58L333.05 320.58M249.91 240.58L277.63 224.58M166.77 160.58L194.49 176.58M249.91 176.58L333.05 128.58M166.77 96.58L194.49 112.58M305.34 80.58L333.05 64.58M277.63 224.58L333.05 256.58M333.05 256.58L416.19 208.58M388.47 224.58L443.9 256.58M443.9 256.58L554.75 192.58M554.75 128.58L610.17 160.58M610.17 160.58L665.6 128.58M0.5 160.58L0.5 192.58M277.63 320.58L277.63 352.58M333.05 288.58L333.05 320.58M277.63 192.58L277.63 224.58M166.77 128.58L166.77 160.58M333.05 96.58L333.05 128.58M166.77 64.58L166.77 96.58M333.05 32.58L333.05 64.58M333.05 224.58L333.05 256.58M388.47 192.58L388.47 224.58M443.9 224.58L443.9 256.58M554.75 160.58L554.75 192.58M554.75 96.58L554.75 128.58M610.17 128.58L610.17 160.58M665.6 96.58L665.6 128.58",
            },
            pressed: {
              d: "M0.5 176.58L55.92 144.58L166.77 208.58L222.2 176.58L277.63 208.58L222.2 240.58L333.05 304.58L277.63 336.58ZM166.77 144.58L277.63 80.58L333.05 112.58L222.2 176.58ZM166.77 80.58L277.63 16.58L333.05 48.58L222.2 112.58ZM277.63 208.58L388.47 144.58L443.9 176.58L333.05 240.58ZM388.47 208.58L499.32 144.58L554.75 176.58L443.9 240.58ZM554.75 112.58L610.17 80.58L665.6 112.58L610.17 144.58ZM0.5 192.58L277.63 352.58M277.63 352.58L333.05 320.58M236.06 248.58L277.63 224.58M166.77 160.58L208.34 184.58M236.06 184.58L333.05 128.58M166.77 96.58L208.34 120.58M291.48 88.58L333.05 64.58M277.63 224.58L333.05 256.58M333.05 256.58L402.33 216.58M388.47 224.58L443.9 256.58M443.9 256.58L554.75 192.58M554.75 128.58L610.17 160.58M610.17 160.58L665.6 128.58M0.5 176.58L0.5 192.58M277.63 336.58L277.63 352.58M333.05 304.58L333.05 320.58M277.63 208.58L277.63 224.58M166.77 144.58L166.77 160.58M333.05 112.58L333.05 128.58M166.77 80.58L166.77 96.58M333.05 48.58L333.05 64.58M333.05 240.58L333.05 256.58M388.47 208.58L388.47 224.58M443.9 240.58L443.9 256.58M554.75 176.58L554.75 192.58M554.75 112.58L554.75 128.58M610.17 144.58L610.17 160.58M665.6 112.58L665.6 128.58",
            },
          }}
          transition={transition}
        />

        <motion.radialGradient
          id={ids.radialGradient}
          cx={cx}
          cy={cy}
          r="240"
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
            normal: { d: "M0.5 160.58L277.63 320.58L333.05 288.58L333.05 320.58L277.63 352.58L0.5 192.58Z" },
            pressed: { d: "M0.5 176.58L277.63 336.58L333.05 304.58L333.05 320.58L277.63 352.58L0.5 192.58Z" },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: { d: "M222.2 224.58L277.63 192.58L277.63 224.58L222.2 256.58Z" },
            pressed: { d: "M222.2 240.58L277.63 208.58L277.63 224.58L222.2 256.58Z" },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: { d: "M166.77 128.58L222.2 160.58L333.05 96.58L333.05 128.58L222.2 192.58L166.77 160.58Z" },
            pressed: { d: "M166.77 144.58L222.2 176.58L333.05 112.58L333.05 128.58L222.2 192.58L166.77 160.58Z" },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: { d: "M166.77 64.58L222.2 96.58L333.05 32.58L333.05 64.58L222.2 128.58L166.77 96.58Z" },
            pressed: { d: "M166.77 80.58L222.2 112.58L333.05 48.58L333.05 64.58L222.2 128.58L166.77 96.58Z" },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: { d: "M277.63 192.58L333.05 224.58L443.9 160.58L443.9 192.58L333.05 256.58L277.63 224.58Z" },
            pressed: { d: "M277.63 208.58L333.05 240.58L443.9 176.58L443.9 192.58L333.05 256.58L277.63 224.58Z" },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: { d: "M388.47 192.58L443.9 224.58L554.75 160.58L554.75 192.58L443.9 256.58L388.47 224.58Z" },
            pressed: { d: "M388.47 208.58L443.9 240.58L554.75 176.58L554.75 192.58L443.9 256.58L388.47 224.58Z" },
          }}
          transition={transition}
        />
      </g>

      <motion.path
        className="fill-sky-600 dark:fill-sky-500"
        variants={{
          normal: { d: "M610.17 128.58L665.6 96.58L665.6 128.58L610.17 160.58Z" },
          pressed: { d: "M610.17 144.58L665.6 112.58L665.6 128.58L610.17 160.58Z" },
        }}
        transition={transition}
      />
      <motion.path
        className="fill-sky-700 dark:fill-sky-600"
        variants={{
          normal: { d: "M554.75 96.58L610.17 128.58L610.17 160.58L554.75 128.58Z" },
          pressed: { d: "M554.75 112.58L610.17 144.58L610.17 160.58L554.75 128.58Z" },
        }}
        transition={transition}
      />

      <use href={`#${ids.faceFill}`} className="fill-background" />
      <use href={`#${ids.faceFill}`} fill={`url(#${ids.facePattern})`} />

      <motion.g
        className="fill-sky-500 dark:fill-sky-400"
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
        <path d="M554.75 96.58L610.17 64.58L665.6 96.58L610.17 128.58Z" />
      </motion.g>

      <use href={`#${ids.stroke}`} stroke="var(--stroke)" />
      <use href={`#${ids.stroke}`} stroke={`url(#${ids.radialGradient})`} />
    </motion.svg>
  )
}
