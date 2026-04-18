import * as React from "react";

import robotoff from "../robotoff";
import off from "../off";

type InsightDetailResponse = {
  data?: {
    bounding_box?: [number, number, number, number];
    source_image?: string;
    data?: { logo_id?: string };
  };
};

type LogosImagesResponse = {
  data?: {
    logos?: Array<{ bounding_box?: [number, number, number, number] }>;
  };
};

const fetchData = async (insightId: string): Promise<
  | { source_image?: string; bounding_box?: [number, number, number, number] }
  | null
> => {
  const response = (await robotoff.insightDetail(insightId)) as InsightDetailResponse | null;

  if (!response) {
    return null;
  }

  let bounding_box = response.data?.bounding_box;
  const source_image = response.data?.source_image;
  const logo_id = response.data?.data?.logo_id;

  if (source_image && logo_id && !bounding_box) {
    const logoData = (await robotoff.getLogosImages([logo_id])) as LogosImagesResponse | null;
    bounding_box = logoData?.data?.logos?.[0]?.bounding_box;
  }

  return { source_image, bounding_box };
};

const getCroppedLogoUrl = (
  debugResponse: null | { source_image?: string; bounding_box?: [number, number, number, number] },
): string | null => {
  if (!debugResponse) {
    return null;
  }
  const { bounding_box, source_image } = debugResponse;

  if (!source_image || !bounding_box) {
    return null;
  }

  const sourceImage = off.getImageUrl(source_image);
  return robotoff.getCroppedImageUrl(sourceImage, bounding_box);
};

type CroppedLogoProps = {
  insightId: string;
  [key: string]: unknown;
};

const CroppedLogo: React.FC<CroppedLogoProps> = (props) => {
  const { insightId, ...other } = props;
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let isValid = true;
    setLoading(true);

    fetchData(insightId)
      .then(getCroppedLogoUrl)
      .then((url) => {
        if (isValid) {
          setLogoUrl(url);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });

    return () => {
      isValid = false;
    };
  }, [insightId]);

  if (loading || !logoUrl) {
    return null;
  }
  return <img alt="logo used in prediction" src={logoUrl} {...other} />;
};

export default CroppedLogo;
