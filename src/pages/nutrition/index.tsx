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
  isValidUnit,
  NUTRIMENTS,
  postRobotoff,
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
                  style={{ width: "100%", maxHeight: "90vh" }}
                />
              </TransformComponent>
            </TransformWrapper>
          </Box>
          <Stack direction="column" sx={{ width: "50%", pt: 3 }}>
            <table>
              <thead>
                <tr>
                  <td>Nutri</td>
                  <td>100g</td>
                  <td>
                    serving{" "}
                    <input
                      value={insight.data.nutrients?.serving_size?.value ?? ""}
                    />
                  </td>
                </tr>
              </thead>
              <tbody>
                {nutrimentsDetected.map((nutrimentId) => {
                  return (
                    <tr key={nutrimentId}>
                      <td>{NUTRIMENTS[nutrimentId] ?? nutrimentId}</td>
                      <td>
                        <input
                          style={{ marginRight: 4 }}
                          value={values[`${nutrimentId}_100g`]?.value ?? ""}
                          onChange={(event) =>
                            setValues((p) => ({
                              ...p,
                              [`${nutrimentId}_100g`]: {
                                ...p[`${nutrimentId}_100g`],
                                value: event.target.value,
                              },
                            }))
                          }
                        />

                        {isValidUnit(values[`${nutrimentId}_100g`]?.unit) ? (
                          <select
                            style={{ width: 55 }}
                            value={values[`${nutrimentId}_100g`]?.unit}
                            onChange={(event) => {
                              setValues((p) => ({
                                ...p,
                                [`${nutrimentId}_100g`]: {
                                  ...p[`${nutrimentId}_100g`],
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
                            {values[`${nutrimentId}_100g`]?.unit}
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setValues((p) => ({
                              ...p,
                              [`${nutrimentId}_100g`]: {
                                ...p[`${nutrimentId}_100g`],
                                unit: null,
                                value: null,
                              },
                            }));
                          }}
                        >
                          X
                        </button>
                      </td>
                      <td>
                        <input
                          style={{ marginRight: 4 }}
                          value={values[`${nutrimentId}_serving`]?.value ?? ""}
                          onChange={(event) =>
                            setValues((p) => ({
                              ...p,
                              [`${nutrimentId}_serving`]: {
                                ...p[`${nutrimentId}_serving`],
                                value: event.target.value,
                              },
                            }))
                          }
                        />

                        {isValidUnit(values[`${nutrimentId}_serving`]?.unit) ? (
                          <select
                            style={{ width: 55 }}
                            value={values[`${nutrimentId}_serving`]?.unit}
                            onChange={(event) => {
                              setValues((p) => ({
                                ...p,
                                [`${nutrimentId}_serving`]: {
                                  ...p[`${nutrimentId}_serving`],
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
                            {values[`${nutrimentId}_serving`]?.unit}
                          </span>
                        )}

                        <button
                          onClick={() => {
                            setValues((p) => ({
                              ...p,
                              [`${nutrimentId}_serving`]: {
                                ...p[`${nutrimentId}_serving`],
                                unit: null,
                                value: null,
                              },
                            }));
                          }}
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  <td>
                    <Button
                      variant="contained"
                      color="success"
                      sx={{ ml: 2 }}
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
                      Valider
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="contained"
                      color="success"
                      sx={{ ml: 2 }}
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
                      Valider
                    </Button>
                  </td>
                </tr>
              </tfoot>
            </table>
            {/* {showRaw && (
              <pre style={{ maxHeight: 450, overflow: "auto" }}>
                {JSON.stringify(insight, null, 2)}
              </pre>
            )}
            <button onClick={() => setShowRaw((p) => !p)}>
              {showRaw ? "hide raw data" : "show raw data"}
            </button> */}
            <Button
              variant="outlined"
              sx={{ mt: 5, mx: "auto", width: 300 }}
              onClick={() => {
                nextItem();
                apiRef.current.resetTransform();
              }}
            >
              Skip
            </Button>
          </Stack>
        </Stack>
      </ErrorBoundary>
    </React.Suspense>
  );
}

// nutrient: {
// }
// nutrition_data_per = "100g" | "serving";
