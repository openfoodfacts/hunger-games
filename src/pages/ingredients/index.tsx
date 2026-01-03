import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { useCountry } from "../../contexts/CountryProvider";
import { MapInteractionCSS } from "react-map-interaction";

import Loader from "../loader";
import off from "../../off";
import { useTranslation } from "react-i18next";
import useData from "./useData";
import ImageAnnotation from "./ImageAnnotation";
import { OFF_URL } from "../../const";

function ProductInterface(props) {
  const { product, next } = props;
  const { t } = useTranslation();

  const { selectedImages, product_name, code, scans_n } = product;
  const [imageTab, setImageTab] = React.useState(selectedImages[0].countryCode);

  React.useEffect(() => {
    setImageTab(selectedImages[0].countryCode);
  }, [selectedImages]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setImageTab(newValue);
  };

  return (
    <div style={{ padding: "0 5px" }}>
      <Typography variant="h6">
        {product_name || "No product name"} (scan: {scans_n})
        <br />
        <a href={off.getProductUrl(code)}>{code}</a>
      </Typography>
      <Stack direction="column">
        {selectedImages?.length > 0 && (
          <TabContext value={imageTab}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={handleChange}
                aria-label="language code of the selected image"
              >
                {selectedImages.map(({ countryCode }) => {
                  return (
                    <Tab
                      key={`${code}-${countryCode}`}
                      label={
                        countryCode ? `Lang ${countryCode}` : "default lang"
                      }
                      value={countryCode}
                    />
                  );
                })}
              </TabList>
            </Box>
            {selectedImages.map(
              ({
                countryCode,
                imageUrl,
                fetchDataUrl,
                uploaded_t,
                uploader,
              }) => {
                return (
                  <TabPanel value={countryCode} key={`${code}-${countryCode}`}>
                    <Stack direction="row">
                      <Box sx={{ width: "50%", height: "60vh" }}>
                        <MapInteractionCSS
                          showControls
                          minScale={0.5}
                          translationBounds={{
                            xMax: 100,
                            yMax: 100,
                          }}
                        >
                          <img
                            src={imageUrl}
                            style={{
                              width: "50%",
                              objectFit: "contain",
                            }}
                          />
                        </MapInteractionCSS>

                        <Typography sx={{ textAlign: "center" }}>
                          <Link
                            href={`${OFF_URL}/contributor/${uploader}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {uploader}
                          </Link>{" "}
                          {uploaded_t &&
                            new Date(uploaded_t * 1000).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                        </Typography>
                      </Box>
                      <ImageAnnotation
                        fetchDataUrl={fetchDataUrl}
                        code={code as string}
                        imageLang={countryCode}
                        offText={
                          product[`ingredients_text_${countryCode}`] ?? ""
                        }
                      />
                    </Stack>
                  </TabPanel>
                );
              },
            )}
          </TabContext>
        )}
      </Stack>
      <Button onClick={next} fullWidth variant="outlined">
        {t("ingredients.skip")}
      </Button>
    </div>
  );
}

export default function IngredientsPage() {
  const { t } = useTranslation();
  const [country] = useCountry();
  const selectedCountryCode = country;

  const [data, removeHead, isLoading] = useData(selectedCountryCode);
  // console.log("Data is ",data);
  return (
    <React.Suspense fallback={<Loader />}>
      <Stack
        spacing={1}
        sx={{
          px: 5,
          pt: 4,
          pb: 2,
        }}
      >
        <Typography>{t("ingredients.description")}</Typography>
      </Stack>
      {/* <IngeredientDisplay /> */}
      {isLoading ? (
        "loading..."
      ) : data && data.length === 0 ? (
        "No data"
      ) : (
        <ProductInterface product={data[0]} next={removeHead} />
      )}

      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </React.Suspense>
  );
}
