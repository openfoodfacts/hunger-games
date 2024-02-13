import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import Loader from "../loader";
import off from "../../off";
import { useTranslation } from "react-i18next";
import useData from "./useData";
import ImageAnnotation from "./ImageAnnotation";

function ProductInterface(props) {
  const { product, next } = props;
  const { t } = useTranslation();

  const { selectedImages, product_name, code } = product;
  const [imageTab, setImageTab] = React.useState(selectedImages[0].countryCode);

  React.useEffect(() => {
    setImageTab(selectedImages[0].countryCode);
  }, [selectedImages]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setImageTab(newValue);
  };

  return (
    <div>
      <Typography>
        {product_name || "No product name"} (
        <a href={off.getProductUrl(code)}>{code}</a>)
      </Typography>
      <Stack direction="column">
        {selectedImages?.length > 0 && (
          <TabContext value={imageTab}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={handleChange}
                aria-label="country code of the selected image"
              >
                {selectedImages.map(({ countryCode }) => {
                  return (
                    <Tab
                      key={`${code}-${countryCode}`}
                      label={countryCode ? `country ${countryCode}` : "default"}
                      value={countryCode}
                    />
                  );
                })}
              </TabList>
            </Box>
            {selectedImages.map(({ countryCode, imageUrl, fetchDataUrl }) => {
              return (
                <TabPanel value={countryCode} key={`${code}-${countryCode}`}>
                  <Stack direction="row">
                    <img
                      src={imageUrl}
                      style={{
                        width: "50%",
                        objectFit: "contain",
                        maxHeight: "60vh",
                      }}
                    />
                    <ImageAnnotation
                      fetchDataUrl={fetchDataUrl}
                      code={code as string}
                      imageLang={countryCode}
                      offText={product[`ingredients_text_${countryCode}`] ?? ""}
                    />
                  </Stack>
                </TabPanel>
              );
            })}
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

  const [data, removeHead, isLoading] = useData();

  return (
    <React.Suspense fallback={<Loader />}>
      <Stack
        spacing={2}
        sx={{
          padding: 5,
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
