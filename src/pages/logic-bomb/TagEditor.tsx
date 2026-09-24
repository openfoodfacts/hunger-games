import * as React from "react";
import { useTranslation } from "react-i18next";
import { useTheme, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import CategoryIcon from "@mui/icons-material/Category";
import LabelIcon from "@mui/icons-material/Label";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import EditIcon from "@mui/icons-material/Edit";

import type { ConflictRule } from "./logicBombTypes";
import {
  cleanTagName,
  matchesTag,
  removeTagFromList,
  removeTagFromText,
} from "./logicBombService";

interface TagEditorProps {
  conflictRule: ConflictRule;
  initialCategories: string;
  initialCategoriesTags: string[];
  initialLabels: string;
  initialLabelsTags: string[];
  categoriesText: string;
  setCategoriesText: (val: string) => void;
  categoriesTags: string[];
  setCategoriesTags: (val: string[]) => void;
  labelsText: string;
  setLabelsText: (val: string) => void;
  labelsTags: string[];
  setLabelsTags: (val: string[]) => void;
  onReset: () => void;
  hasChanges: boolean;
}

export const TagEditor: React.FC<TagEditorProps> = ({
  conflictRule,
  categoriesText,
  setCategoriesText,
  categoriesTags,
  setCategoriesTags,
  labelsText,
  setLabelsText,
  labelsTags,
  setLabelsTags,
  onReset,
  hasChanges,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Active tab: default to the conflicting field
  const defaultTab = conflictRule.field === "labels" ? 1 : 0;
  const [activeTab, setActiveTab] = React.useState<number>(defaultTab);
  const [newTagInput, setNewTagInput] = React.useState<string>("");
  const [showRawText, setShowRawText] = React.useState<boolean>(false);

  const [prevRuleId, setPrevRuleId] = React.useState(conflictRule.tagId);
  if (prevRuleId !== conflictRule.tagId) {
    setPrevRuleId(conflictRule.tagId);
    setActiveTab(conflictRule.field === "labels" ? 1 : 0);
  }

  const isCategoryTab = activeTab === 0;

  // Check presence of conflict tags in categories
  const hasCategoryTag1 = categoriesTags.some((t) =>
    matchesTag(t, conflictRule.tag1, conflictRule.cleanTag1),
  );
  const hasCategoryTag2 = categoriesTags.some((t) =>
    matchesTag(t, conflictRule.tag2, conflictRule.cleanTag2),
  );

  // Check presence of conflict tags in labels
  const hasLabelTag1 = labelsTags.some((t) =>
    matchesTag(t, conflictRule.tag1, conflictRule.cleanTag1),
  );
  const hasLabelTag2 = labelsTags.some((t) =>
    matchesTag(t, conflictRule.tag2, conflictRule.cleanTag2),
  );

  const currentTabHasBothConflicts = isCategoryTab
    ? hasCategoryTag1 && hasCategoryTag2
    : hasLabelTag1 && hasLabelTag2;

  const currentTabHasAnyConflict = isCategoryTab
    ? hasCategoryTag1 || hasCategoryTag2
    : hasLabelTag1 || hasLabelTag2;

  // 1-Click quick remove handler
  const handleQuickRemove = (tagTarget: "tag1" | "tag2") => {
    const isTag1 = tagTarget === "tag1";
    const tagToRemove = isTag1 ? conflictRule.tag1 : conflictRule.tag2;
    const cleanToRemove = isTag1
      ? conflictRule.cleanTag1
      : conflictRule.cleanTag2;

    if (isCategoryTab || conflictRule.field === "categories") {
      const nextTags = removeTagFromList(
        categoriesTags,
        tagToRemove,
        cleanToRemove,
      );
      const nextText = removeTagFromText(
        categoriesText,
        tagToRemove,
        cleanToRemove,
      );
      setCategoriesTags(nextTags);
      setCategoriesText(nextText);
    }

    if (!isCategoryTab || conflictRule.field === "labels") {
      const nextTags = removeTagFromList(
        labelsTags,
        tagToRemove,
        cleanToRemove,
      );
      const nextText = removeTagFromText(
        labelsText,
        tagToRemove,
        cleanToRemove,
      );
      setLabelsTags(nextTags);
      setLabelsText(nextText);
    }
  };

  // Add tag handler
  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;

    if (isCategoryTab) {
      if (!categoriesTags.includes(trimmed)) {
        setCategoriesTags([...categoriesTags, trimmed]);
      }
      setCategoriesText(
        categoriesText ? `${categoriesText}, ${trimmed}` : trimmed,
      );
    } else {
      if (!labelsTags.includes(trimmed)) {
        setLabelsTags([...labelsTags, trimmed]);
      }
      setLabelsText(labelsText ? `${labelsText}, ${trimmed}` : trimmed);
    }
    setNewTagInput("");
  };

  // Delete individual chip
  const handleDeleteChip = (tagToDelete: string) => {
    const cleanToDelete = cleanTagName(tagToDelete);
    if (isCategoryTab) {
      setCategoriesTags(
        removeTagFromList(categoriesTags, tagToDelete, cleanToDelete),
      );
      setCategoriesText(
        removeTagFromText(categoriesText, tagToDelete, cleanToDelete),
      );
    } else {
      setLabelsTags(removeTagFromList(labelsTags, tagToDelete, cleanToDelete));
      setLabelsText(removeTagFromText(labelsText, tagToDelete, cleanToDelete));
    }
  };

  // Raw text change handler
  const handleRawTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isCategoryTab) {
      setCategoriesText(val);
      const splitTags = val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      setCategoriesTags(splitTags);
    } else {
      setLabelsText(val);
      const splitTags = val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      setLabelsTags(splitTags);
    }
  };

  const activeTags = isCategoryTab ? categoriesTags : labelsTags;
  const activeText = isCategoryTab ? categoriesText : labelsText;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        p: 2.5,
        backgroundColor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.paper, 0.7)
            : "#ffffff",
      }}
    >
      {/* Field Selector Tabs */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val: number) => setActiveTab(val)}
          sx={{
            minHeight: 40,
            "& .MuiTab-root": {
              minHeight: 40,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
            },
          }}
        >
          <Tab
            icon={<CategoryIcon fontSize="small" />}
            iconPosition="start"
            label={
              <Stack direction="row" alignItems="center" spacing={0.8}>
                <span>{t("logic_bomb.categories", "Categories")}</span>
                {conflictRule.field === "categories" && (
                  <Chip
                    size="small"
                    label="Conflict"
                    color="error"
                    sx={{ height: 18, fontSize: "0.65rem", fontWeight: 800 }}
                  />
                )}
              </Stack>
            }
          />
          <Tab
            icon={<LabelIcon fontSize="small" />}
            iconPosition="start"
            label={
              <Stack direction="row" alignItems="center" spacing={0.8}>
                <span>{t("logic_bomb.labels", "Labels")}</span>
                {conflictRule.field === "labels" && (
                  <Chip
                    size="small"
                    label="Conflict"
                    color="error"
                    sx={{ height: 18, fontSize: "0.65rem", fontWeight: 800 }}
                  />
                )}
              </Stack>
            }
          />
        </Tabs>

        <Stack direction="row" spacing={1} alignItems="center">
          {hasChanges && (
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<RestartAltIcon fontSize="small" />}
              onClick={onReset}
              sx={{ textTransform: "none", fontSize: "0.8rem" }}
            >
              {t("logic_bomb.reset_changes", "Reset Changes")}
            </Button>
          )}
          <Button
            size="small"
            variant="text"
            startIcon={<EditIcon fontSize="small" />}
            onClick={() => setShowRawText((prev) => !prev)}
            sx={{ textTransform: "none", fontSize: "0.8rem" }}
          >
            {showRawText
              ? t("logic_bomb.chip_view", "Chip View")
              : t("logic_bomb.raw_text_view", "Raw Text")}
          </Button>
        </Stack>
      </Stack>

      {/* Conflict Quick-Fix Banner */}
      {currentTabHasAnyConflict && (
        <Alert
          severity={currentTabHasBothConflicts ? "error" : "warning"}
          icon={<AutoFixHighIcon fontSize="inherit" />}
          sx={{
            borderRadius: 2,
            alignItems: "center",
            "& .MuiAlert-message": { width: "100%" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              gap: 1.5,
            }}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={800}>
                {currentTabHasBothConflicts
                  ? t(
                      "logic_bomb.conflict_active",
                      "Contradictory tags detected! Remove one to defuse the logic bomb:",
                    )
                  : t(
                      "logic_bomb.one_tag_present",
                      "One of the conflicting tags is present in this field:",
                    )}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {conflictRule.description}
              </Typography>
            </Box>

            {/* Quick-Fix Action Buttons */}
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {(isCategoryTab ? hasCategoryTag1 : hasLabelTag1) && (
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  startIcon={<DeleteOutlineIcon fontSize="small" />}
                  onClick={() => handleQuickRemove("tag1")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    boxShadow: "none",
                  }}
                >
                  {t("logic_bomb.remove_tag", "Remove '{{tag}}'", {
                    tag: conflictRule.cleanTag1,
                  })}
                </Button>
              )}

              {(isCategoryTab ? hasCategoryTag2 : hasLabelTag2) && (
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  startIcon={<DeleteOutlineIcon fontSize="small" />}
                  onClick={() => handleQuickRemove("tag2")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    boxShadow: "none",
                  }}
                >
                  {t("logic_bomb.remove_tag", "Remove '{{tag}}'", {
                    tag: conflictRule.cleanTag2,
                  })}
                </Button>
              )}
            </Stack>
          </Box>
        </Alert>
      )}

      {/* Editor Body */}
      {showRawText ? (
        <TextField
          fullWidth
          multiline
          minRows={3}
          label={
            isCategoryTab
              ? t("logic_bomb.categories_comma", "Categories (comma-separated)")
              : t("logic_bomb.labels_comma", "Labels (comma-separated)")
          }
          value={activeText}
          onChange={handleRawTextChange}
          helperText={t(
            "logic_bomb.raw_text_helper",
            "Edit directly as comma-separated tags or names. E.g. 'sweet snacks, biscuits'",
          )}
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* Add tag input */}
          <TextField
            size="small"
            placeholder={
              isCategoryTab
                ? t("logic_bomb.add_category", "Add a category...")
                : t("logic_bomb.add_label", "Add a label...")
            }
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleAddTag}
                      disabled={!newTagInput.trim()}
                      startIcon={<AddCircleOutlineIcon />}
                      sx={{ textTransform: "none", py: 0.2 }}
                    >
                      {t("logic_bomb.add", "Add")}
                    </Button>
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Chips list */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              p: 1.5,
              borderRadius: 2,
              minHeight: 80,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.background.default, 0.6)
                  : alpha(theme.palette.grey[50], 0.9),
              border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            }}
          >
            {activeTags.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic", m: "auto" }}
              >
                {t(
                  "logic_bomb.no_tags",
                  "No tags in this field. You can add one using the input above.",
                )}
              </Typography>
            ) : (
              activeTags.map((tag) => {
                const isConflict1 = matchesTag(
                  tag,
                  conflictRule.tag1,
                  conflictRule.cleanTag1,
                );
                const isConflict2 = matchesTag(
                  tag,
                  conflictRule.tag2,
                  conflictRule.cleanTag2,
                );
                const isConflicting = isConflict1 || isConflict2;

                return (
                  <Tooltip
                    key={tag}
                    title={
                      isConflicting
                        ? t(
                            "logic_bomb.conflicting_tag_tooltip",
                            "⚠️ Conflicting tag causing the logic bomb error",
                          )
                        : tag
                    }
                  >
                    <Chip
                      label={cleanTagName(tag)}
                      onDelete={() => handleDeleteChip(tag)}
                      color={isConflicting ? "error" : "default"}
                      variant={isConflicting ? "filled" : "outlined"}
                      sx={{
                        fontWeight: isConflicting ? 800 : 500,
                        fontSize: "0.85rem",
                        animation: isConflicting ? "pulse 2s infinite" : "none",
                        boxShadow: isConflicting ? theme.shadows[2] : "none",
                      }}
                    />
                  </Tooltip>
                );
              })
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};
export default TagEditor;
