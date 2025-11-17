import * as React from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import off from "../../off";
import { OFF_IMAGE_URL } from "../../const";
import { Button, Stack } from "@mui/material";
import { useCountry } from "../../contexts/CountryProvider";
interface ShowImageProps {
  barcode: string;
  images?: Record<string, { imgid: number }>;
}

export default function ShowImage(props: ShowImageProps) {
  const { barcode, images } = props;
  const [country] = useCountry();

  const [selectedImageId, setSelectedImageId] = React.useState(null);
  const availableIngredientImages = React.useMemo<
    { country: string; imgid: number }[]
  >(
    () =>
      Object.keys(images ?? {})
        .map((key) => {
          if (key.startsWith("ingredients_")) {
            return { country: key.split("_")[1], imgid: images[key].imgid };
          }
          return null;
        })
        .filter(Boolean),
    [images],
  );

  React.useEffect(() => {
    if (images?.[`ingredients_${country}`] !== undefined) {
      setSelectedImageId(images?.[`ingredients_${country}`]?.imgid ?? null);
    } else {
      setSelectedImageId(availableIngredientImages[0]?.imgid ?? null);
    }
  }, [images, availableIngredientImages]);

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
      <Stack direction="row">
        {availableIngredientImages.map(({ country, imgid }) => (
          <Button
            key={country}
            onClick={() => setSelectedImageId(imgid)}
            variant={selectedImageId === imgid ? "contained" : "outlined"}
            size="small"
          >
            {country}
          </Button>
        ))}
      </Stack>
      <TransformWrapper limitToBounds={false}>
        <TransformComponent>
          <div style={{ width: "50vw", height: "70vh" }}>
            <img
              key={imageUrl}
              src={imageUrl}
              alt=""
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
      <Stack direction="row">
        {availableImgids.map((id) => (
          <button
            key={id}
            style={{
              backgroundColor: selectedImageId === id ? "lightblue" : undefined,
            }}
            onClick={() => setSelectedImageId(id)}
          >
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
