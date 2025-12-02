import * as React from "react";

import { useParams } from "react-router";

import LogoForm from "../../components/LogoForm";
import robotoff from "../../robotoff";
import offService from "../../off";
import externalApi from "../../externalApi";
import { IS_DEVELOPMENT_MODE } from "../../const";

import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";

import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import FlagIcon from "@mui/icons-material/Flag";

import { useTranslation } from "react-i18next";

//  Only for testing purpose
import { sleep } from "../../utils";
import Loader from "../loader";

const getImageURL = (logo) => offService.getImageUrl(logo.image.source_image);

const getCropURL = (logo) => {
  return robotoff.getCroppedImageUrl(getImageURL(logo), logo.bounding_box);
};

const UpdateLogoForm = ({
  logoId,
  image_id,
  annotationValue = "",
  annotationType = "",
  imageURL,
  cropURL,
  barcode,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [isImageOpen, setIsImageOpen] = React.useState(false);
  const [isImageFlagged, setIsImageFlagged] = React.useState(false);

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
    [],
  );

  return (
    <Box sx={{ margin: "2% 10%" }}>
      <Dialog open={isImageOpen} onClose={() => setIsImageOpen(false)}>
        <img
          src={imageURL}
          alt=""
          style={{ maxWidth: "90vw", maxHeight: "90vh" }}
        />
      </Dialog>
      <Stack spacing={2}>
        <Typography
          variant="h2"
          sx={{
            fontSize: "1.5rem",
            fontWeight: 600,
            marginBottom: 2,
          }}
        >
          {t("logos.detail")}
        </Typography>
        <Typography>
          {t("logos.id")} {logoId}
        </Typography>
        <Typography>
          {t("logos.barcode")} {barcode}
        </Typography>
        <img width="300px" src={cropURL} alt={t("logos.crop_image_title")} />
        <Stack direction="row">
          <Button
            variant="contained"
            sx={{
              width: 200,
              mr: 5,
            }}
            onClick={() => {
              setIsImageOpen(true);
            }}
          >
            {t("logos.full_image")}
          </Button>
          {isImageFlagged ? (
            <Tooltip title={t("logos.unflag")}>
              <IconButton
                onClick={() => {
                  externalApi.deleteImageFlag({ barcode, imgid: image_id });
                  setIsImageFlagged(false);
                }}
              >
                <FlagIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={t("logos.flag")}>
              <IconButton
                onClick={() => {
                  externalApi.addImageFlag({
                    barcode,
                    imgid: image_id,
                    url: imageURL,
                  });
                  setIsImageFlagged(true);
                }}
              >
                <OutlinedFlagIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        <Divider />

        <LogoForm
          value={annotationValue}
          type={annotationType}
          updateMode
          request={request(logoId)}
          isLoading={isLoading}
        />
      </Stack>
    </Box>
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
      image_id: "",
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
          image_id: data.image.image_id,
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
          image_id: "",
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

  return (
    <React.Suspense fallback={<Loader />}>
      <UpdateLogoForm {...fetchedData} logoId={logoId} />
    </React.Suspense>
  );
}
