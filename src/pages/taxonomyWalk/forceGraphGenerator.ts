import * as d3 from "d3";
// import "@fortawesome/fontawesome-free/css/all.min.css";

export function runForceGraph(
  container,
  linksData,
  nodesData,
  //   nodeHoverTooltip,
) {
  // Specify the dimensions of the chart.
  const width = 500;
  const height = 500;

  // Specify the color scale.
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // The force simulation mutates links and nodes, so create a copy
  // so that re-evaluating this cell produces the same result.
  const links = linksData.map((d) => ({ ...d }));
  const nodes = nodesData.map((d) => ({ ...d, fy: 250 + 50 * d.depth }));

  // Create a simulation with several forces.
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.id),
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", draw);

  // Create the canvas.
  const dpi = devicePixelRatio; // _e.g._, 2 for retina screens
  const canvas = d3
    .select(container)
    .attr("width", dpi * width)
    .attr("height", dpi * height)
    .attr("style", `width: ${width}px; max-width: 100%; height: auto;`)
    .node();

  const context = canvas.getContext("2d");
  context.scale(dpi, dpi);

  function draw() {
    context.clearRect(0, 0, width, height);

    context.save();
    context.globalAlpha = 0.6;
    context.strokeStyle = "#999";
    context.beginPath();
    links.forEach(drawLink);
    context.stroke();
    context.restore();

    context.save();
    context.strokeStyle = "#fff";
    context.globalAlpha = 1;
    nodes.forEach((node) => {
      context.beginPath();
      drawNode(node);
      context.fillStyle = color(node.depth % 10);
      context.strokeStyle = "#fff";
      context.fill();
      context.stroke();
    });
    context.restore();
  }

  function drawLink(d) {
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);
  }

  function drawNode(d) {
    context.moveTo(d.x + 5, d.y);
    context.arc(d.x, d.y, 5, 0, 2 * Math.PI);
  }

  // Add a drag behavior. The _subject_ identifies the closest node to the pointer,
  // conditional on the distance being less than 20 pixels.
  d3.select(canvas).call(
    d3
      .drag()
      .subject((event) => {
        const [px, py] = d3.pointer(event, canvas);
        return d3.least(nodes, ({ x, y }) => {
          const dist2 = (x - px) ** 2 + (y - py) ** 2;
          if (dist2 < 400) return dist2;
        });
      })
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended),
  );

  // Reheat the simulation when drag starts, and fix the subject position.
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    // event.subject.fy = event.subject.y;
  }

  // Update the subject (dragged node) position during drag.
  function dragged(event) {
    event.subject.fx = event.x;
    // event.subject.fy = event.y;
  }

  // Restore the target alpha so the simulation cools after dragging ends.
  // Unfix the subject position now that it’s no longer being dragged.
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    // event.subject.fy = null;
  }

  // When this cell is re-run, stop the previous simulation. (This doesn’t
  // really matter since the target alpha is zero and the simulation will
  // stop naturally, but it’s a good practice.)
  //   invalidation.then(() => simulation.stop());

  return {
    destroy: () => {
      simulation.stop();
    },
  };
}
