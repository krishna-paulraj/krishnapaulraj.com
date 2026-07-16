"use client";

import { createContext, useContext } from "react";

/** True disables the cartesian reveal clip-path (static docs previews). */
const StaticChartPreviewContext = createContext(false);

export function useStaticChartPreview() {
  return useContext(StaticChartPreviewContext);
}
