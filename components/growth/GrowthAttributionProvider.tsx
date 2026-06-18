"use client";

import { Suspense } from "react";
import { GrowthAttributionCapture } from "./GrowthAttributionCapture";

export function GrowthAttributionProvider() {
  return (
    <Suspense fallback={null}>
      <GrowthAttributionCapture />
    </Suspense>
  );
}
