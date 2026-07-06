import * as React from "react";

import robotoff from "../robotoff";
import off from "../off";

const fetchData = async (insightId: string) => {
  const response = await robotoff.insightDetail(insightId);

  if (!response) {
    return null;
  }

  let bounding_box: [number, number, number, number] | undefined = response
    ?.data?.data?.bounding_box as [number, number, number, number] | undefined;
  const source_image = response?.data?.source_image;
  const logo_id = response?.data?.data?.logo_id;

  if (source_image && logo_id && !bounding_box) {
    const logoData = await robotoff.getLogosImages([`${logo_id}`]);
    bounding_box = logoData?.data?.logos?.[0]?.bounding_box as
      | [number, number, number, number]
      | undefined;
  }

  return { source_image, bounding_box };
};

const getCroppedLogoUrl = (
  debugResponse: null | {
    source_image?: string;
    bounding_box?: [number, number, number, number];
  },
) => {
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

interface CroppedLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  insightId: string;
}

const CroppedLogo = (props: CroppedLogoProps) => {
  const { insightId, ...other } = props;
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isValid = true;
    setLoading(true);

    fetchData(insightId)
      .then(getCroppedLogoUrl)
      .then((url: string | null) => {
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
