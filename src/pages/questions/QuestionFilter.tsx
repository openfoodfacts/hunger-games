import * as React from "react";

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import Dialog from "@mui/material/Dialog";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DialogActions, DialogContent } from "@mui/material";

import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { useFavorite } from "../../components/QuestionFilter/useFavorite";
import LabelFilter from "../../components/QuestionFilter/LabelFilter";
import brands from "../../assets/brands.json";
import countries from "../../assets/countries.json";
import {
  insightTypesNames,
  campagnes,
} from "../../components/QuestionFilter/const";
import { capitaliseName } from "../../utils";
import { filterStateSelector, updateFilter } from "./store";
import { useSearchParams } from "react-router";

const getChipsParams = (filterState, setSearchParams, t) =>
  [
    {
      key: "valueTag",
      display: !!filterState?.valueTag,
      label: `${t(
        "questions.filters.short_label.value",
      )}: ${filterState?.valueTag}`,
      onDelete: () => {
        setSearchParams((prev) => {
          prev.delete("value_tag");
          return prev;
        });
      },
    },

    {
      key: "countryFilter",
      display: !!filterState?.countryFilter,
      label: `${t("questions.filters.short_label.country")}: ${capitaliseName(
        filterState?.countryFilter,
      )}`,
      onDelete: () => {
        setSearchParams((prev) => {
          prev.delete("country");
          return prev;
        });
      },
    },

    {
      key: "brandFilter",
      display: !!filterState?.brandFilter,
      label: `${t(
        "questions.filters.short_label.brand",
      )}: ${filterState?.brandFilter}`,
      onDelete: () => {
        setSearchParams((prev) => {
          prev.delete("brand");
          return prev;
        });
      },
    },
    {
      key: "sortByPopularity",
      display: !!filterState?.sortByPopularity,
      label: t("questions.filters.short_label.popularity"),
      onDelete: () => {
        setSearchParams((prev) => {
          prev.set("sorted", "false");
          return prev;
        });
      },
    },
    {
      key: "campaign",
      display: !!filterState?.campaign,
      label: `${t(
        "questions.filters.short_label.campaign",
      )}: ${filterState?.campaign}`,
      onDelete: () => {
        setSearchParams((prev) => {
          prev.delete("campaign");
          return prev;
        });
      },
    },
  ].filter((item) => item.display);

export const QuestionFilter = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [isOpen, setIsOpen] = React.useState(false);

  const dispatch = useDispatch();
  const filterState = useSelector(filterStateSelector);

  const updateFilterState = (newParams) => {
    dispatch(updateFilter(newParams));
  };

  const [isFavorite, toggleFavorite] = useFavorite(filterState);

  const innerInsightType = searchParams.get("type") ?? "";
  const innerValueTag = searchParams.get("value_tag") ?? "";
  const innerCountryFilter = searchParams.get("country") ?? "";

  const innerCountryObject = React.useMemo(
    () =>
      countries.find((country) => country.id === innerCountryFilter) ?? null,
    [innerCountryFilter],
  );

  const innerBrandFilter = searchParams.get("brand") ?? "";
  const innerSortByPopularity = searchParams.get("sorted") ?? "true";
  const innerCampaign = searchParams.get("campaign") ?? "";

  React.useEffect(() => {
    if (!isOpen) {
      updateFilterState({
        insightType: innerInsightType,
        valueTag: innerValueTag,
        countryFilter: innerCountryFilter,
        brandFilter: innerBrandFilter,
        sortByPopularity: innerSortByPopularity !== "false",
        campaign: innerCampaign,
      });
    }
  }, [
    isOpen,
    searchParams,
    innerInsightType,
    innerValueTag,
    innerCountryFilter,
    innerBrandFilter,
    innerSortByPopularity,
    innerCampaign,
  ]);

  const resetFilter = () => {
    setSearchParams((prev) => {
      prev.set("type", filterState?.insightType);
      prev.set("value_tag", filterState?.valueTag);
      prev.set("country", filterState?.countryFilter ?? "");
      prev.set("brand", filterState?.brandFilter);
      prev.set("sorted", Boolean(filterState?.sortByPopularity).toString());
      prev.set("campaign", filterState?.campaign);
      return prev;
    });
    setIsOpen(false);
  };

  const applyFilter = () => {
    updateFilterState({
      insightType: innerInsightType,
      valueTag: innerValueTag,
      countryFilter: innerCountryFilter,
      brandFilter: innerBrandFilter,
      sortByPopularity: innerSortByPopularity !== "false",
      campaign: innerCampaign,
    });

    setIsOpen(false);
  };

  const chipsParams = getChipsParams(filterState, setSearchParams, t);

  return (
    <Box>
      {/* Chip indicating the current state of the filtering */}
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          select
          size="small"
          sx={{
            width: {
              xs: "130px",
              md: 150,
            },
          }}
          value={filterState?.insightType}
          onChange={(event) =>
            setSearchParams((prev) => {
              prev.set("type", event.target.value);
              return prev;
            })
          }
          label={t(`questions.insightTypeLabel`)}
        >
          {Object.keys(insightTypesNames).map((insightType) => (
            <MenuItem key={insightType} value={insightType}>
              {t(`questions.${insightType}`)}{" "}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ overflow: "hidden" }}>
          {isDesktop ? (
            chipsParams.map(({ key, label, onDelete }) => (
              <Chip key={key} label={label} onDelete={onDelete} />
            ))
          ) : (
            <Chip
              label={t("questions.filters.active_filter_number", {
                count: chipsParams.length,
              })}
            />
          )}
        </Box>

        <IconButton
          onClick={() => {
            toggleFavorite();
          }}
          color="primary"
        >
          {isFavorite ? <StarIcon /> : <StarBorderIcon />}
        </IconButton>
        <IconButton
          onClick={() => setIsOpen(true)}
          color="primary"
          sx={{ display: { xs: "inherit", md: "none" } }}
        >
          <EditIcon />
        </IconButton>
      </Stack>

      {/* The filter form itself */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { p: 2 },
        }}
      >
        <DialogContent>
          <Stack spacing={2} sx={{ display: isOpen ? undefined : "none" }}>
            <FormControl>
              <FormLabel id="insightType-radio-buttons">
                {t("questions.filters.long_label.type")}
              </FormLabel>
              <RadioGroup
                row={isDesktop}
                aria-labelledby="insightType-radio-buttons"
                name="insightTypes"
                value={innerInsightType}
                onChange={(event) =>
                  setSearchParams((prev) => {
                    prev.set("type", event.target.value);
                    prev.set("value_tag", "");
                    return prev;
                  })
                }
              >
                {Object.keys(insightTypesNames).map((insightTypeValue) => (
                  <FormControlLabel
                    key={insightTypeValue}
                    value={insightTypeValue}
                    control={<Radio />}
                    label={t(`questions.${insightTypeValue}`)}
                    labelPlacement={isDesktop ? "top" : "end"}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {["category", "label"].includes(innerInsightType) ? (
              <LabelFilter
                value={innerValueTag}
                valueTag
                onChange={(newVal) =>
                  setSearchParams((prev) => {
                    if (!newVal) {
                      prev.delete("value_tag");
                    } else {
                      prev.set("value_tag", newVal || "");
                    }
                    return prev;
                  })
                }
                insightType={innerInsightType}
                label={t("questions.filters.long_label.value")}
                placeholder={t("questions.filters.placeholders.value")}
                size="small"
              />
            ) : (
              <TextField
                value={innerValueTag}
                onChange={(event) => {
                  setSearchParams((prev) => {
                    prev.set("value_tag", event.target.value);
                    return prev;
                  });
                }}
                label={t("questions.filters.long_label.value")}
                placeholder={t("questions.filters.placeholders.value")}
                size="small"
              />
            )}
            <Autocomplete
              value={innerCountryObject}
              onChange={(event, newValue) =>
                setSearchParams((prev) => {
                  prev.set("country", newValue.id);
                  return prev;
                })
              }
              options={countries}
              getOptionLabel={(country) => country.label}
              isOptionEqualToValue={(country, value) => country.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("questions.filters.long_label.country")}
                  size="small"
                />
              )}
            />

            <Autocomplete
              freeSolo
              value={innerBrandFilter}
              onChange={(event, newValue) =>
                setSearchParams((prev) => {
                  prev.set("brand", newValue);
                  return prev;
                })
              }
              options={brands}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("questions.filters.long_label.brand")}
                  placeholder={t("questions.filters.placeholders.brand")}
                  size="small"
                />
              )}
            />

            <TextField
              select
              value={innerCampaign}
              onChange={(event) => {
                setSearchParams((prev) => {
                  prev.set("campaign", event.target.value);
                  return prev;
                });
              }}
              label={t("questions.filters.long_label.campaign")}
              placeholder={t("questions.filters.placeholders.campaign")}
              size="small"
            >
              {campagnes.map((val) => (
                <MenuItem key={val} value={val}>
                  {val}
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              checked={innerSortByPopularity !== "false"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setSearchParams((prev) => {
                  prev.set("sorted", event.target.checked.toString());
                  return prev;
                })
              }
              control={<Checkbox />}
              label={t("questions.filters.long_label.popularity")}
              labelPlacement="end"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button variant="outlined" onClick={resetFilter}>
              {t("questions.filters.actions.cancel")}
            </Button>
            <Button variant="contained" onClick={applyFilter}>
              {t("questions.filters.actions.apply")}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Edit filter on desktop only */}
      <Box sx={{ textAlign: "center", display: { xs: "none", md: "inherit" } }}>
        <Button
          variant="contained"
          onClick={() => setIsOpen(true)}
          startIcon={<EditIcon />}
          size="small"
        >
          {t("questions.filters.actions.edit")}
        </Button>
      </Box>
    </Box>
  );
};
