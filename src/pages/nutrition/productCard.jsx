import * as React from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ZoomableImage from "../../components/ZoomableImage";
import offService from "../../off";

import { basicNutriments } from "./nutritionFields";

export default function ProductNutriments({ setNutriments, nutriments }) {
  const { t } = useTranslation();
  const [page, setPage] = React.useState(1);
  const [index, setIndex] = React.useState(0);
  const [products, setProducts] = React.useState([]);

  const product = products[index];
  const productName = product
    ? product.product_name
      ? product.product_name
      : t("nutrition.unknown_brand")
    : t("nutrition.loading");

  React.useEffect(() => {
    const productListUrl = offService.getNutritionToFillUrl({ page });

    fetch(productListUrl)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products);
      });
  }, [page]);

  const pictureURL = products[index]
    ? products[index].image_nutrition_url
    : "https://static.openfoodfacts.org/images/image-placeholder.png";

  function clickHandler() {
    if (index < products.length - 1) setIndex((prev) => ++prev);
    else {
      setIndex(0);
      setPage((prevPage) => ++prevPage);
    }
    const resArr = nutriments.filter(
      (nutr) => nutr.display && nutr.value !== null && nutr.value >= 0
    );
    const message = resArr.length ? resArr : t("nutrition.value_missing");
    console.log(message);
    setNutriments(basicNutriments);
  }

  return (
    <Box
      flexGrow={1}
      flexShrink={1}
      display={"flex"}
      gap={"1em"}
      flexDirection={"column"}
      sx={{
        maxWidth: "380px",
        border: "5px solid red",
        alignItems: "center",
      }}
    >
      <Box display={"flex"} flexDirection={"row"} Gap={".5em"}>
        <Button
          onClick={clickHandler}
          color="secondary"
          variant="contained"
          size="large"
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            width: "50%",
          }}
        >
          SKIP
        </Button>
        <Button
          onClick={clickHandler}
          color="success"
          variant="contained"
          size="large"
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            width: "50%",
          }}
        >
          VALIDATE
        </Button>
      </Box>
      <Typography variant="h5" component="h5" sx={{ alignSelf: "center" }}>
        {productName}
      </Typography>
      {/*<Typography variant="p" component="p" sx={{alignSelf: 'center'}}>*/}
      {/*  PRODUCT DESCRIPTION IF NEEDED*/}
      {/*</Typography>*/}

      <ZoomableImage
        // TODO: use getFullSizeImage when the zoom is activated
        // src={getFullSizeImage(question.source_image_url)}
        src={pictureURL}
        alt=""
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          border: "5px solid red",
        }}
      />
    </Box>
  );
}
