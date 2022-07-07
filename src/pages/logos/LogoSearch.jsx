import * as React from "react";
import LogoGrid from "../../components/LogoGrid";
import LogoSearchForm from "../../components/LogoSearchForm";
import robotoff from "../../robotoff";
import off from "../../off";
import { Box } from "@mui/material";
import axios from "axios";

const transformLogo = (logo) => {
  const src =
    logo.image.url ||
    robotoff.getCroppedImageUrl(
      off.getImageUrl(logo.image.source_image),
      logo.bounding_box
    );

  return { ...logo, image: { ...logo.image, src } };
};

const request = async ({ barcode, value, type, count }) => {
  const { data } = await robotoff.searchLogos(barcode, value, type, count);

  return {
    logos: data.logos.map(transformLogo),
    count: data.count,
  };
};

export default function LogoSearch() {
  const [searchState, setSearchState] = React.useState({});
  const [result, setResult] = React.useState({ logos: [], count: undefined });

  const validate = React.useCallback((params) => {
    setSearchState(params);
  }, []);

  React.useEffect(() => {
    axios
      .get("https://world.openfoodfacts.org/cgi/auth.pl", {
        withCredentials: true,
      })
      .then((rep) => console.log({ rep }))
      .catch((err) => console.log({ err }));
  }, []);

  React.useEffect(() => {
    let isValidRequest = true;
    request(searchState)
      .then((rep) => {
        if (!isValidRequest) {
          return;
        }
        setResult(rep);
      })
      .catch(() => {
        if (!isValidRequest) {
          return;
        }
        setResult({ logos: [], count: undefined });
      });

    return () => (isValidRequest = false);
  }, [searchState]);

  return (
    <Box sx={{ padding: 2 }}>
      <LogoSearchForm
        value=""
        type=""
        barcode=""
        count={25}
        validate={validate}
      />

      <LogoGrid logos={result.logos} toggleLogoSelection={null} />

      <p>
        {result.count === 0
          ? `No logo found`
          : `Shows ${result.logos.length} on ${result.count ?? 0} available`}
      </p>
    </Box>
  );
}
