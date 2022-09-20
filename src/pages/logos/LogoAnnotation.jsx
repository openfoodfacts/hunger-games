import * as React from "react";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import robotoff from "../../robotoff";
import off from "../../off";
import { IS_DEVELOPMENT_MODE } from "../../const";
import LogoGrid from "../../components/LogoGrid";
import LogoForm from "../../components/LogoForm";

//  Only for testing purpose
import { sleep } from "../../utils";

export const getQuestionSearchParams = (logoSearchState) => {
  const urlParams = new URLSearchParams(window.location.search);

  Object.keys(DEFAULT_LOGO_SEARCH_STATE).forEach((key) => {
    if (urlParams.get(key) !== undefined && !logoSearchState[key]) {
      urlParams.delete(key);
    } else if (
      logoSearchState[key] &&
      urlParams.get(key) !== logoSearchState[key]
    ) {
      urlParams.set(key, logoSearchState[key]);
    }
  });
  return urlParams.toString();
};

const updateSearchSearchParams = (newState) => {
  const newRelativePathQuery = `${
    window.location.pathname
  }?${getQuestionSearchParams(newState)}`;
  window.history.pushState(null, "", newRelativePathQuery);
};

const DEFAULT_LOGO_SEARCH_STATE = {
  count: 50,
  logo_id: "",
  index: "",
};

export function useLogoSearchParams() {
  const { search } = useLocation();

  const [logoSearchParams, setInternLogoSearchParams] = React.useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialSearchParams = DEFAULT_LOGO_SEARCH_STATE;
    for (let key of Object.keys(DEFAULT_LOGO_SEARCH_STATE)) {
      if (urlParams.has(key)) {
        initialSearchParams[key] = urlParams.get(key);
      }
    }
    initialSearchParams.count = Number.parseInt(initialSearchParams.count);
    return initialSearchParams;
  });

  React.useEffect(() => {
    setInternLogoSearchParams(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const initialSearchParams = DEFAULT_LOGO_SEARCH_STATE;
      for (let key of Object.keys(DEFAULT_LOGO_SEARCH_STATE)) {
        if (urlParams.has(key)) {
          if (key === "count") {
            initialSearchParams[key] = Number.parseInt(urlParams.get(key));
          } else {
            initialSearchParams[key] = urlParams.get(key);
          }
        }
      }
      return { ...initialSearchParams };
    });
  }, [search]);

  const setLogoSearchParams = React.useCallback(
    (modifier) => {
      let newState;
      if (typeof modifier === "function") {
        newState = modifier(logoSearchParams);
      } else {
        newState = modifier;
      }
      const isDifferent = Object.keys(DEFAULT_LOGO_SEARCH_STATE).some(
        (key) => newState[key] !== logoSearchParams[key]
      );
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

const loadLogos = async (
  targetLogoId,
  index,
  annotationCount = 50,
  alreadyLoadedData = []
) => {
  const {
    data: { results },
  } = await robotoff.getLogoAnnotations(targetLogoId, index, annotationCount);

  const seenIds = {};
  alreadyLoadedData.forEach(({ id }) => {
    seenIds[id] = true;
  });
  const filteredResults = results.filter(({ logo_id }) => !seenIds[logo_id]);

  const {
    data: { logos: logoImages },
  } = await robotoff.getLogosImages(filteredResults.map((r) => r.logo_id));

  const logoData = filteredResults.map(({ logo_id, distance }) => {
    const annotation = logoImages.find(({ id }) => id === logo_id);
    const image = annotation.image;
    const src = robotoff.getCroppedImageUrl(
      off.getImageUrl(image.source_image),
      annotation.bounding_box
    );

    return {
      distance,
      ...annotation,
      image: { ...image, src },
    };
  });

  return logoData;
};

const request = (selectedIds) => async (data) => {
  if (data == null) {
    return;
  }
  const { type, value } = data;

  const annotations = selectedIds.map((id) => ({
    logo_id: id,
    value,
    type,
  }));

  if (IS_DEVELOPMENT_MODE) {
    console.log(annotations);
    await sleep(3000);
  } else {
    await robotoff.annotateLogos(annotations);
  }
};

const DEFAULT_LOGO_STATE = { logos: [], isLoading: true, referenceLogo: {} };
export default function LogoAnnotation() {
  const { t } = useTranslation();

  const [logoSearchParams] = useLogoSearchParams();
  const [logoState, setLogoState] = React.useState(DEFAULT_LOGO_STATE);

  // Restart fetching with higher count
  const [additionalLogos, setAdditionalLogos] = React.useState(0);
  const addMoreLogos = async (toAdd) => {
    const newAdditional = additionalLogos + toAdd;
    if (newAdditional > 500) {
      return;
    }
    setAdditionalLogos(newAdditional);
    setLogoState((prev) => ({ ...prev, isLoading: true }));

    loadLogos(
      logoSearchParams.logo_id,
      logoSearchParams.index,
      logoSearchParams.count + newAdditional,
      logoState.logos
    )
      .then((logoData) => {
        setLogoState((prev) => ({
          ...prev,
          isLoading: false,
          logos: [
            ...prev.logos,
            ...logoData.map((logo) => ({
              ...logo,
              selected: false,
            })),
          ],
        }));
      })
      .catch(() => {});
  };

  React.useEffect(() => {
    let isValid = true;
    setLogoState({ isLoading: true, ...DEFAULT_LOGO_STATE });
    loadLogos(
      logoSearchParams.logo_id,
      logoSearchParams.index,
      logoSearchParams.count
    )
      .then((logoData) => {
        if (!isValid) return;
        setLogoState({
          isLoading: false,
          logos: logoData.map((logo) => ({
            ...logo,
            selected: logoSearchParams.logo_id === logo.id.toString(),
          })),
          referenceLogo:
            logoData.find(
              (logo) => logo.id.toString() === logoSearchParams.logo_id
            ) || {},
        });
      })
      .catch(() => {
        if (!isValid) return;
        setLogoState(DEFAULT_LOGO_STATE);
      });
    return () => {
      isValid = false;
    };
  }, [
    logoSearchParams.count,
    logoSearchParams.logo_id,
    logoSearchParams.index,
  ]);

  const toggleSelection = React.useCallback(
    (id) => {
      if (id.toString() === logoSearchParams.logo_id) {
        return;
      }
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
    },
    [logoSearchParams.logo_id]
  );

  const selectAll = () => {
    setLogoState((prevState) => ({
      ...prevState,
      logos: prevState.logos.map((logo) => ({ ...logo, selected: true })),
    }));
  };

  const unselectAll = () => {
    setLogoState((prevState) => ({
      ...prevState,
      logos: prevState.logos.map((logo) => ({
        ...logo,
        selected: logo.id.toString() === logoSearchParams.logo_id,
      })),
    }));
  };

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const logoData = await loadLogos(
        logoSearchParams.logo_id,
        logoSearchParams.index,
        logoSearchParams.count
      );
      setLogoState({
        isLoading: false,
        logos: logoData.map((logo) => ({
          ...logo,
          selected: logoSearchParams.logo_id === logo.id.toString(),
        })),
        referenceLogo:
          logoData.find(
            (logo) => logo.id.toString() === logoSearchParams.logo_id
          ) || {},
      });
    } catch {
      setLogoState(DEFAULT_LOGO_STATE);
    }

    setIsRefreshing(false);
  };

  const selectedIds = logoState.logos
    .filter((logo) => logo.selected)
    .map((logo) => logo.id);

  if (logoState.isLoading) {
    <p>Loading...</p>;
  }
  return (
    <Box sx={{ margin: "2% 10%" }}>
      <Box
        typography="h2"
        sx={{
          fontSize: "1.5rem",
          fontWeight: 600,
          marginBottom: 2,
        }}
      >
        {t("logos.annotations")}
      </Box>
      <p>
        Select all logos that are exactly the same, and give them a name like
        "en:EU Organic" and a type like "label".
      </p>
      <LogoForm
        value={logoState.referenceLogo.annotation_value ?? ""}
        type={logoState.referenceLogo.annotation_type ?? ""}
        request={async (formData) => {
          await request(selectedIds)(formData);
          setLogoState((prevState) => ({
            ...prevState,
            logos: prevState.logos.map((logo) => {
              return {
                ...logo,
                selected: logoSearchParams.logo_id === logo.id.toString(),
              };
            }),
          }));
        }}
        isLoading={logoState.isLoading}
      />
      <Stack direction="row" spacing={1} sx={{ my: 1 }}>
        <Button size="small" onClick={selectAll}>
          {t("logos.select_all")}
        </Button>
        <Button
          size="small"
          disabled={
            selectedIds.length === 0 ||
            (selectedIds.length === 1 &&
              selectedIds[0].toString() === logoSearchParams.logo_id)
          }
          onClick={unselectAll}
        >
          {t("logos.unselect_all")}
        </Button>
        <LoadingButton
          size="small"
          onClick={refreshData}
          loading={isRefreshing}
        >
          Refresh
        </LoadingButton>
      </Stack>

      <LogoGrid
        logos={logoState.logos.filter((logo) => logo.selected)}
        toggleLogoSelection={toggleSelection}
      />

      <LogoGrid
        logos={logoState.logos}
        toggleLogoSelection={toggleSelection}
        sx={{ justifyContent: "center" }}
      />
      <Box sx={{ my: 5, textAlign: "center" }}>
        <Button
          fullWidth
          variant="contained"
          disabled={logoState.isLoading || additionalLogos + 50 > 500}
          onClick={() => {
            addMoreLogos(50);
          }}
        >
          Load more
        </Button>
      </Box>
    </Box>
  );
}
