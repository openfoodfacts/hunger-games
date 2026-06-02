const reportWebVitals = async (
  onPerfEntry: undefined | ((value: unknown) => void) = undefined,
) => {
  if (!onPerfEntry || typeof onPerfEntry !== "function") {
    return;
  }

  const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import("web-vitals");

  (onCLS as (cb: (metric: unknown) => void) => void)(onPerfEntry);
  (onFCP as (cb: (metric: unknown) => void) => void)(onPerfEntry);
  (onINP as (cb: (metric: unknown) => void) => void)(onPerfEntry);
  (onLCP as (cb: (metric: unknown) => void) => void)(onPerfEntry);
  (onTTFB as (cb: (metric: unknown) => void) => void)(onPerfEntry);
};

export default reportWebVitals;
