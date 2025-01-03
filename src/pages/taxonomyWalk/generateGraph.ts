import { CategoryType } from "./ItemCard";

type NodeType = {
  id: string;
  /**
   * length of the shortest path with the item. Can be negative
   */
  depth: number;
};

type LinkType = {
  child: string;
  parent: string;
};

function itemOrUndefined(
  item: "loading" | "failed" | CategoryType,
): CategoryType | undefined {
  if (typeof item === "string") {
    return undefined;
  }
  return item;
}

export function generateGraph(
  rootId: string,
  taxoLookup: Record<string, "loading" | "failed" | CategoryType>,
) {
  const nodeDepth: Record<string, number> = { [rootId]: 0 };
  const links: LinkType[] = [];
  const seen = new Set<string>();

  const parentsLinksFIFO =
    itemOrUndefined(taxoLookup[rootId])?.parents?.map((parent) => ({
      child: rootId,
      parent,
    })) ?? [];
  const childLinksFIFO =
    itemOrUndefined(taxoLookup[rootId])?.children?.map((child) => ({
      child,
      parent: rootId,
    })) ?? [];

  while (parentsLinksFIFO.length > 0) {
    const link = parentsLinksFIFO.shift();
    const node = link.parent;
    if (!seen.has(node)) {
      seen.add(node);
      links.push(link);
      nodeDepth[node] = nodeDepth[link.child] - 1;

      itemOrUndefined(taxoLookup[node])
        ?.parents?.map((parent) => ({ child: node, parent }))
        ?.forEach((link) => parentsLinksFIFO.push(link));
    }
  }

  while (childLinksFIFO.length > 0) {
    const link = childLinksFIFO.shift();
    const node = link.child;
    if (!seen.has(node)) {
      seen.add(node);
      links.push(link);
      nodeDepth[node] = nodeDepth[link.parent] + 1;

      itemOrUndefined(taxoLookup[node])
        ?.children?.map((child) => ({ child, parent: node }))
        ?.forEach((link) => childLinksFIFO.push(link));
    }
  }

  const nodes: NodeType[] = Object.entries(nodeDepth).map(([id, depth]) => ({
    id,
    depth,
  }));

  return {
    nodes,
    links: links?.map(({ child, parent }) => ({
      source: child,
      target: parent,
    })),
  };
}
