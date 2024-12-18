import * as React from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import off from "../../off";
import { OFF_IMAGE_URL } from "../../const";
import { Stack } from "@mui/material";
interface ShowImageProps {
  barcode: string;
  images?: Record<string, { imgid: number }>;
}

export default function ShowImage(props: ShowImageProps) {
  const { barcode, images } = props;

  const [selectedImageId, setSelectedImageId] = React.useState(null);

  React.useEffect(() => {
    setSelectedImageId(images?.ingredients_fr?.imgid ?? null);
  }, [images]);

  const availableImgids = React.useMemo(() => {
    const ids = Object.values(images ?? {})
      .map((img) => img.imgid)
      .filter((id) => id !== undefined);

    // Dumb filter
    return ids.filter((id, index) => !ids.slice(0, index).includes(id));
  }, [images]);

  const imageUrl = selectedImageId
    ? `${OFF_IMAGE_URL}/${off.getFormatedBarcode(
        barcode,
      )}/${selectedImageId}.jpg`
    : "";

  return (
    <div>
      <div>
        <TransformWrapper limitToBounds={false}>
          <TransformComponent>
            <div style={{ width: "100%", height: "70vh" }}>
              <img
                key={imageUrl}
                src={imageUrl}
                alt=""
                style={{
                  width: "100%",
                  maxHeight: "70vh",
                }}
              />
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
      <Stack direction="row">
        {availableImgids.map((id) => (
          <button key={id} onClick={() => setSelectedImageId(id)}>
            <img
              src={`${OFF_IMAGE_URL}/${off.getFormatedBarcode(
                barcode,
              )}/${id}.100.jpg`}
              alt=""
              style={{ maxHeight: 100, maxWidth: 100 }}
            />
          </button>
        ))}
      </Stack>
    </div>
  );
}
