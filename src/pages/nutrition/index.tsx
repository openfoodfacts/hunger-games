import * as React from "react";
import { useRobotoffPredictions } from "./useRobotoffPredictions";
import NUTRIMENTS from "../../assets/nutriments.json";
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { Box, Button, Checkbox, FormControlLabel } from "@mui/material";
import Stack from "@mui/material/Stack";
import {
  deleteRobotoff,
  postRobotoff,
  skipRobotoff,
  structurePredictions,
} from "./utils";
import { NutrimentPrediction } from "./insight.types";
import { ErrorBoundary } from "../taxonomyWalk/Error";
import LinksToProduct from "./LinksToProduct";
import { NutrimentCell } from "./NutrimentCell";
import PictureSection from "./PictureSection";
import Instructions from "./Instructions";

export default function Nutrition() {
  const [partiallyFilled, setPartiallyFilled] = React.useState(false);
  const [displayOFFValue, setDisplayOFFValue] = React.useState(false);
  const handlePartiallyFilled = (_, checked) => {
    setPartiallyFilled(checked);
    setDisplayOFFValue(checked);
  };
  const handleDisplayOFFValue = (_, checked) => setDisplayOFFValue(checked);

  const { isLoading, insight, nextItem, count, product } =
    useRobotoffPredictions(partiallyFilled);

  const [values, setValues] = React.useState<
    Record<string, Pick<NutrimentPrediction, "value" | "unit">>
  >({});
  const apiRef = React.useRef<ReactZoomPanPinchRef>();

  React.useEffect(() => {
    if (!insight || typeof insight === "string") {
      setValues({});
      return;
    }

    const defaultizedInsightValues = Object.fromEntries(
      Object.entries(insight.data.nutrients).map(([id, values]) => {
        const defaultUnit = NUTRIMENTS.find((item) => item.id === id)?.unit;
        return [id, { unit: defaultUnit, ...values }];
      }),
    );

    setValues(defaultizedInsightValues);
  }, [insight]);

  const nutrimentsDisplayed = React.useMemo(
    () => structurePredictions(values, product),
    [values, product],
  );

  const notUsedNutriments = React.useMemo(() => {
    const displayedIds = new Set(nutrimentsDisplayed.map(({ id }) => id));

    return NUTRIMENTS.filter((item) => !displayedIds.has(item.id));
  }, [nutrimentsDisplayed]);

  return (
    <React.Suspense>
      <ErrorBoundary>
        <Instructions />
        <Stack direction="row">
          <Box sx={{ width: "50%" }}>
            <PictureSection
              isLoading={isLoading}
              insight={insight}
              product={product}
              apiRef={apiRef}
            />
          </Box>
          <Stack direction="column" sx={{ width: "50%", p: 2 }}>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={partiallyFilled}
                    onChange={handlePartiallyFilled}
                  />
                }
                label="Tableau partielement rempli"
              />
              <FormControlLabel
                disabled={!partiallyFilled}
                control={
                  <Checkbox
                    checked={partiallyFilled ? displayOFFValue : false}
                    onChange={handleDisplayOFFValue}
                  />
                }
                label="afficher le valeurs OFF"
              />
            </Box>
            <LinksToProduct
              barcode={insight?.barcode}
              count={count}
              sx={{ mb: 2 }}
            />

            <Box
              sx={(theme) => ({
                width: "fit-content",
                "& tr": { verticalAlign: "top" },
                "& .focused": {
                  backgroundColor: theme.palette.divider,
                  fontWeight: "bold",
                },
              })}
            >
              <table>
                <thead>
                  <tr>
                    <td>Nutriments</td>
                    <td>100g</td>
                    <td>
                      serving{" "}
                      <div style={{ display: "inline-table" }}>
                        <input
                          tabIndex={2}
                          value={values?.serving_size?.value ?? ""}
                          onChange={(event) =>
                            setValues((p) => ({
                              ...p,
                              serving_size: {
                                ...p.serving_size,
                                value: event.target.value,
                              },
                            }))
                          }
                          style={{ width: 100 }}
                        />
                        <br />
                        {displayOFFValue && (
                          <legend style={{ fontSize: 13, textAlign: "end" }}>
                            {product?.serving_size}
                          </legend>
                        )}
                      </div>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {nutrimentsDisplayed.map(
                    ({ id: nutrimentId, name: nutrimentName, depth }) => {
                      const key100g = `${nutrimentId}_100g`;
                      const { value: value100g, unit: unit100g } =
                        values[key100g] ?? {};

                      const keyServing = `${nutrimentId}_serving`;
                      const { value: valueServing, unit: unitServing } =
                        values[keyServing] ?? {};

                      const product100g = product?.nutriments?.[key100g];
                      const productServing = product?.nutriments?.[keyServing];
                      const productUnit =
                        product?.nutriments?.[`${nutrimentId}_unit`];

                      return (
                        <tr
                          key={nutrimentId}
                          data-label-id={nutrimentId} // Attributes used to highlight when focusing
                        >
                          <td
                            style={{
                              paddingLeft: 10 + depth ? depth * 10 : 0,
                              paddingRight: 4,
                            }}
                          >
                            {nutrimentName}
                          </td>
                          <NutrimentCell
                            tabIndex={1}
                            nutrimentId={nutrimentId}
                            nutrimentKey={key100g}
                            value={value100g}
                            unit={unit100g}
                            setValues={setValues}
                            productValue={product100g}
                            productUnit={productUnit}
                            displayOFFValue={displayOFFValue}
                          />
                          <NutrimentCell
                            tabIndex={2}
                            nutrimentId={nutrimentId}
                            nutrimentKey={keyServing}
                            value={valueServing}
                            unit={unitServing}
                            setValues={setValues}
                            productValue={productServing}
                            productUnit={productUnit}
                            displayOFFValue={displayOFFValue}
                          />
                        </tr>
                      );
                    },
                  )}
                  <tr>
                    <td style={{ paddingLeft: 10, paddingRight: 4 }}>
                      <select
                        style={{ width: 155 }}
                        value=""
                        tabIndex={2}
                        onChange={(event) => {
                          setValues((prev) => {
                            const defaultUnit = NUTRIMENTS.find(
                              (item) => item.id === event.target.value,
                            ).unit;
                            return {
                              ...prev,
                              [`${event.target.value}_100g`]: {
                                value: "",
                                unit: defaultUnit,
                              },
                              [`${event.target.value}_serving`]: {
                                value: "",
                                unit: defaultUnit,
                              },
                            };
                          });
                        }}
                      >
                        <option disabled value="">
                          -- add nutriment --
                        </option>
                        {notUsedNutriments.map(({ id, name }) => (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td />
                    <td />
                  </tr>
                </tbody>
                <tfoot>
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
                </tfoot>
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
