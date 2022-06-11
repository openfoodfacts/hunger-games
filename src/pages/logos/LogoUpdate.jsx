import * as React from "react";

import { useParams } from "react-router-dom";

import robotoff from "../../robotoff";
import offService from "../../off";
import { IS_DEVELOPMENT_MODE } from "../../const.js";
import LoadingButton from "@mui/lab/LoadingButton";

import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";

import { useTranslation } from "react-i18next";

//  Only for testing purpose
import { sleep } from "../../utils";

const getImageURL = (logo) => offService.getImageUrl(logo.image.source_image);

const getCropURL = (logo) => {
  return robotoff.getCroppedImageUrl(getImageURL(logo), logo.bounding_box);
};

const TYPE_WITHOUT_VALUE = ["packager_code", "qr_code"];

const updateLogo = async ({ logoId, type, value }) => {
  if (type.length === 0) return;

  let formattedValue = value.toLowerCase();
  if (TYPE_WITHOUT_VALUE.includes(type)) {
    formattedValue = "";
  }
  if (IS_DEVELOPMENT_MODE) {
    await sleep(2000);
    console.log(`Updated`);
  } else {
    await robotoff.updateLogo(logoId, formattedValue, type);
  }
};
const logoTypeOptions = [
  { value: "", labelKey: "logos.type" },
  { value: "label", labelKey: "logos.label" },
  { value: "brand", labelKey: "logos.brand" },
  { value: "packager_code", labelKey: "logos.packager_code" },
  { value: "packaging", labelKey: "logos.packaging" },
  { value: "qr_code", labelKey: "logos.qr_code" },
  { value: "category", labelKey: "logos.category" },
  { value: "nutrition_label", labelKey: "logos.nutrition_label" },
  { value: "store", labelKey: "logos.store" },
];

const UpdateLogoForm = ({ logoId, annotationValue, annotationType, imageURL, cropURL, barcode, isLoading }) => {
  const { t } = useTranslation();
  const [internalValue, setInternalValue] = React.useState("");
  const [internalType, setInternalType] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isImageOpen, setIsImageOpen] = React.useState(false);

  React.useEffect(() => {
    setInternalValue(annotationValue);
    setIsImageOpen(false);
  }, [annotationValue]);
  React.useEffect(() => {
    setInternalType(annotationType);
    setIsImageOpen(false);
  }, [annotationType]);

  const validation = React.useCallback(async () => {
    setIsSending(true);
    updateLogo({ logoId, type: internalType, value: internalValue });
    setIsSending(false);
  }, [logoId, internalType, internalValue]);

  const isDifferent = internalType !== annotationType || (!TYPE_WITHOUT_VALUE.includes(internalType) && annotationValue.toLowerCase() !== internalValue.toLocaleLowerCase());

  return (
    <>
      <Dialog open={isImageOpen} onClose={() => setIsImageOpen(false)}>
        <img src={imageURL} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh" }} />
      </Dialog>
      <Stack spacing={2} sx={{ maxWidth: 300 }}>
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

        <TextField value={internalValue} onChange={(event) => setInternalValue(event.target.value)} label={t("logos.value")} />
        <TextField value={internalType} onChange={(event) => setInternalType(event.target.value)} select label={t("logos.type")}>
          {logoTypeOptions.map(({ value, labelKey }) => (
            <MenuItem value={value}>{t(labelKey)}</MenuItem>
          ))}
        </TextField>
        <LoadingButton onClick={validation} loading={isSending} disabled={isLoading || !isDifferent}>
          {t("logos.update")}
        </LoadingButton>
      </Stack>
    </>
  );
};

export default function LogoUpdate() {
  const { logoId } = useParams();
  const [fetchedData, setFetchedData] = React.useState();

  React.useEffect(() => {
    let isValid = true;
    setFetchedData({
      annotationValue: "",
      annotationType: "",
      imageURL: "",
      cropURL: "",
      barcode: "",
      isLoading: false,
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
          annotationValue: data.annotation_value,
          annotationType: data.annotation_type,
          barcode: data.image.barcode,
          isLoading: false,
        });
      })
      .catch(() => {
        if (!isValid) {
          return;
        }
        setFetchedData((prev) => ({ ...prev, isLoading: false }));
        this.isLoading = false;
      });
    return () => {
      isValid = false;
    };
  }, [logoId]);
  return <UpdateLogoForm {...fetchedData} />;
}
