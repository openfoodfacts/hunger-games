import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

import { useTranslation } from "react-i18next";
import { NO_QUESTION_LEFT } from "../../const";
import offService from "../../off";

const getImagesUrls = (images, barcode) => {
  if (!images || !barcode) {
    return [];
  }
  const formattedCode = offService.getFormatedBarcode(barcode);
  const rootImageUrl = offService.getImageUrl(formattedCode);
  return Object.keys(images)
    .filter((key) => key)
    .map((key) => `${rootImageUrl}/${key}.jpg`);
};

const ProductInformation = ({ question }) => {
  const { t } = useTranslation();
  const [productData, setProductData] = React.useState({});
  const [hideImages, setHideImages] = React.useState(false);

  React.useEffect(() => {
    if (!question?.barcode) {
      return;
    }
    let isStillValid = true;
    setProductData({
      code: question.barcode,
      isLoading: true,
    });
    offService.getProduct(question.barcode).then((result) => {
      if (!isStillValid) {
        return;
      }
      const product = result.data.product;
      setProductData({
        code: question.barcode,
        productName: product.product_name || "",
        brands: product.brands || "",
        ingredientsText: product.ingredients_text || "",
        countriesTags: product.countries_tags || [],
        images: product.images || {},
        isLoading: false,
      });
    });
    return () => {
      isStillValid = false;
    };
  }, [question?.barcode]);

  if (!question || question === NO_QUESTION_LEFT) {
    return null;
  }
  if (productData.isLoading) {
    return <p>loading...</p>;
  }

  return (
    <Box sx={{ width: { sm: "100%", md: "calc(100%/2)" } }}>
      {/* Main information about the product */}
      <Typography>{productData?.productName}</Typography>
      <Button
        component={Link}
        target="_blank"
        href={offService.getProductUrl(question.barcode)}
      >
        {t("questions.view")}
      </Button>
      <Button
        component={Link}
        target="_blank"
        href={offService.getProductEditUrl(question.barcode)}
      >
        {t("questions.edit")}
      </Button>
      <Divider />

      {/* Image display section */}
      <FormControlLabel
        control={
          <Checkbox
            checked={hideImages}
            onChange={(event) => setHideImages(event.target.checked)}
          />
        }
        label={t("questions.hide_images")}
        labelPlacement="end"
      />
      {!hideImages && productData?.images && (
        <ImageList variant="masonry" cols={3} gap={8}>
          {getImagesUrls(productData.images, question.barcode).map((src) => (
            <ImageListItem key={src}>
              <Zoom>
                <img
                  src={src}
                  style={{ maxWidth: 300, maxHeight: 300 }}
                  alt=""
                  loading="lazy"
                />
              </Zoom>
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* Remaining info */}
      <Divider />
      <p>
        {t("questions.brands")}: {productData?.brands}
      </p>
      <p>
        {t("questions.ingredients")}: {productData?.ingredientsText}
      </p>
      <p>
        {t("questions.countries")}: {productData?.countriesTags}
      </p>
      <Divider />
    </Box>
  );
};
export default ProductInformation;
