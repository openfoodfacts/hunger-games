import * as React from "react";

import { useParams } from "react-router-dom";

import LogoForm from "../../components/LogoForm";
import robotoff from "../../robotoff";
import offService from "../../off";
import { IS_DEVELOPMENT_MODE } from "../../const.js";

import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

import { useTranslation } from "react-i18next";

//  Only for testing purpose
import { sleep } from "../../utils";

const getImageURL = (logo) => offService.getImageUrl(logo.image.source_image);

const getCropURL = (logo) => {
  return robotoff.getCroppedImageUrl(getImageURL(logo), logo.bounding_box);
};

const UpdateLogoForm = ({ logoId, annotationValue = "", annotationType = "", imageURL, cropURL, barcode, isLoading }) => {
  const { t } = useTranslation();
  const [isImageOpen, setIsImageOpen] = React.useState(false);

  const request = React.useCallback(
    (logoId) => async (data) => {
      if (data == null) {
        return;
      }
      const { type, value } = data;
      if (IS_DEVELOPMENT_MODE) {
        await sleep(2000);
        console.log(`Updated`);
      } else {
        await robotoff.updateLogo(logoId, value, type);
      }
    },
    []
  );

  return (
    <>
      <Dialog open={isImageOpen} onClose={() => setIsImageOpen(false)}>
        <img src={imageURL} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh" }} />
      </Dialog>
      <Stack spacing={2} sx={{ alignItems: "center", maxWidth: 500 }}>
        <Typography>{t("logos.detail")}</Typography>
        <Typography>
          {t("logos.id")} {logoId}
        </Typography>
        <Typography>
          {t("logos.barcode")} {barcode}
        </Typography>
        <Button
          onClick={() => {
            setIsImageOpen(true);
          }}
        >
          {t("logos.full_image")}
        </Button>

        <img width="300px" src={cropURL} alt="crop of the logo" />

        <Divider />

        <LogoForm value={annotationValue} type={annotationType} updateMode request={request(logoId)} isLoading={isLoading} />
      </Stack>
    </>
  );
};

export default function LogoUpdate() {
  const { logoId } = useParams();
  const [fetchedData, setFetchedData] = React.useState({
    annotationValue: "",
    annotationType: "",
    imageURL: "",
    cropURL: "",
    barcode: "",
    isLoading: false,
  });

  React.useEffect(() => {
    let isValid = true;
    setFetchedData({
      annotationValue: "",
      annotationType: "",
      imageURL: "",
      cropURL: "",
      barcode: "",
      isLoading: true,
    });
    robotoff
      .loadLogo(logoId)
      .then(({ data }) => {
        if (!isValid) {
          return;
        }
        setFetchedData({
          imageURL: getImageURL(data),
          cropURL: getCropURL(data),
          annotationValue: data.annotation_value || "",
          annotationType: data.annotation_type || "",
          barcode: data.image.barcode,
          isLoading: false,
        });
      })
      .catch(() => {
        if (!isValid) {
          return;
        }
        setFetchedData(() => ({
          annotationValue: "",
          annotationType: "",
          imageURL: "",
          cropURL: "",
          barcode: "",
          isLoading: false,
        }));
        this.isLoading = false;
      });
    return () => {
      isValid = false;
    };
  }, [logoId]);

  return <UpdateLogoForm {...fetchedData} />;
}
