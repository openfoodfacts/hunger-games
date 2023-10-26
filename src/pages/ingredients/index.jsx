import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Loader from "../loader";
import off from "../../off";
import { useTranslation } from "react-i18next";
import useData from "./useData";
import useRobotoffPrediction from "./useRobotoffPrediction";

function ProductInterface(props) {
  const {
    product: { selectedImages, product_name, code },
    next,
  } = props;

  const [predictions, getPreidiction] = useRobotoffPrediction(); // This could be simplified if each image had it's own component (and so its own state)

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
              <Stack direction="column" key={index}>
                <Typography>{countryCode}</Typography>

                <img src={imageUrl} />

                {predictions[fetchDataUrl]?.loading && <p>loading ...</p>}
                {predictions[fetchDataUrl]?.loading === false &&
                  predictions[fetchDataUrl]?.data === null && (
                    <p>An error occured X{"("}</p>
                  )}
                {predictions[fetchDataUrl]?.loading === false &&
                  predictions[fetchDataUrl]?.data !== null &&
                  Object.keys(predictions[fetchDataUrl]?.data).length === 0 && (
                    <p>No ingredients found</p>
                  )}
                {predictions[fetchDataUrl]?.loading === false &&
                  predictions[fetchDataUrl]?.data !== null &&
                  Object.keys(predictions[fetchDataUrl]?.data).length > 0 && (
                    <React.Fragment>
                      {Object.entries(predictions[fetchDataUrl]?.data).map(
                        ([lang, text], index) => (
                          <div
                            key={index}
                            style={{ margin: 4, border: "solid black 1px" }}
                          >
                            <p>{lang}</p>
                            <p>{text}</p>
                          </div>
                        )
                      )}
                    </React.Fragment>
                  )}
                <button
                  onClick={() => {
                    getPreidiction(fetchDataUrl);
                  }}
                >
                  fetch
                </button>
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
