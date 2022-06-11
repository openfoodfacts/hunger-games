import * as React from "react";

import { Typography, Card, CardActionArea, CardMedia, CardContent, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";

import robotoff from "../../robotoff";
import off from "../../off";
import { IS_DEVELOPMENT_MODE } from "../../const";
//  Only for testing purpose
import { sleep } from "../../utils";

const TYPE_WITHOUT_VALUE = ["packager_code", "qr_code"];

export const getQuestionSearchParams = (logoSearchState) => {
  const urlParams = new URLSearchParams(window.location.search);

  Object.keys(DEFAULT_LOGO_SEARCH_STATE).forEach((key) => {
    if (urlParams.get(key) !== undefined && !logoSearchState[key]) {
      urlParams.delete(key);
    } else if (logoSearchState[key] && urlParams.get(key) !== logoSearchState[key]) {
      urlParams.set(key, logoSearchState[key]);
    }
  });
  return urlParams.toString();
};

const updateSearchSearchParams = (newState) => {
  const newRelativePathQuery = `${window.location.pathname}?${getQuestionSearchParams(newState)}`;
  window.history.pushState(null, "", newRelativePathQuery);
};

const DEFAULT_LOGO_SEARCH_STATE = {
  count: "",
  logo_id: "",
  index: "",
};

export function useLogoSearchParams() {
  const [logoSearchParams, setInternLogoSearchParams] = React.useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialSearchParams = DEFAULT_LOGO_SEARCH_STATE;
    for (let key of Object.keys(DEFAULT_LOGO_SEARCH_STATE)) {
      if (urlParams.has(key)) {
        initialSearchParams[key] = urlParams.get(key);
      }
    }
    return initialSearchParams;
  });

  const setLogoSearchParams = React.useCallback(
    (modifier) => {
      let newState;
      if (typeof modifier === "function") {
        newState = modifier(logoSearchParams);
      } else {
        newState = modifier;
      }
      const isDifferent = Object.keys(DEFAULT_LOGO_SEARCH_STATE).some((key) => newState[key] !== logoSearchParams[key]);
      if (!isDifferent) {
        return;
      }

      setInternLogoSearchParams(newState);
      updateSearchSearchParams(newState);
    },
    [logoSearchParams]
  );
  return [logoSearchParams, setLogoSearchParams];
}

const loadLogos = async (targetLogoId, index, annotationCount) => {
  const {
    data: { results },
  } = await robotoff.getLogoAnnotations(targetLogoId, index, annotationCount);
  const {
    data: { logos: logoImages },
  } = await robotoff.getLogosImages(results.map((r) => r.logo_id));

  const logoData = results.map(({ logo_id, distance }) => {
    const annotation = logoImages.find(({ id }) => id === logo_id);
    const image = annotation.image;
    const src = robotoff.getCroppedImageUrl(off.getImageUrl(image.source_image), annotation.bounding_box);

    return {
      distance,
      ...annotation,
      image: { ...image, src },
    };
  });
  return logoData;
};

const sendAnnotations = async (value, type, selectedIds) => {
  let formattedValue = value.toLowerCase();

  if (TYPE_WITHOUT_VALUE.includes(type)) {
    formattedValue = "";
  }
  const annotations = selectedIds.map((id) => ({
    logo_id: id,
    value: formattedValue,
    type,
  }));

  if (IS_DEVELOPMENT_MODE) {
    console.log(annotations);
    await sleep(3000);
  } else {
    await robotoff.annotateLogos(annotations);
  }
};

export default function LogoAnnotation() {
  const { t } = useTranslation();

  const [logoSearchParams, setLogoSearchParams] = useLogoSearchParams();
  const [logoState, setLogoState] = React.useState({ logos: [], isLoading: false });

  React.useEffect(() => {
    let isValid = true;
    setLogoState({ logos: [], isLoading: true });
    loadLogos(logoSearchParams.logo_id, logoSearchParams.index, logoSearchParams.count)
      .then((logoData) => {
        if (!isValid) return;
        setLogoState({
          isLoading: false,
          logos: logoData,
        });
      })
      .catch(() => {
        if (!isValid) return;
        setLogoState({
          isLoading: false,
          logos: [],
        });
      });
    return () => {
      isValid = true;
    };
  }, [logoSearchParams.count, logoSearchParams.logo_id, logoSearchParams.index]);

  const toggleSelection = React.useCallback((id) => {
    setLogoState((state) => {
      const indexToToggle = state.logos.findIndex((logo) => logo.id === id);
      if (indexToToggle < 0) {
        return state;
      }
      return {
        ...state,
        logos: [
          ...state.logos.slice(0, indexToToggle),
          {
            ...state.logos[indexToToggle],
            selected: !state.logos[indexToToggle].selected,
          },
          ...state.logos.slice(indexToToggle + 1),
        ],
      };
    });
  });
  if (logoState.isLoading) {
    return <p>Loading...</p>;
  }
  return (
    <>
      <Typography>{t("logos.annotations")}</Typography>
      {/* put the form here */}
      {logoState.logos
        .filter((logo) => !!logo.selected)
        .map((logo) => (
          <Card key={logo.id} sx={{ width: 100, height: 150 }}>
            <CardActionArea onClick={() => toggleSelection(logo.id)}>
              <CardMedia component="img" height="100" loading="lazy" image={logo.image.src} sx={{ objectFit: "contain" }} />
            </CardActionArea>
          </Card>
        ))}
      <Divider sx={{ margin: "1rem" }} />
      {logoState.logos
        .filter((logo) => !logo.selected)
        .map((logo) => (
          <Card key={logo.id} sx={{ width: 100, height: 150 }}>
            <CardActionArea onClick={() => toggleSelection(logo.id)}>
              <CardMedia component="img" height="100" loading="lazy" image={logo.image.src} sx={{ objectFit: "contain" }} />
            </CardActionArea>
          </Card>
        ))}
    </>
  );
}
