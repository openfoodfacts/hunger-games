import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import FlagIcon from "@mui/icons-material/Flag";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ZoomableImage from "./ZoomableImage";
import {
  ADDITIONAL_INFO_TRANSLATION,
  getImageId,
  getImagesUrls,
  useFlagImage,
} from "../pages/questions/utils";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const Slider = ({
  productData,
  question,
  flagged,
  flagImage,
  deleteFlagImage,
}: {
  productData: any;
  question: any;
  flagged: any;
  flagImage: any;
  deleteFlagImage: any;
}) => {
  const { t } = useTranslation();

  const images = getImagesUrls(productData.images, question.barcode);
  const [index, setIndex] = useState(0);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "500px",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          transform: `translateX(-${index * 100}%)`,
          transition: "transform 0.4s ease",
        }}
      >
        {images.map((src: string) => (
          <div
            key={src}
            style={{
              minWidth: "100%",
              height: "100%",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ZoomableImage
              src={src}
              imageProps={{
                loading: "lazy",
                style: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                },
              }}
            />

            <div style={{ position: "absolute", bottom: 10, right: 10 }}>
              {flagged.includes(getImageId(src)) ? (
                <Tooltip title={t("questions.unflag")}>
                  <IconButton
                    onClick={() => deleteFlagImage(src, question.barcode)}
                    sx={{ bgcolor: "white" }}
                  >
                    <FlagIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title={t("questions.flag")}>
                  <IconButton onClick={() => flagImage(src, question.barcode)}>
                    <OutlinedFlagIcon />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </div>
        ))}
      </div>

      <ArrowBackIosNewIcon
        onClick={prevSlide}
        style={{
          position: "absolute",
          top: "50%",
          left: "10px",
          transform: "translateY(-50%)",
          zIndex: 10,
        }}
      />

      <ArrowForwardIosIcon
        onClick={nextSlide}
        style={{
          position: "absolute",
          top: "50%",
          right: "10px",
          transform: "translateY(-50%)",
          zIndex: 10,
        }}
      >
        Next
      </ArrowForwardIosIcon>
    </div>
  );
};

export default Slider;
