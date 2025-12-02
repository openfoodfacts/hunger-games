import * as React from "react";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { useTheme } from "@mui/material/styles";

import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import robotoff from "../../robotoff";
import off from "../../off";
import LogoGrid from "../../components/LogoGrid";
import BackToTop from "../../components/BackToTop";
import useUrlParams from "../../hooks/useUrlParams";
import AnnotateLogoModal from "../../components/AnnotateLogoModal";

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

const DEFAULT_LOGO_SEARCH_STATE = {
  count: 50,
  logo_id: "",
  index: "",
};

const loadLogos = async (
  targetLogoId,
  index,
  annotationCount = 50,
  alreadyLoadedData = [],
) => {
  const {
    data: { results, query_logo_id },
  } = await robotoff.getLogoAnnotations(targetLogoId, index, annotationCount);

  results.unshift({ logo_id: Number.parseInt(query_logo_id), distance: 0 });

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
      annotation.bounding_box,
    );

    return {
      distance,
      ...annotation,
      image: { ...image, src },
    };
  });

  return logoData;
};

const DEFAULT_LOGO_STATE = { logos: [], isLoading: true, referenceLogo: {} };
export default function LogoAnnotation() {
  const { t } = useTranslation();
  const theme = useTheme();

  const [logoSearchParams] = useUrlParams(DEFAULT_LOGO_SEARCH_STATE, {});

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
      logoState.logos,
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
      logoSearchParams.count,
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
              (logo) => logo.id.toString() === logoSearchParams.logo_id,
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
    [logoSearchParams.logo_id],
  );

  const setRangeSelection = React.useCallback((ids, newSelectedState) => {
    const shouldBeSet = {};
    ids.forEach((id) => (shouldBeSet[id] = true));

    setLogoState((state) => {
      return {
        ...state,
        logos: state.logos.map((logo) =>
          shouldBeSet[logo.id] &&
          logo.annotation_type === null &&
          logo.annotation_value === null
            ? {
                ...logo,
                selected: newSelectedState,
              }
            : logo,
        ),
      };
    });
  }, []);

  const selectAll = () => {
    setLogoState((prevState) => ({
      ...prevState,
      logos: prevState.logos.map((logo) => {
        if (logo.annotation_value === null) {
          logo.selected =
            logo.annotation_type === null && logo.annotation_value === null;
        }
        return logo;
      }),
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
        logoSearchParams.count,
      );
      setLogoState({
        isLoading: false,
        logos: logoData.map((logo) => ({
          ...logo,
          selected: logoSearchParams.logo_id === logo.id.toString(),
        })),
        referenceLogo:
          logoData.find(
            (logo) => logo.id.toString() === logoSearchParams.logo_id,
          ) || {},
      });
    } catch {
      setLogoState(DEFAULT_LOGO_STATE);
    }

    setIsRefreshing(false);
  };

  const [isAnnotationOpen, setIsAnnotationOpen] = React.useState(false);
  const openAnnotation = React.useCallback(() => {
    setIsAnnotationOpen(true);
  }, []);
  const closeAnnotation = React.useCallback(() => {
    setIsAnnotationOpen(false);
  }, []);

  const selectedIds = logoState.logos
    .filter((logo) => logo.selected)
    .map((logo) => logo.id);

  if (logoState.isLoading) {
    <p>{t("logos.loading")}</p>;
  }

  return (
    <React.Suspense fallback={<CircularProgress />}>
      <Box sx={{ margin: "2% 10%" }}>
        <Typography
          typography="h2"
          sx={{
            fontSize: "1.5rem",
            fontWeight: 600,
            marginBottom: 2,
          }}
        >
          {t("logos.annotations")}
        </Typography>
        <Typography>{t("logos.task_description")}</Typography>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            paddingY: 2,
            background: `linear-gradient(0deg, ${theme.palette.background.paper}00 0%, ${theme.palette.background.paper}FF 25px, ${theme.palette.background.paper}FF 100%)`,
            backdropFilter: "blur(5px)",
          }}
          elevation={0}
        >
          {/* Selection buttons */}
          <Stack direction="row" spacing={1} sx={{ my: 1 }}>
            <Button variant="outlined" size="small" onClick={selectAll}>
              {t("logos.select_all")}
            </Button>
            <Button
              variant="outlined"
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
              variant="outlined"
              size="small"
              onClick={refreshData}
              loading={isRefreshing}
            >
              {t("logos.refresh")}
            </LoadingButton>
            <div style={{ flexGrow: 1 }} />
            <Button
              size="small"
              variant="contained"
              color="secondary"
              component={Link}
              to="/logos/search/"
            >
              {t("logos.search_specific")}
            </Button>
          </Stack>
        </Box>

        {logoState.isLoading && (
          <Box sx={{ width: "100%", textAlign: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        )}
        {/* Logos to select */}
        <LogoGrid
          logos={logoState.logos}
          toggleLogoSelection={toggleSelection}
          setLogoSelectionRange={setRangeSelection}
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
            {t("logos.load_more")}
          </Button>
        </Box>

        <Box sx={{ my: 5, textAlign: "center", position: "sticky", bottom: 0 }}>
          <Button
            fullWidth
            onClick={openAnnotation}
            color="success"
            variant="contained"
          >
            Annotate
          </Button>
        </Box>

        <AnnotateLogoModal
          game="logoAnnotation"
          value={logoState.referenceLogo.annotation_value ?? ""}
          type={logoState.referenceLogo.annotation_type ?? ""}
          isOpen={isAnnotationOpen}
          logos={logoState.logos}
          closeAnnotation={closeAnnotation}
          toggleLogoSelection={toggleSelection}
          afterAnnotation={(selectedLogos, annotation) => {
            const logoIds = selectedLogos.map((l) => l.id);

            setLogoState((prevState) => ({
              ...prevState,
              logos: prevState.logos.map((logo) => {
                if (!logoIds.includes(logo.id)) {
                  return logo;
                }
                return {
                  ...logo,
                  selected: false,
                  annotation_type: annotation.type,
                  annotation_value: annotation.value,
                };
              }),
            }));
          }}
        />
        <BackToTop />
      </Box>
    </React.Suspense>
  );
}
