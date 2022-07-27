import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

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
    .filter((key) => !isNaN(key))
    .map((key) => `${rootImageUrl}/${key}.jpg`);
};


const formatStringArray = (stringArray) => {
  if (stringArray.length === 0) return ''

  let result = stringArray[0];

  for(let i = 0; i < stringArray.length; i++) {
    result += ', ' + stringArray[i]
  }

  return result + '.';
}

const ProductInformation = ({ question }) => {
  const { t } = useTranslation();
  const [productData, setProductData] = React.useState({});
  const [hideImages, setHideImages] = React.useState(true);

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
    <Box>
      {/* Main information about the product */}
      <Typography>{productData?.productName}</Typography>
      <Button
        size="small"
        component={Link}
        target="_blank"
        href={offService.getProductUrl(question.barcode)}
        variant="outlined"
        startIcon={<VisibilityIcon />}
        sx={{ minWidth: 150 }}
      >
        {t("questions.view")}
      </Button>
      <Button
        size="small"
        component={Link}
        target="_blank"
        href={offService.getProductEditUrl(question.barcode)}
        variant="contained"
        startIcon={<EditIcon />}
        sx={{ ml: 2, minWidth: 150 }}
      >
        {t("questions.edit")}
      </Button>
      <Divider sx={{ my: 1 }} />

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
        <Stack direction="row" flexWrap="wrap" gap='1em'>
          {getImagesUrls(productData.images, question.barcode).map((src) => (
            <Zoom key={src}>
              <img
                src={src}
                alt=""
                loading="lazy"
                style={{ maxWidth: 300, maxHeight: 300 }}
              />
            </Zoom>
          ))}
        </Stack>
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
        {t("questions.countries")}: {!productData?.countriesTags?null:formatStringArray(productData.countriesTags)}
      </p>
      <Divider />
    </Box>
  );
};
export default ProductInformation;
