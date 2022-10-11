import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import LogoGrid from "../../components/LogoGrid";
import LogoSearchForm from "../../components/LogoSearchForm";
import robotoff from "../../robotoff";
import off from "../../off";
import useUrlParams from "../../hooks/useUrlParams";

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
  const { data } = await robotoff.searchLogos(
    barcode,
    value,
    type,
    Number.parseInt(count)
  );

  return {
    logos: data.logos.map(transformLogo),
    count: data.count,
  };
};

export default function LogoSearch() {
  const { t } = useTranslation();
  const [searchState, setSearchState] = useUrlParams({
    type: "",
    value: "",
    barcode: "",
    count: 25,
  });
  console.log({ searchState });

  const [result, setResult] = React.useState({ logos: [], count: undefined });

  const validate = React.useCallback(
    (params) => {
      setSearchState(params);
    },
    [setSearchState]
  );

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

      <Typography
        variant="h6"
        sx={{
          textAlign: "end",
          p: 2,
          mt: 5,
          mb: 10,
          mr: 20,
        }}
      >
        {result.count === 0
          ? t("logos.no_results")
          : t("logos.result_count", {
              showing: result.logos.length,
              available: result.count ?? 0,
            })}
      </Typography>
    </Box>
  );
}
