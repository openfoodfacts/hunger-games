const reportWebVitals = async (
  onPerfEntry: undefined | ((value: any) => void) = undefined,
) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    const { onCLS, onFID, onFCP, onLCP, onTTFB } = await import("web-vitals");

    onCLS(onPerfEntry);
    onFID(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
