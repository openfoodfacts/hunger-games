import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ReactCrop from "react-image-crop";
import Loader from "../loader";
import off from "../../off";
import { useTranslation } from "react-i18next";
import useData from "./useData";
import "react-image-crop/dist/ReactCrop.css";

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
          ({ countryCode, url, x, y, w, h, x1, x2, y1, y2 }, index) => {
            const crop =
              x1 === undefined
                ? {
                    x,
                    y,
                    width: w,
                    height: h,
                  }
                : {
                    x: Number.parseInt(x1),
                    y: Number.parseInt(y1),
                    width: Number.parseInt(x2) - Number.parseInt(x1),
                    height: Number.parseInt(y2) - Number.parseInt(y1),
                  };
            return (
              <Stack
                direction="column"
                key={index}
                // sx={{ maxHeight: 500, maxWidth: 500 }}
              >
                <Typography>{countryCode}</Typography>
                <div>
                  <ReactCrop crop={{ unit: "px", ...crop }}>
                    <img src={url} />
                  </ReactCrop>
                </div>
                <p>{JSON.stringify(crop)}</p>
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

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </React.Suspense>
  );
}
