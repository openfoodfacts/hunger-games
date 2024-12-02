import * as React from "react";
import { useRobotoffPredicitions } from "./useRobotoffPredicitions";
import { OFF_IMAGE_URL } from "../../const";
import ZoomableImage from "../../components/ZoomableImage";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";
import { Box, Button, List, ListItem } from "@mui/material";
import Stack from "@mui/material/Stack";

const NUTRIMENTS = {
  "energy-kj_100g": "energy (kj)",
  "energy-kcal_100g": "energy (kcal)",
  fat_100g: "fat",
  "saturated-fat_100g": "saturated fat",
  carbohydrates_100g: "carbohydrates",
  sugars_100g: "sugars",
  fiber_100g: "fiber",
  proteins_100g: "proteins",
  salt_100g: "salt",
};
export default function Nutrition() {
  const { isLoading, insight, nextItem } = useRobotoffPredicitions();
  const [showRaw, setShowRaw] = React.useState(false);
  const apiRef = React.useRef<ReactZoomPanPinchRef>();

  if (isLoading) {
    return <p>Loading ....</p>;
  }
  if (!insight) {
    return <p>No predicition found</p>;
  }
  console.log(insight);
  return (
    <React.Suspense>
      <Stack direction="row">
        <Box sx={{ width: "50%" }}>
          <TransformWrapper limitToBounds={false} ref={apiRef}>
            <TransformComponent>
              <img
                key={insight.source_image}
                src={`${OFF_IMAGE_URL}${insight.source_image}`}
                alt=""
                style={{ width: "100%" }}
              />
            </TransformComponent>
          </TransformWrapper>
        </Box>
        <Stack direction="column" sx={{ width: "50%" }}>
          <List>
            {Object.keys(NUTRIMENTS).map((nutryId) => {
              const item = insight.data.nutrients[nutryId];
              return (
                <ListItem key={nutryId}>
                  {NUTRIMENTS[nutryId]}: {item?.value ?? "XXX"} {item?.unit}
                </ListItem>
              );
            })}
          </List>
          {showRaw && (
            <pre style={{ maxHeight: 450, overflow: "auto" }}>
              {JSON.stringify(insight, null, 2)}
            </pre>
          )}
          <button onClick={() => setShowRaw((p) => !p)}>
            {showRaw ? "hide raw data" : "show raw data"}
          </button>
          <Button
            variant="outlined"
            sx={{ m: 1 }}
            onClick={() => {
              nextItem();
              apiRef.current.resetTransform();
            }}
          >
            Next
          </Button>
        </Stack>
      </Stack>
    </React.Suspense>
  );
}
