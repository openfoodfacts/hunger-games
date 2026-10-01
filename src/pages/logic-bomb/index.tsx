import * as React from "react";
import { useTranslation } from "react-i18next";
import { useTheme, alpha } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";

import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SaveIcon from "@mui/icons-material/Save";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import LoginIcon from "@mui/icons-material/Login";
import BoltIcon from "@mui/icons-material/Bolt";

import LoginContext from "../../contexts/login";
import { OFF_URL } from "../../const";
import offService from "../../off";
import type { ConflictRule, LogicBombProduct } from "./logicBombTypes";
import {
  INITIAL_CONFLICT_RULES,
  fetchMutuallyExclusiveRules,
  fetchConflictProducts,
  saveProductLogicFix,
} from "./logicBombService";
import PhotoGallery from "./PhotoGallery";
import TagEditor from "./TagEditor";
import ConflictSelector from "./ConflictSelector";

const LogicBombPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const userState = React.useContext(LoginContext);

  // Load rules using react-query
  const { data: loadedRules } = useQuery({
    queryKey: ["logic-bomb-rules"],
    queryFn: fetchMutuallyExclusiveRules,
    staleTime: 1000 * 60 * 15,
  });

  const rules: ConflictRule[] = loadedRules || INITIAL_CONFLICT_RULES;
  const [selectedRule, setSelectedRule] = React.useState<ConflictRule>(
    INITIAL_CONFLICT_RULES[0],
  );

  // Pagination & active index
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  // Score & streak
  const [defusedCount, setDefusedCount] = React.useState<number>(0);
  const [streak, setStreak] = React.useState<number>(0);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [savingFix, setSavingFix] = React.useState<boolean>(false);
  const [saveErrorMessage, setSaveErrorMessage] = React.useState<string | null>(
    null,
  );

  // Query products for the selected conflict rule and page
  const {
    data: productsData,
    isLoading: loadingProducts,
    isError: isProductsError,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["logic-bomb-products", selectedRule.tagId, currentPage],
    queryFn: () => fetchConflictProducts(selectedRule.tagId, currentPage, 20),
    staleTime: 1000 * 60 * 5,
  });

  const products: LogicBombProduct[] = productsData?.products || [];
  const currentProduct: LogicBombProduct | null =
    products[currentIndex] || null;

  // Active product editable fields
  const [categoriesText, setCategoriesText] = React.useState<string>("");
  const [categoriesTags, setCategoriesTags] = React.useState<string[]>([]);
  const [labelsText, setLabelsText] = React.useState<string>("");
  const [labelsTags, setLabelsTags] = React.useState<string[]>([]);

  const [initialCategoriesText, setInitialCategoriesText] =
    React.useState<string>("");
  const [initialLabelsText, setInitialLabelsText] = React.useState<string>("");

  // Sync editor fields when current product changes (tracked by currentProductCode)
  const currentProductCode = currentProduct?.code || "";
  const [prevProductCode, setPrevProductCode] =
    React.useState<string>(currentProductCode);

  if (prevProductCode !== currentProductCode) {
    setPrevProductCode(currentProductCode);
    if (currentProduct) {
      const catText = currentProduct.categories || "";
      const catTags = currentProduct.categories_tags || [];
      const labText = currentProduct.labels || "";
      const labTags = currentProduct.labels_tags || [];

      setCategoriesText(catText);
      setCategoriesTags([...catTags]);
      setLabelsText(labText);
      setLabelsTags([...labTags]);

      setInitialCategoriesText(catText);
      setInitialLabelsText(labText);
    } else {
      setCategoriesText("");
      setCategoriesTags([]);
      setLabelsText("");
      setLabelsTags([]);
      setInitialCategoriesText("");
      setInitialLabelsText("");
    }
  }

  const hasChanges =
    categoriesText !== initialCategoriesText ||
    labelsText !== initialLabelsText ||
    categoriesTags.length !== (currentProduct?.categories_tags || []).length ||
    labelsTags.length !== (currentProduct?.labels_tags || []).length;

  const handleReset = () => {
    if (currentProduct) {
      setCategoriesText(initialCategoriesText);
      setCategoriesTags([...(currentProduct.categories_tags || [])]);
      setLabelsText(initialLabelsText);
      setLabelsTags([...(currentProduct.labels_tags || [])]);
    }
  };

  // Rule selection handlers
  const handleSelectRule = (rule: ConflictRule) => {
    setSelectedRule(rule);
    setCurrentPage(1);
    setCurrentIndex(0);
  };

  const handleRandomRule = () => {
    const remaining = rules.filter((r) => r.tagId !== selectedRule.tagId);
    if (remaining.length > 0) {
      const rand = remaining[Math.floor(Math.random() * remaining.length)];
      handleSelectRule(rand);
    }
  };

  // Move to next product
  const handleNextProduct = () => {
    if (currentIndex + 1 < products.length) {
      setCurrentIndex((prev) => prev + 1);
    } else if (
      productsData?.totalCount &&
      productsData.totalCount > currentPage * 20
    ) {
      setCurrentPage((prev) => prev + 1);
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Skip handler
  const handleSkip = () => {
    setStreak(0);
    handleNextProduct();
  };

  // Defuse & Save handler
  const handleDefuseAndSave = async () => {
    if (!currentProduct) return;

    if (!userState?.isLoggedIn) {
      setToastMessage(
        t(
          "logic_bomb.login_required",
          "Please log in to Open Food Facts to save changes!",
        ),
      );
      return;
    }

    setSavingFix(true);
    setSaveErrorMessage(null);

    const updates: { categories?: string; labels?: string } = {};

    if (
      categoriesText !== initialCategoriesText ||
      categoriesTags.length !== (currentProduct.categories_tags || []).length
    ) {
      updates.categories = categoriesText || categoriesTags.join(", ");
    }

    if (
      labelsText !== initialLabelsText ||
      labelsTags.length !== (currentProduct.labels_tags || []).length
    ) {
      updates.labels = labelsText || labelsTags.join(", ");
    }

    if (Object.keys(updates).length === 0) {
      updates.categories = categoriesText || categoriesTags.join(", ");
      updates.labels = labelsText || labelsTags.join(", ");
    }

    const res = await saveProductLogicFix(currentProduct.code, updates);
    setSavingFix(false);

    if (res.success) {
      setDefusedCount((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setToastMessage(
        t(
          "logic_bomb.defuse_success",
          "💣✂️ Logic Bomb defused! Changes saved to Open Food Facts.",
        ),
      );
      handleNextProduct();
    } else {
      setSaveErrorMessage(
        res.message ||
          t(
            "logic_bomb.save_failed",
            "Failed to save changes. Please try again.",
          ),
      );
    }
  };

  const productOffUrl = currentProduct
    ? offService.getProductUrl(currentProduct.code)
    : "";
  const productEditUrl = currentProduct
    ? offService.getProductEditUrl(currentProduct.code)
    : "";

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={2.5}>
        {/* Page Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #1e1e1e 0%, #2a221e 100%)"
                : "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            {/* Title & Concept explanation */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
                <Typography variant="h4" component="h1" fontWeight={900}>
                  Logic Bomb 💣
                </Typography>
                <Chip
                  color="warning"
                  label={t("logic_bomb.data_quality_game", "Data Quality")}
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
              </Stack>
              <Typography variant="body1" color="text.secondary" maxWidth={750}>
                {t(
                  "logic_bomb.header_description",
                  "Resolve contradictory product metadata. Fix mutually exclusive categories and labels using the packaging photo gallery for evidence!",
                )}
              </Typography>
            </Box>

            {/* Score & Streak Badges */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Tooltip
                title={t(
                  "logic_bomb.defused_tooltip",
                  "Total bombs defused this session",
                )}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#121212" : "#ffffff",
                  }}
                >
                  <CheckCircleOutlineIcon color="success" />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", lineHeight: 1 }}
                    >
                      {t("logic_bomb.defused", "Defused")}
                    </Typography>
                    <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
                      {defusedCount}
                    </Typography>
                  </Box>
                </Paper>
              </Tooltip>

              <Tooltip
                title={t("logic_bomb.streak_tooltip", "Current defusal streak")}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#121212" : "#ffffff",
                  }}
                >
                  <LocalFireDepartmentIcon color="error" />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", lineHeight: 1 }}
                    >
                      {t("logic_bomb.streak", "Streak")}
                    </Typography>
                    <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
                      {streak}
                    </Typography>
                  </Box>
                </Paper>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Login notice banner if not signed in */}
          {!userState?.isLoggedIn && (
            <Alert
              severity="info"
              icon={<LoginIcon />}
              sx={{ mt: 2, borderRadius: 2 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  component="a"
                  href={`${OFF_URL}/cgi/session.pl`}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ fontWeight: 700 }}
                >
                  {t("logic_bomb.login_btn", "Log In to OFF")}
                </Button>
              }
            >
              {t(
                "logic_bomb.preview_mode_notice",
                "You are playing in preview mode. Log in with your Open Food Facts account to submit your fixes directly to the database.",
              )}
            </Alert>
          )}
        </Paper>

        {/* Facet Filter & Selector Bar */}
        <ConflictSelector
          rules={rules}
          selectedRule={selectedRule}
          onSelectRule={handleSelectRule}
          onRandomRule={handleRandomRule}
        />

        {/* Main Content Area */}
        {loadingProducts ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 12,
              gap: 2,
            }}
          >
            <CircularProgress size={44} />
            <Typography variant="body1" color="text.secondary">
              {t(
                "logic_bomb.loading_products",
                "Scanning products for contradictory tags...",
              )}
            </Typography>
          </Box>
        ) : isProductsError && products.length === 0 ? (
          <Alert
            severity="warning"
            sx={{ p: 3, borderRadius: 2 }}
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  color="inherit"
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    void refetchProducts();
                  }}
                >
                  {t("logic_bomb.retry", "Retry")}
                </Button>
                <Button
                  color="primary"
                  size="small"
                  variant="contained"
                  onClick={handleRandomRule}
                >
                  {t("logic_bomb.try_another_conflict", "Try Another Conflict")}
                </Button>
              </Stack>
            }
          >
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {productsError instanceof Error
                ? productsError.message
                : t(
                    "logic_bomb.error_fetch",
                    "Failed to fetch products for this conflict.",
                  )}
            </Typography>
            <Typography variant="body2">
              {t(
                "logic_bomb.error_hint",
                "You can also check other conflict types from the dropdown above.",
              )}
            </Typography>
          </Alert>
        ) : !currentProduct || currentIndex >= products.length ? (
          /* Finished all products in this conflict queue */
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <DoneAllIcon sx={{ fontSize: 64, color: "success.main" }} />
            <Typography variant="h5" fontWeight={800}>
              {t(
                "logic_bomb.queue_empty_title",
                "No more products with this conflict! 🎉",
              )}
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={600}>
              {t(
                "logic_bomb.queue_empty_desc",
                "All loaded products for this mutually exclusive tag have been checked or defused. Great job improving Open Food Facts data quality!",
              )}
            </Typography>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={handleRandomRule}
              sx={{ mt: 1, textTransform: "none", fontWeight: 700 }}
            >
              {t("logic_bomb.next_conflict", "Defuse Another Conflict 🚀")}
            </Button>
          </Paper>
        ) : (
          /* Active Product Card & Editing Stage */
          <Stack spacing={2.5}>
            {/* Product Meta Header Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? theme.palette.background.paper
                    : "#ffffff",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={2}
              >
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={0.5}
                  >
                    <Chip
                      size="small"
                      label={`Product ${currentIndex + 1} of ${products.length}`}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 700 }}
                    />
                    <Chip
                      size="small"
                      label={currentProduct.code}
                      sx={{ fontFamily: "monospace", fontWeight: 600 }}
                    />
                    {currentProduct.brands && (
                      <Chip
                        size="small"
                        label={currentProduct.brands}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Stack>
                  <Typography variant="h5" fontWeight={800}>
                    {currentProduct.product_name ||
                      t("logic_bomb.unnamed_product", "Unnamed Product")}
                  </Typography>
                </Box>

                {/* External Links */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Tooltip
                    title={t(
                      "logic_bomb.view_on_off",
                      "View product on Open Food Facts",
                    )}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      component="a"
                      href={productOffUrl}
                      target="_blank"
                      rel="noreferrer"
                      endIcon={<OpenInNewIcon fontSize="small" />}
                      sx={{ textTransform: "none", fontSize: "0.8rem" }}
                    >
                      {t("logic_bomb.view_product", "View on OFF")}
                    </Button>
                  </Tooltip>
                  <Tooltip
                    title={t(
                      "logic_bomb.edit_on_off",
                      "Open full edit form on Open Food Facts",
                    )}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      component="a"
                      href={productEditUrl}
                      target="_blank"
                      rel="noreferrer"
                      endIcon={<EditNoteIcon fontSize="small" />}
                      sx={{ textTransform: "none", fontSize: "0.8rem" }}
                    >
                      {t("logic_bomb.full_editor", "OFF Editor")}
                    </Button>
                  </Tooltip>
                </Stack>
              </Stack>
            </Paper>

            {/* Error message banner if save fails */}
            {saveErrorMessage && (
              <Alert severity="error" onClose={() => setSaveErrorMessage(null)}>
                {saveErrorMessage}
              </Alert>
            )}

            {/* Stage: Left = Photo Gallery, Right = Tag Editor & Actions */}
            <Grid container spacing={2.5} alignItems="flex-start">
              {/* Left Column: Photo Gallery */}
              <Grid size={{ xs: 12, md: 6 }}>
                <PhotoGallery
                  key={currentProduct.code}
                  images={currentProduct.images}
                  barcode={currentProduct.code}
                  productName={currentProduct.product_name}
                />
              </Grid>

              {/* Right Column: Conflict & Tag Editor */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2}>
                  {/* Conflict Reminder Pill */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.error.main, 0.4)}`,
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.error.dark, 0.15)
                          : "#fef2f2",
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <BoltIcon color="error" fontSize="large" />
                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight={800}
                          color="error.main"
                        >
                          {selectedRule.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedRule.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  {/* Interactive Tag Editor for Categories & Labels */}
                  <TagEditor
                    key={currentProduct.code}
                    conflictRule={selectedRule}
                    initialCategories={initialCategoriesText}
                    initialCategoriesTags={currentProduct.categories_tags || []}
                    initialLabels={initialLabelsText}
                    initialLabelsTags={currentProduct.labels_tags || []}
                    categoriesText={categoriesText}
                    setCategoriesText={setCategoriesText}
                    categoriesTags={categoriesTags}
                    setCategoriesTags={setCategoriesTags}
                    labelsText={labelsText}
                    setLabelsText={setLabelsText}
                    labelsTags={labelsTags}
                    setLabelsTags={setLabelsTags}
                    onReset={handleReset}
                    hasChanges={hasChanges}
                  />

                  {/* Action Controls */}
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="flex-end"
                    alignItems="center"
                    pt={1}
                  >
                    <Button
                      size="large"
                      variant="outlined"
                      color="inherit"
                      startIcon={<SkipNextIcon />}
                      onClick={handleSkip}
                      disabled={savingFix}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      {t("logic_bomb.skip", "Skip")}
                    </Button>

                    <Button
                      size="large"
                      variant="contained"
                      color="success"
                      startIcon={
                        savingFix ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SaveIcon />
                        )
                      }
                      onClick={() => {
                        void handleDefuseAndSave();
                      }}
                      disabled={savingFix}
                      sx={{
                        textTransform: "none",
                        fontWeight: 800,
                        px: 3,
                        boxShadow: theme.shadows[3],
                      }}
                    >
                      {savingFix
                        ? t("logic_bomb.saving", "Defusing...")
                        : t("logic_bomb.defuse_and_save", "Defuse Bomb & Save")}
                    </Button>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        )}
      </Stack>

      {/* Success / Info Toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Container>
  );
};

export default LogicBombPage;
