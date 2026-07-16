"use client";

import { motion, useSpring } from "motion/react";
import { useLayoutEffect } from "react";
import { type SpringConfig, useChartConfig } from "../chart-config-context";
import { chartCssVars } from "../chart-context";

export interface TooltipDotProps {
  x: number;
  y: number;
  visible: boolean;
  color: string;
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
  /** Per-chart override; falls back to the chart config's `tooltipSpring`. */
  springConfig?: SpringConfig;
}

export function TooltipDot({
  x,
  y,
  visible,
  color,
  size = 5,
  strokeColor = chartCssVars.background,
  strokeWidth = 2,
  springConfig,
}: TooltipDotProps) {
  const { tooltipSpring } = useChartConfig();
  const effectiveSpring = springConfig ?? tooltipSpring;
  // `useSpring` initializes at the first (x, y); the layout effect springs it
  // toward subsequent positions.
  const animatedX = useSpring(x, effectiveSpring);
  const animatedY = useSpring(y, effectiveSpring);

  useLayoutEffect(() => {
    animatedX.set(x);
    animatedY.set(y);
  }, [animatedX, animatedY, x, y]);

  if (!visible) {
    return null;
  }

  return (
    <motion.circle
      cx={animatedX}
      cy={animatedY}
      fill={color}
      r={size}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
  );
}

TooltipDot.displayName = "TooltipDot";

export default TooltipDot;
