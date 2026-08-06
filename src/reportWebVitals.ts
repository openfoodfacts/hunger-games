const reportWebVitals = async (
  onPerfEntry: undefined | ((value: unknown) => void) = undefined,
) => {
  if (!onPerfEntry || typeof onPerfEntry !== "function") {
    return;
  }

  const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import("web-vitals");

  onCLS(onPerfEntry);
  onINP(onPerfEntry);
  onFCP(onPerfEntry);
  onLCP(onPerfEntry);
  onTTFB(onPerfEntry);
};

export default reportWebVitals;
