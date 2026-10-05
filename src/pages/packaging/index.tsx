import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import { useSearchParams } from "react-router";

import PackagingGameHeader from "./PackagingGameHeader";
import ProductImagePanel from "./ProductImagePanel";
import SmartSuggestionsPanel from "./SmartSuggestionsPanel";
import PackagingComponentsList from "./PackagingComponentsList";
import { usePackagingGameBuffer } from "./usePackagingGameBuffer";
import { generateSmartPredictions } from "./packagingPredictor";
import { useOptions } from "../../hooks/useOptions";
import { getLang } from "../../localeStorageManager";
import { useCountry } from "../../contexts/CountryProvider";
import { getCountryId } from "../../utils/getCountryId";
import type {
  DetectedPackagingItem,
  EditablePackagingComponent,
  PresetCombo,
  ProductDescription,
} from "./types";

function toInitialComponents(
  product: ProductDescription,
): EditablePackagingComponent[] {
  if (product.packagings && product.packagings.length > 0) {
    return product.packagings.map((pkg, idx) => ({
      id: `initial-${idx}-${Date.now()}`,
      numberOfUnits: pkg.number_of_units ?? 1,
      shape: pkg.shape?.id ?? null,
      shapeName: pkg.shape?.id?.replace("en:", "") ?? undefined,
      material: pkg.material?.id ?? null,
      materialName: pkg.material?.id?.replace("en:", "") ?? undefined,
      recycling: pkg.recycling?.id ?? null,
      recyclingName: pkg.recycling?.id?.replace("en:", "") ?? undefined,
    }));
  }
  return [];
}

export default function PackagingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [country] = useCountry();
  const countryId = React.useMemo(
    () => getCountryId(country) || "en:france",
    [country],
  );

  const lang = getLang();
  const packagingMaterials = useOptions("packaging_materials", lang);
  const packagingShapes = useOptions("packaging_shapes", lang);
  const packagingRecycling = useOptions("packaging_recycling", lang);

  const initialCode = searchParams.get("code") || undefined;
  const initialCreator = searchParams.get("creator") || undefined;
  const initialCountry = searchParams.get("country") || countryId;

  const {
    currentProduct,
    isLoading,
    error,
    sessionCount,
    ocrText,
    isLoadingOcr,
    robotoffQuestions,
    params,
    updateParams,
    next,
    submitPackagings,
    retry,
  } = usePackagingGameBuffer({
    country: initialCountry,
    creator: initialCreator,
    code: initialCode,
  });

  const [components, setComponents] = React.useState<
    EditablePackagingComponent[]
  >([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // When product changes, initialize components
  React.useEffect(() => {
    if (currentProduct) {
      const init = toInitialComponents(currentProduct);
      setComponents(init);
    } else {
      setComponents([]);
    }
  }, [currentProduct]);

  // Compute smart predictions
  const smartPredictions = React.useMemo(() => {
    if (!currentProduct) return [];
    return generateSmartPredictions(currentProduct, ocrText);
  }, [currentProduct, ocrText]);

  // Auto-suggest if product had no existing packagings and predictions found
  React.useEffect(() => {
    if (
      currentProduct &&
      (!currentProduct.packagings || currentProduct.packagings.length === 0) &&
      components.length === 0 &&
      smartPredictions.length > 0
    ) {
      const generated = smartPredictions.map((pred, i) => ({
        id: `pred-auto-${i}-${Date.now()}`,
        numberOfUnits: pred.numberOfUnits ?? 1,
        shape: pred.shape?.id ?? null,
        shapeName: pred.shape?.name,
        material: pred.material?.id ?? null,
        materialName: pred.material?.name,
        recycling: pred.recycling?.id ?? null,
        recyclingName: pred.recycling?.name,
      }));
      setComponents(generated);
    }
  }, [currentProduct, smartPredictions]);

  // Handlers for packaging components
  const handleComponentChange = (
    index: number,
    updated: EditablePackagingComponent,
  ) => {
    setComponents((prev) => prev.map((c, i) => (i === index ? updated : c)));
  };

  const handleDeleteComponent = (index: number) => {
    setComponents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDuplicateComponent = (index: number) => {
    const target = components[index];
    if (!target) return;
    const duplicated: EditablePackagingComponent = {
      ...target,
      id: `comp-${Date.now()}-${Math.random()}`,
    };
    setComponents((prev) => [...prev, duplicated]);
  };

  const handleAddComponent = (
    customProps?: Partial<EditablePackagingComponent>,
  ) => {
    const newComponent: EditablePackagingComponent = {
      id: `comp-${Date.now()}-${Math.random()}`,
      numberOfUnits: 1,
      shape: null,
      material: null,
      recycling: null,
      ...customProps,
    };
    setComponents((prev) => [...prev, newComponent]);
  };

  const handleClearAll = () => {
    setComponents([]);
  };

  // Apply Preset Combo
  const handleApplyPreset = (combo: PresetCombo) => {
    const newUnits: EditablePackagingComponent[] = combo.components.map(
      (c, i) => ({
        id: `preset-${combo.id}-${i}-${Date.now()}`,
        numberOfUnits: c.numberOfUnits,
        shape: c.shape,
        shapeName: c.shapeName,
        material: c.material,
        materialName: c.materialName,
        recycling: c.recycling ?? null,
        recyclingName: c.recyclingName,
      }),
    );
    setComponents(newUnits);
    setToastMessage(`Applied preset: ${combo.title}`);
  };

  // Apply All Predictions
  const handleApplyPredictions = (items: DetectedPackagingItem[]) => {
    const newUnits: EditablePackagingComponent[] = items.map((item, i) => ({
      id: `pred-${i}-${Date.now()}`,
      numberOfUnits: item.numberOfUnits ?? 1,
      shape: item.shape?.id ?? null,
      shapeName: item.shape?.name,
      material: item.material?.id ?? null,
      materialName: item.material?.name,
      recycling: item.recycling?.id ?? null,
      recyclingName: item.recycling?.name,
    }));
    setComponents(newUnits);
    setToastMessage(`Applied ${items.length} smart predictions`);
  };

  // Add single prediction
  const handleAddSinglePrediction = (item: DetectedPackagingItem) => {
    handleAddComponent({
      numberOfUnits: item.numberOfUnits ?? 1,
      shape: item.shape?.id ?? null,
      shapeName: item.shape?.name,
      material: item.material?.id ?? null,
      materialName: item.material?.name,
      recycling: item.recycling?.id ?? null,
      recyclingName: item.recycling?.name,
    });
  };

  // Submit and advance
  const handleSubmit = async () => {
    if (!currentProduct || components.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitPackagings(components);
      setToastMessage("Packaging saved! 🎉");
    } catch {
      setToastMessage("Failed to save packaging. Please check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        void handleSubmit();
      } else if (e.key === " " || e.key === "s" || e.key === "S") {
        e.preventDefault();
        next();
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        handleAddComponent();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [components, currentProduct, isSubmitting, next]);

  // Update filters and URL search params
  const handleFilterChange = (newParams: {
    country?: string;
    creator?: string;
    code?: string;
  }) => {
    updateParams(newParams);
    const updatedSearchParams = new URLSearchParams();
    if (newParams.code) updatedSearchParams.set("code", newParams.code);
    if (newParams.country)
      updatedSearchParams.set("country", newParams.country);
    if (newParams.creator)
      updatedSearchParams.set("creator", newParams.creator);
    setSearchParams(updatedSearchParams);
  };

  return (
    <Box
      sx={{
        bgcolor: "action.hover",
        minHeight: "calc(100vh - 64px)",
        py: { xs: 2, md: 3 },
      }}
    >
      <Container maxWidth="xl">
        {/* Header Bar */}
        <PackagingGameHeader
          sessionCount={sessionCount}
          country={params.country || countryId}
          creator={params.creator}
          code={params.code}
          onFilterChange={handleFilterChange}
        />

        {/* Error State */}
        {error && (
          <Paper sx={{ p: 4, mb: 3, textAlign: "center", borderRadius: 3 }}>
            <Typography color="error" variant="h6" sx={{ mb: 1 }}>
              Unable to load products
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button variant="contained" onClick={retry}>
              Retry
            </Button>
          </Paper>
        )}

        {/* Loading State */}
        {isLoading && !currentProduct && (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ minHeight: "50vh" }}
          >
            <CircularProgress size={48} />
            <Typography variant="subtitle1" color="text.secondary">
              Hunting for products needing packaging...
            </Typography>
          </Stack>
        )}

        {/* Main Game Screen */}
        {currentProduct && (
          <Grid container spacing={{ xs: 2, lg: 3 }} alignItems="flex-start">
            {/* Left: Product Photos & OCR Inspection */}
            <Grid size={{ xs: 12, md: 5, lg: 5 }}>
              <ProductImagePanel
                product={currentProduct}
                ocrText={ocrText}
                isLoadingOcr={isLoadingOcr}
                onKeywordClick={(word) => {
                  setToastMessage(`Word selected: "${word}"`);
                }}
              />
            </Grid>

            {/* Right: Smart Suggestions & Packaging Component Editor */}
            <Grid size={{ xs: 12, md: 7, lg: 7 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  bgcolor: "background.paper",
                }}
              >
                {/* 1-Click Templates and Smart Propositions */}
                <SmartSuggestionsPanel
                  predictions={smartPredictions}
                  robotoffQuestions={robotoffQuestions}
                  onApplyPreset={handleApplyPreset}
                  onApplyPredictions={handleApplyPredictions}
                  onAddSinglePrediction={handleAddSinglePrediction}
                  onAddCustomUnit={handleAddComponent}
                />

                {/* Packaging Components Cards List */}
                <PackagingComponentsList
                  components={components}
                  packagingShapesOptions={packagingShapes}
                  packagingMaterialsOptions={packagingMaterials}
                  packagingRecyclingOptions={packagingRecycling}
                  isSubmitting={isSubmitting}
                  onComponentChange={handleComponentChange}
                  onDeleteComponent={handleDeleteComponent}
                  onDuplicateComponent={handleDuplicateComponent}
                  onAddComponent={() => handleAddComponent()}
                  onClearAll={handleClearAll}
                  onSkip={next}
                  onSubmit={handleSubmit}
                />
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Toast notifications */}
        <Snackbar
          open={Boolean(toastMessage)}
          autoHideDuration={2500}
          onClose={() => setToastMessage(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity="success"
            onClose={() => setToastMessage(null)}
            sx={{ width: "100%", borderRadius: 2 }}
          >
            {toastMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
