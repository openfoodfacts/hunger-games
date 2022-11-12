import * as React from "react";

import robotoff from "../robotoff";
import off from "../off";

const fetchData = async (insightId: string) => {
  const response = await robotoff.insightDetail(insightId);

  if (
    response?.data?.source_image &&
    response?.data?.data?.logo_id &&
    !response?.data?.data?.bounding_box
  ) {
    const logoData = await robotoff.getLogosImages([
      response?.data?.data?.logo_id,
    ]);
    const bounding_box = logoData?.data?.logos?.[0]?.bounding_box;

    return { ...response, bounding_box };
  }

  return response;
};

const getCroppedLogoUrl = (debugResponse) => {
  const debugData = debugResponse?.data;
  const bounding_box =
    debugData?.data?.bounding_box || debugResponse?.bounding_box;

  if (!debugData?.source_image || !bounding_box) {
    return null;
  }

  const sourceImage = off.getImageUrl(debugData?.source_image);
  return robotoff.getCroppedImageUrl(sourceImage, bounding_box);
};

const CroppedLogo = (props) => {
  const { insightId, ...other } = props;
  const [logoUrl, setLogoUrl] = React.useState(null);

  React.useEffect(() => {
    let isValid = true;

    fetchData(insightId)
      .then(getCroppedLogoUrl)
      .then((url) => {
        if (isValid) {
          setLogoUrl(url);
        }
      })
      .catch(() => {});

    return () => {
      isValid = false;
    };
  }, [insightId]);

  if (!logoUrl) {
    return null;
  }
  return <img alt="logo used in prediction" src={logoUrl} {...other} />;
};

export default CroppedLogo;
