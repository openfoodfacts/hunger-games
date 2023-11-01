import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Loader from "../loader";
import off from "../../off";
import { useTranslation } from "react-i18next";
import useData from "./useData";
import ImageAnnotation from "./ImageAnnotation";

function ProductInterface(props) {
  const {
    product: { selectedImages, product_name, code },
    next,
  } = props;

  return (
    <div>
      <Typography>
        {product_name || "No product name"} (
        <a href={off.getProductUrl(code)}>{code}</a>)
      </Typography>
      <Stack direction="row">
        {selectedImages.map(
          ({ countryCode, imageUrl, fetchDataUrl }, index) => {
            return (
              <Stack direction="column" key={`${code}-${index}`}>
                <Typography>{countryCode}</Typography>

                <img src={imageUrl} />
                <ImageAnnotation fetchDataUrl={fetchDataUrl} />
              </Stack>
            );
          }
        )}
      </Stack>
      <Button onClick={next}>Skip this product</Button>
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

      {isLoading ? (
        "loading..."
      ) : data.length === 0 ? (
        "No data"
      ) : (
        <ProductInterface product={data[0]} next={removeHead} />
      )}

      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </React.Suspense>
  );
}
