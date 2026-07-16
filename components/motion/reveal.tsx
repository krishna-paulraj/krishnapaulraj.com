"use client";

import { motion, type Variants } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;
const Y = 8;
const DURATION = 0.5;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: Y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION, ease: EASE },
  },
};

export const fadeUpContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

type RevealTag = "div" | "section" | "article" | "header" | "footer" | "ul";

type DivProps = ComponentProps<typeof motion.div>;

type RevealProps = Omit<DivProps, "initial" | "animate" | "transition"> & {
  as?: RevealTag;
  delay?: number;
  duration?: number;
  children: ReactNode;
};

export function Reveal({
  as = "div",
  delay = 0,
  duration = DURATION,
  children,
  ...rest
}: RevealProps) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      // Server HTML carries the hidden initial styles; the layout's noscript
      // CSS uses this attribute to unhide content for no-JS visitors.
      data-reveal=""
      initial={{ opacity: 0, y: Y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

type GroupProps = Omit<DivProps, "initial" | "animate" | "variants"> & {
  as?: RevealTag;
  children: ReactNode;
};

export function RevealGroup({ as = "div", children, ...rest }: GroupProps) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp variants={fadeUpContainer} initial="hidden" animate="show" {...rest}>
      {children}
    </Comp>
  );
}

type ItemTag = "div" | "li" | "article";

type ItemProps = Omit<DivProps, "variants"> & {
  as?: ItemTag;
  children: ReactNode;
};

export function RevealItem({ as = "div", children, ...rest }: ItemProps) {
  const Comp = motion[as] as typeof motion.div;
  return (
    // data-reveal: items inherit the group's hidden initial state, so their
    // server HTML is invisible until the layout's noscript CSS unhides it.
    <Comp data-reveal="" variants={fadeUp} {...rest}>
      {children}
    </Comp>
  );
}
