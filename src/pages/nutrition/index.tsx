import * as React from "react";
import { useRobotoffPredicitions } from "./useRobotoffPredicitions";
import { OFF_IMAGE_URL } from "../../const";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";
import { Box, Button } from "@mui/material";
import Stack from "@mui/material/Stack";
import {
  deleteRobotoff,
  NUTRIMENTS,
  postRobotoff,
  skipRobotoff,
  structurePredictions,
} from "./utils";
import { NutrimentPrediction } from "./insight.types";
import { ErrorBoundary } from "../taxonomyWalk/Error";
import LinksToProduct from "./LinksToProduct";
import { NutrimentCell } from "./NutrimentCell";

export default function Nutrition() {
  const { isLoading, insight, nextItem, count } = useRobotoffPredicitions();

  const [values, setValues] = React.useState<
    Record<string, Pick<NutrimentPrediction, "value" | "unit">>
  >({});
  const apiRef = React.useRef<ReactZoomPanPinchRef>();

  React.useEffect(() => {
    if (!insight || typeof insight === "string") {
      setValues({});
      return;
    }

    setValues(() => ({
      ...insight.data.nutrients,
      "energy-kcal_100g": {
        value: null,
        ...insight.data.nutrients["energy-kcal_100g"],
        unit: "kcal",
      },
      "energy-kcal_serving": {
        value: null,
        ...insight.data.nutrients["energy-kcal_100g"],
        unit: "kcal",
      },
      "energy-kj_100g": {
        value: null,
        ...insight.data.nutrients["energy-kj_100g"],
        unit: "kj",
      },
      "energy-kj_serving": {
        value: null,
        ...insight.data.nutrients["energy-kj_100g"],
        unit: "kj",
      },
    }));
  }, [insight]);

  if (isLoading) {
    return <p>Loading ....</p>;
  }
  if (!insight) {
    return <p>No predicition found</p>;
  }

  const nutrimentsDetected = structurePredictions(values);
  return (
    <React.Suspense>
      <ErrorBoundary>
        <Stack direction="row">
          <Box sx={{ width: "50%" }}>
            <TransformWrapper limitToBounds={false} ref={apiRef}>
              <TransformComponent>
                <img
                  key={insight.source_image}
                  src={`${OFF_IMAGE_URL}${insight.source_image}`}
                  alt=""
                  style={{
                    width: "100%",
                    maxHeight: "200vh",
                  }}
                />
              </TransformComponent>
            </TransformWrapper>
          </Box>
          <Stack direction="column" sx={{ width: "50%", p: 2 }}>
            <LinksToProduct
              barcode={insight.barcode}
              count={count}
              sx={{ mb: 2 }}
            />

            <Box
              sx={(theme) => ({
                width: "fit-content",
                "& .focused": {
                  backgroundColor: theme.palette.divider,
                },
              })}
            >
              <table>
                <tr>
                  <td>Nutriments</td>
                  <td>100g</td>
                  <td>
                    serving{" "}
                    <input
                      tabIndex={2}
                      value={insight.data.nutrients?.serving_size?.value ?? ""}
                      style={{ maxWidth: 100 }}
                    />
                  </td>
                </tr>
                {nutrimentsDetected.map((nutrimentId) => {
                  const key100g = `${nutrimentId}_100g`;
                  const { value: value100g, unit: unit100g } =
                    values[key100g] ?? {};

                  const keyServing = `${nutrimentId}_serving`;
                  const { value: valueServing, unit: unitServing } =
                    values[keyServing] ?? {};

                  return (
                    <tr
                      key={nutrimentId}
                      // Attributes used to highlight when focusing
                      data-label-id={nutrimentId}
                    >
                      <td style={{ paddingLeft: 10, paddingRight: 4 }}>
                        {NUTRIMENTS[nutrimentId] ?? nutrimentId}
                      </td>
                      <NutrimentCell
                        tabIndex={1}
                        nutrimentId={nutrimentId}
                        nutrimentKey={key100g}
                        value={value100g}
                        unit={unit100g}
                        setValues={setValues}
                      />
                      <NutrimentCell
                        tabIndex={2}
                        nutrimentId={nutrimentId}
                        nutrimentKey={keyServing}
                        value={valueServing}
                        unit={unitServing}
                        setValues={setValues}
                      />
                    </tr>
                  );
                })}

                <tr>
                  <td></td>
                  <td>
                    <Button
                      tabIndex={1}
                      variant="contained"
                      color="success"
                      sx={{
                        ml: 1,
                        mt: 2,
                      }}
                      onClick={() => {
                        postRobotoff({
                          insightId: insight.id,
                          data: values,
                          type: "100g",
                        });
                        nextItem();
                        apiRef.current.resetTransform();
                      }}
                    >
                      Valider (100g)
                    </Button>
                  </td>
                  <td>
                    <Button
                      tabIndex={2}
                      variant="contained"
                      color="success"
                      sx={{ ml: 1, mt: 2 }}
                      onClick={() => {
                        postRobotoff({
                          insightId: insight.id,
                          data: values,
                          type: "serving",
                        });
                        nextItem();
                        apiRef.current.resetTransform();
                      }}
                    >
                      Valider (serving)
                    </Button>
                  </td>
                </tr>
              </table>
            </Box>

            <Stack direction="row" justifyContent="center" sx={{ mt: 5 }}>
              <Button
                tabIndex={3}
                variant="contained"
                fullWidth
                onClick={() => {
                  skipRobotoff({ insightId: insight.id });
                  nextItem();
                  apiRef.current.resetTransform();
                }}
              >
                Skip
              </Button>
              <Button
                tabIndex={3}
                variant="contained"
                color="error"
                fullWidth
                onClick={() => {
                  deleteRobotoff({ insightId: insight.id });
                  nextItem();
                  apiRef.current.resetTransform();
                }}
              >
                Invalid Image
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </ErrorBoundary>
    </React.Suspense>
  );
}
