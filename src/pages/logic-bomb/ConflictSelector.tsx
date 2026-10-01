import * as React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ShuffleIcon from "@mui/icons-material/Shuffle";

import type { ConflictRule } from "./logicBombTypes";
import { OFF_URL } from "../../const";

interface ConflictSelectorProps {
  rules: ConflictRule[];
  selectedRule: ConflictRule;
  onSelectRule: (rule: ConflictRule) => void;
  onRandomRule: () => void;
}

export const ConflictSelector: React.FC<ConflictSelectorProps> = ({
  rules,
  selectedRule,
  onSelectRule,
  onRandomRule,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const facetOffUrl = `${OFF_URL}/facets/data-quality-errors?filter=mutually`;
  const specificFacetUrl = `${OFF_URL}/data-quality-error/${selectedRule.tagId}`;

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={1.5}
      alignItems={{ xs: "stretch", md: "center" }}
      justifyContent="space-between"
      sx={{
        width: "100%",
        p: 2,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.background.paper
            : "#ffffff",
      }}
    >
      {/* Dropdown Selector */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ flex: 1 }}
      >
        <Autocomplete<ConflictRule, false, false, false>
          sx={{ minWidth: { xs: "100%", sm: 380, md: 440 } }}
          size="small"
          options={rules}
          groupBy={(option) =>
            option.field === "categories"
              ? t("logic_bomb.group_categories", "Category Contradictions")
              : t("logic_bomb.group_labels", "Label Contradictions")
          }
          getOptionLabel={(option) => option.title}
          value={selectedRule}
          onChange={(_, val) => {
            if (val) onSelectRule(val);
          }}
          isOptionEqualToValue={(option, val) => option.tagId === val.tagId}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("logic_bomb.select_conflict", "Logic Conflict Facet")}
            />
          )}
          renderOption={(props, option) => {
            const { key, ...otherProps } = props;
            return (
              <Box
                key={key || option.tagId}
                component="li"
                {...otherProps}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                  px: 1.5,
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {option.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    {option.tagId}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Chip
                    size="small"
                    variant="outlined"
                    label={option.field}
                    color={
                      option.field === "categories" ? "primary" : "secondary"
                    }
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      textTransform: "capitalize",
                    }}
                  />
                  {typeof option.count === "number" && (
                    <Chip
                      size="small"
                      label={option.count}
                      sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                    />
                  )}
                </Stack>
              </Box>
            );
          }}
        />

        <Button
          size="medium"
          variant="outlined"
          color="primary"
          startIcon={<ShuffleIcon />}
          onClick={onRandomRule}
          sx={{ textTransform: "none", fontWeight: 600, whiteSpace: "nowrap" }}
        >
          {t("logic_bomb.random_conflict", "Random Conflict")}
        </Button>
      </Stack>

      {/* External facet links */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent={{ xs: "flex-start", md: "flex-end" }}
      >
        <Tooltip
          title={t(
            "logic_bomb.view_on_off_facet",
            "View all products with this error on Open Food Facts",
          )}
        >
          <Button
            size="small"
            variant="text"
            component="a"
            href={specificFacetUrl}
            target="_blank"
            rel="noreferrer"
            endIcon={<OpenInNewIcon fontSize="small" />}
            sx={{ textTransform: "none", fontSize: "0.8rem" }}
          >
            {t("logic_bomb.view_tag_facet", "View Error on OFF")}
          </Button>
        </Tooltip>

        <Tooltip
          title={t(
            "logic_bomb.view_all_facets",
            "View all mutually exclusive facets on Open Food Facts",
          )}
        >
          <Button
            size="small"
            variant="text"
            component="a"
            href={facetOffUrl}
            target="_blank"
            rel="noreferrer"
            endIcon={<OpenInNewIcon fontSize="small" />}
            sx={{
              textTransform: "none",
              fontSize: "0.8rem",
              color: "text.secondary",
            }}
          >
            {t("logic_bomb.all_facets_link", "All Mutually Facets")}
          </Button>
        </Tooltip>
      </Stack>
    </Stack>
  );
};
export default ConflictSelector;
