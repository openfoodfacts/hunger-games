declare module "react-map-interaction" {
  import type { ReactNode } from "react";

  export const MapInteractionCSS: (props: {
    children?: ReactNode;
    showControls?: boolean;
    minScale?: number;
    translationBounds?: { xMax?: number; yMax?: number };
  }) => ReactNode;
}
