import * as React from "react";
import { useTranslation } from "react-i18next";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";

import robotoff, { QuestionInterface } from "../../../robotoff";
import off from "../../../off";
const fetchData = async (insightId: string) => {
  const response = await robotoff.insightDetail(insightId);

  if (!response) {
    return response;
  }

  let bounding_box = response.data?.bounding_box;
  const source_image = response.data?.source_image;
  const logo_id = response.data?.data?.logo_id;

  if (source_image && logo_id && !bounding_box) {
    const logoData = await robotoff.getLogosImages([logo_id]);
    bounding_box = logoData?.data?.logos?.[0]?.bounding_box;
  }

  return { source_image, bounding_box };
};

interface LogoQuestionCardProps {
  question: QuestionInterface;
  onClick: (event: React.MouseEvent) => void;
  checked: boolean;
  imageSize: number;
  /**
   * Indicate what part of the image to show:
   * - true: fetch the crop and only display the logo.
   * - false: show the full source image.
   */
  zoomOnLogo: boolean;
}

export const LogoQuestionCard = (props: LogoQuestionCardProps) => {
  const { t } = useTranslation();
  const { question, onClick, checked, imageSize, zoomOnLogo } = props;

  const [croppedImageUrl, setCroppedImageUrl] = React.useState("");

  React.useEffect(() => {
    if (!zoomOnLogo && question.source_image_url) {
      setCroppedImageUrl(question.source_image_url);
      return;
    }

    let isValidQuery = true;

    const getImageUrl = async () => {
      const { source_image, bounding_box } = await fetchData(
        question.insight_id,
      );

      if (!isValidQuery) {
        return;
      }

      if (bounding_box && source_image) {
        setCroppedImageUrl(
          robotoff.getCroppedImageUrl(
            off.getImageUrl(source_image),
            bounding_box,
          ),
        );
      }
    };
    getImageUrl().catch(() => {});

    return () => {
      isValidQuery = false;
    };
  }, [question.insight_id, question.source_image_url, zoomOnLogo]);

  return (
    <Card
      sx={{ width: imageSize, height: imageSize }}
      key={question.insight_id}
    >
      <CardActionArea
        sx={{
          width: imageSize,
          height: imageSize,
          position: "relative",
        }}
        onClick={onClick}
        tabIndex={-1}
      >
        {croppedImageUrl ? (
          <img
            src={croppedImageUrl}
            alt={t("nutriscore.image_alt")}
            loading="lazy"
            style={{ objectFit: "contain", width: "100%", height: "100%" }}
          />
        ) : (
          <Typography>NOT A LOGO</Typography>
        )}
        <Checkbox
          sx={{ position: "absolute", bottom: 10, right: 10 }}
          checked={checked}
          readOnly
          size="medium"
        />
      </CardActionArea>
    </Card>
  );
};
