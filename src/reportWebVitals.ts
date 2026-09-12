import type { ReportCallback } from "web-vitals";

const reportWebVitals = async (onPerfEntry?: ReportCallback) => {
  if (!onPerfEntry || typeof onPerfEntry !== "function") {
    return;
  }

  const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import("web-vitals");

  onCLS(onPerfEntry);
  onFCP(onPerfEntry);
  onINP(onPerfEntry);
  onLCP(onPerfEntry);
  onTTFB(onPerfEntry);
};

export default reportWebVitals;
