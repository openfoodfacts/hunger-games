import * as React from "react";
import { useTranslation } from "react-i18next";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";

import robotoff, { QuestionInterface } from "../../../robotoff";
import off from "../../../off";
type BoundingBox = [number, number, number, number];
interface InsightDetailResponse {
  data?: {
    bounding_box?: BoundingBox;
    source_image?: string;
    data?: { logo_id?: string };
  };
}
interface LogosImagesResponse {
  data?: {
    logos?: Array<{ bounding_box?: BoundingBox }>;
  };
}

const fetchData = async (insightId: string): Promise<{ source_image?: string; bounding_box?: BoundingBox }> => {
  const response = (await robotoff.insightDetail(insightId)) as InsightDetailResponse | undefined;
  if (!response || !response.data) {
    return { source_image: undefined, bounding_box: undefined };
  }
  let bounding_box = response.data.bounding_box;
  const source_image = response.data.source_image;
  const logo_id = response.data.data?.logo_id;
  if (source_image && logo_id && !bounding_box) {
    const logoData = (await robotoff.getLogosImages([logo_id])) as LogosImagesResponse | undefined;
    bounding_box = logoData?.data?.logos && Array.isArray(logoData.data.logos) && logoData.data.logos[0]?.bounding_box
      ? logoData.data.logos[0].bounding_box
      : undefined;
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
      const { source_image, bounding_box } = await fetchData(question.insight_id);
      if (!isValidQuery) {
        return;
      }
      if (
        bounding_box &&
        source_image &&
        Array.isArray(bounding_box) &&
        bounding_box.length === 4 &&
        bounding_box.every((n) => typeof n === "number")
      ) {
        setCroppedImageUrl(
          robotoff.getCroppedImageUrl(
            off.getImageUrl(source_image),
            bounding_box,
          ),
        );
      }
    };
    void getImageUrl();
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
