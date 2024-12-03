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
  isValidUnit,
  NUTRIMENTS,
  postRobotoff,
  skipRobotoff,
  structurePredictions,
} from "./utils";
import { NutrimentPrediction } from "./insight.types";
import { ErrorBoundary } from "../taxonomyWalk/Error";
import { UNITS } from "./config";

export default function Nutrition() {
  const { isLoading, insight, nextItem } = useRobotoffPredicitions();
  // const [showRaw, setShowRaw] = React.useState(false);
  const [values, setValues] = React.useState<
    Record<string, Pick<NutrimentPrediction, "value" | "unit">>
  >({});
  const apiRef = React.useRef<ReactZoomPanPinchRef>();

  React.useEffect(() => {
    if (!insight || typeof insight === "string") {
      setValues({});
      return;
    }

    setValues(() => insight.data.nutrients);
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
          <Stack direction="column" sx={{ width: "50%", pt: 3 }}>
            <Stack direction="row">
              <Stack direction="column">
                <div>Nutri</div>
                {nutrimentsDetected.map((nutrimentId) => {
                  return (
                    <div key={nutrimentId}>
                      {NUTRIMENTS[nutrimentId] ?? nutrimentId}
                    </div>
                  );
                })}
              </Stack>
              <Stack direction="column" sx={{ mr: 4, ml: 2 }}>
                <div>100g</div>
                {nutrimentsDetected.map((nutrimentId) => {
                  const key = `${nutrimentId}_100g`;
                  const item = values[key];

                  return (
                    <div key={nutrimentId}>
                      <input
                        style={{ marginRight: 4 }}
                        value={item?.value ?? ""}
                        onChange={(event) =>
                          setValues((p) => ({
                            ...p,
                            [key]: {
                              ...p[key],
                              value: event.target.value,
                            },
                          }))
                        }
                      />

                      {isValidUnit(item?.unit) ? (
                        <select
                          style={{ width: 55 }}
                          value={item?.unit}
                          onChange={(event) => {
                            setValues((p) => ({
                              ...p,
                              [key]: {
                                ...p[key],
                                unit: event.target.value,
                              },
                            }));
                          }}
                        >
                          {UNITS.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ display: "inline-block", width: 55 }}>
                          {item?.unit}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setValues((p) => ({
                            ...p,
                            [key]: {
                              ...p[key],
                              unit: null,
                              value: null,
                            },
                          }));
                        }}
                      >
                        X
                      </button>
                    </div>
                  );
                })}
                <Button
                  variant="contained"
                  color="success"
                  sx={{ ml: 1, mt: 2 }}
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
              </Stack>
              <Stack direction="column">
                <div>
                  serving{" "}
                  <input
                    value={insight.data.nutrients?.serving_size?.value ?? ""}
                  />
                </div>
                {nutrimentsDetected.map((nutrimentId) => {
                  const key = `${nutrimentId}_serving`;
                  const item = values[key];

                  return (
                    <div key={nutrimentId}>
                      <input
                        style={{ marginRight: 4 }}
                        value={item?.value ?? ""}
                        onChange={(event) =>
                          setValues((p) => ({
                            ...p,
                            [key]: {
                              ...p[key],
                              value: event.target.value,
                            },
                          }))
                        }
                      />

                      {isValidUnit(item?.unit) ? (
                        <select
                          style={{ width: 55 }}
                          value={item?.unit}
                          onChange={(event) => {
                            setValues((p) => ({
                              ...p,
                              [key]: {
                                ...p[key],
                                unit: event.target.value,
                              },
                            }));
                          }}
                        >
                          {UNITS.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ display: "inline-block", width: 55 }}>
                          {item?.unit}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setValues((p) => ({
                            ...p,
                            [key]: {
                              ...p[key],
                              unit: null,
                              value: null,
                            },
                          }));
                        }}
                      >
                        X
                      </button>
                    </div>
                  );
                })}
                <Button
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
              </Stack>
            </Stack>

            <Stack direction="row" justifyContent="center" sx={{ mt: 5 }}>
              <Button
                variant="contained"
                color="secondary"
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

// nutrient: {
// }
// nutrition_data_per = "100g" | "serving";
