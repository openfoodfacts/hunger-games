import * as React from "react";
import IconButton from "@mui/material/IconButton";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import { InsightType } from "./insight.types";
import { ProductType } from "./useRobotoffPredictions";
import { getImageId } from "./utils";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";
import { OFF_IMAGE_URL } from "../../const";

interface PictureSectionProps {
  isLoading?: boolean;
  insight?: InsightType;
  product?: ProductType;
  apiRef: React.Ref<ReactZoomPanPinchRef>;
}

export default function PictureSection(props: PictureSectionProps) {
  const { isLoading, insight, product, apiRef } = props;

  const [rotationIndex, setRotationIndex] = React.useState(0);

  React.useEffect(() => {
    setRotationIndex(0);
  }, [insight]);
  if (isLoading) {
    return <p>Loading ....</p>;
  }
  if (!insight) {
    return <p>No predicition found</p>;
  }

  const imageId = getImageId(insight.source_image);

  const imageTimestamp = product?.images?.[imageId]?.uploaded_t;

  return (
    <React.Fragment>
      <p>
        Photo upload:{" "}
        {imageTimestamp
          ? new Date(imageTimestamp * 1000).toLocaleDateString(undefined, {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "..."}
      </p>
      <IconButton onClick={() => setRotationIndex((p) => p - 1)}>
        <RotateLeftIcon />
      </IconButton>
      <IconButton onClick={() => setRotationIndex((p) => p + 1)}>
        <RotateRightIcon />
      </IconButton>
      <TransformWrapper limitToBounds={false} ref={apiRef}>
        <TransformComponent>
          <img
            key={insight.source_image}
            src={`${OFF_IMAGE_URL}${insight.source_image}`}
            alt=""
            style={{
              width: "100%",
              maxHeight: "200vh",
              rotate: `${90 * rotationIndex}deg`,
            }}
          />
        </TransformComponent>
      </TransformWrapper>
    </React.Fragment>
  );
}
