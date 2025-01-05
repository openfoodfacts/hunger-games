import * as React from "react";
import { useRobotoffPredictions } from "./useRobotoffPredictions";
import NUTRIMENTS from "../../assets/nutriments.json";
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import Stack from "@mui/material/Stack";
import {
  deleteRobotoff,
  getCountryLanguageCode,
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
import useNutrimentTranslations from "./useNutrimentTranslations";
import { useCountry } from "../../contexts/CountryProvider";
import { useTranslation } from "react-i18next";
import { useSearchParamsState } from "../../hooks/useSearchParamsState";

export default function Nutrition() {
  const { t } = useTranslation();
  const [partiallyFilled, setPartiallyFilled] = useSearchParamsState('partiallyFilled', false, Boolean);
  const [displayOFFValue, setDisplayOFFValue] = useSearchParamsState('displayValue', false, Boolean);

  const handlePartiallyFilled = (_, checked) => {
    setPartiallyFilled(checked);
    setDisplayOFFValue(checked);
  };
  const handleDisplayOFFValue = (_, checked) => setDisplayOFFValue(checked);
  const [country] = useCountry();

  const languageCode = getCountryLanguageCode(country);
  const nutrientsTranslations = useNutrimentTranslations(languageCode);

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
                label={t("nutrition.table_partialy_filled")}
              />
              <FormControlLabel
                disabled={!partiallyFilled}
                control={
                  <Checkbox
                    checked={partiallyFilled ? displayOFFValue : false}
                    onChange={handleDisplayOFFValue}
                  />
                }
                label={t("nutrition.display_off_values")}
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
                    <td>{t("nutrition.nutrients")}</td>
                    <td>100g</td>
                    <td>
                      {`${t("nutrition.serving_size")} `}
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
                    ({ id: nutrimentId, name: nutrimentName_en, depth }) => {
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

                      const nutrimentName_native =
                        nutrientsTranslations[languageCode]?.[nutrimentId];
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
                            {nutrimentName_native === undefined ? (
                              nutrimentName_en
                            ) : (
                              <div>
                                {nutrimentName_native}
                                <Typography
                                  component="legend"
                                  fontSize="small"
                                  sx={{ pl: 1 }}
                                  color={(theme) =>
                                    theme.palette.text.secondary
                                  }
                                >
                                  {nutrimentName_en}
                                </Typography>
                              </div>
                            )}
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
                          {t("nutrition.add_nutrient")}
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
                        {t("nutrition.validate_100g")}
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
                        {t("nutrition.validate_serving")}
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
                {t("nutrition.skip")}
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
                {t("nutrition.invalid_image")}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </ErrorBoundary>
    </React.Suspense>
  );
}
