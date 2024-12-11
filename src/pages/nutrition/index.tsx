import * as React from "react";
import { useRobotoffPredictions } from "./useRobotoffPredictions";
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { Box, Button, Checkbox, FormControlLabel } from "@mui/material";
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
import PictureSection from "./PictureSection";
import { KNOWN_NUTRIMENTS } from "./config";

export default function Nutrition() {
  const [partiallyFilled, setPartiallyFilled] = React.useState(false);
  const [displayOFFValue, setDisplayOFFValue] = React.useState(false);
  const handlePartiallyFilled = (_, checked) => setPartiallyFilled(checked);
  const handleDisplayOFFValue = (_, checked) => setDisplayOFFValue(checked);

  const [additionalIds, setAdditionalIds] = React.useState([]);

  const { isLoading, insight, nextItem, count, product } =
    useRobotoffPredictions(partiallyFilled);

  const [values, setValues] = React.useState<
    Record<string, Pick<NutrimentPrediction, "value" | "unit">>
  >({});
  const apiRef = React.useRef<ReactZoomPanPinchRef>();

  React.useEffect(() => {
    setAdditionalIds([]);
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
        ...insight.data.nutrients["energy-kcal_serving"],
        unit: "kcal",
      },
      "energy-kj_100g": {
        value: null,
        ...insight.data.nutrients["energy-kj_100g"],
        unit: "kj",
      },
      "energy-kj_serving": {
        value: null,
        ...insight.data.nutrients["energy-kj_serving"],
        unit: "kj",
      },
    }));
  }, [insight]);

  const nutrimentsDisplayed = React.useMemo(
    () => structurePredictions(values, product, additionalIds),
    [values, product, additionalIds],
  );

  const notUsedNutriments = React.useMemo(
    () => KNOWN_NUTRIMENTS.filter((id) => !nutrimentsDisplayed.includes(id)),
    [nutrimentsDisplayed],
  );
  return (
    <React.Suspense>
      <ErrorBoundary>
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
                  {nutrimentsDisplayed.map((nutrimentId) => {
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
                  })}
                  <tr>
                    <td style={{ paddingLeft: 10, paddingRight: 4 }}>
                      <select
                        style={{ width: 155 }}
                        value=""
                        tabIndex={2}
                        onChange={(event) => {
                          setAdditionalIds((p) => [...p, event.target.value]);
                        }}
                      >
                        <option disabled selected value="">
                          -- add nutriment --
                        </option>
                        {notUsedNutriments.map((nutriId) => (
                          <option key={nutriId} value={nutriId}>
                            {nutriId}
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
