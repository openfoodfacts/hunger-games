import * as React from "react";
import { runForceGraph } from "./forceGraphGenerator";

export default function ForceGraph({ linksData, nodesData }) {
  const containerRef = React.useRef(null);
  const graphRef = React.useRef(null);

  React.useEffect(() => {
    if (containerRef.current) {
      try {
        graphRef.current = runForceGraph(
          containerRef.current,
          linksData,
          nodesData,
        );
      } catch (e) {
        console.error(e);
      }
    }

    return () => {
      graphRef.current?.destroy?.();
    };
  }, [linksData, nodesData]);

  return <canvas ref={containerRef} style={{ width: 500, height: 500 }} />;
}
