import * as React from "react";

import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useTranslation } from "react-i18next";

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
    Number.parseInt(count),
    true
  );

  return {
    logos: data.logos.map(transformLogo),
    count: data.count,
  };
};

export default function LogoSearch() {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = React.useState(true);
  const [searchState, setSearchState] = useUrlParams(
    {
      type: "",
      value: "",
      barcode: "",
      count: 25,
    },
    { value: ["value_tag", "valueTag"] }
  );

  const [result, setResult] = React.useState({ logos: [], count: undefined });

  const validate = React.useCallback(
    (params) => {
      setSearchState(params);
    },
    [setSearchState]
  );

  React.useEffect(() => {
    let isValidRequest = true;
    setIsLoading(true);
    setResult({ logos: [], count: undefined });
    request(searchState)
      .then((rep) => {
        if (!isValidRequest) {
          return;
        }
        setIsLoading(false);
        setResult(rep);
      })
      .catch(() => {
        if (!isValidRequest) {
          return;
        }
        setIsLoading(false);
        setResult({ logos: [], count: undefined });
      });

    return () => (isValidRequest = false);
  }, [searchState]);

  return (
    <Box sx={{ padding: 2 }}>
      <LogoSearchForm {...searchState} validate={validate} />

      {isLoading ? (
        <LinearProgress sx={{ mt: 5 }} />
      ) : (
        <>
          <LogoGrid
            logos={result.logos}
            toggleLogoSelection={null}
            readOnly
            editOpen
          />

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
        </>
      )}
    </Box>
  );
}
