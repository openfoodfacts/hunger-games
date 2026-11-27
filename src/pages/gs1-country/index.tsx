import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import PublicIcon from "@mui/icons-material/Public";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import Gs1GameHeader from "./Gs1GameHeader";
import Gs1ProductDisplay from "./Gs1ProductDisplay";
import Gs1History from "./Gs1History";
import { useGs1GameBuffer } from "./useGs1GameBuffer";
import { DEFAULT_GS1_PREFIX, getFacetCodePattern } from "./gs1Prefixes";
import type { CountryFilterMode } from "./types";

type SearchParamsSetter = (
  update: (previous: URLSearchParams) => URLSearchParams,
) => void;

const useTypedSearchParams = useSearchParams as unknown as () => [
  URLSearchParams,
  SearchParamsSetter,
];

function parseCountryFilter(value: string | null): CountryFilterMode {
  if (value === "other_only" || value === "none") {
    return value;
  }
  return "all";
}

export default function Gs1CountryPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useTypedSearchParams();

  const prefix = searchParams.get("prefix") || DEFAULT_GS1_PREFIX;
  const countryFilter = parseCountryFilter(searchParams.get("filter"));
  const codeSearch = searchParams.get("code") || "";

  const {
    country,
    currentProduct,
    isLoading,
    isSubmitting,
    error,
    sessionCount,
    history,
    confirmSoldInCountry,
    rejectSoldInCountry,
    skipProduct,
    retry,
  } = useGs1GameBuffer(prefix, countryFilter, codeSearch);

  const [toast, setToast] = React.useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const handlePrefixChange = (newPrefix: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newPrefix === DEFAULT_GS1_PREFIX) {
        next.delete("prefix");
      } else {
        next.set("prefix", newPrefix);
      }
      next.delete("code");
      return next;
    });
  };

  const handleCountryFilterChange = (newFilter: CountryFilterMode) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newFilter === "all") {
        next.delete("filter");
      } else {
        next.set("filter", newFilter);
      }
      next.delete("code");
      return next;
    });
  };

  const handleSearchBarcode = (code: string) => {
    const trimmed = code.trim();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (trimmed) {
        next.set("code", trimmed);
      } else {
        next.delete("code");
      }
      return next;
    });
  };

  const handleConfirmSoldInCountry = () => {
    void (async () => {
      try {
        await confirmSoldInCountry();
        setToast({
          message: t(
            "gs1_country.toast_added_success",
            "Added {{country}} to product!",
            { country: country.name },
          ),
          severity: "success",
        });
      } catch {
        setToast({
          message: t(
            "gs1_country.toast_added_error",
            "Failed to update product country on Open Food Facts",
          ),
          severity: "error",
        });
      }
    })();
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
        <Gs1GameHeader
          country={country}
          sessionCount={sessionCount}
          countryFilter={countryFilter}
          codeSearch={codeSearch}
          onPrefixChange={handlePrefixChange}
          onCountryFilterChange={handleCountryFilterChange}
          onSearchBarcode={handleSearchBarcode}
        />

        {error && (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={retry}>
                {t("retry", "Retry")}
              </Button>
            }
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}

        {isLoading && !currentProduct && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: 3,
              textAlign: "center",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t(
                "gs1_country.loading_products",
                "Loading products from Open Food Facts...",
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t(
                "gs1_country.loading_facet_desc",
                "Checking facet codes {{pattern}} without {{country}}",
                {
                  pattern: getFacetCodePattern(country.prefix),
                  country: country.name,
                },
              )}
            </Typography>
          </Paper>
        )}

        {currentProduct && (
          <Gs1ProductDisplay
            key={currentProduct.code}
            product={currentProduct}
            country={country}
            isSubmitting={isSubmitting}
            onConfirmSoldInCountry={handleConfirmSoldInCountry}
            onRejectSoldInCountry={rejectSoldInCountry}
            onSkip={skipProduct}
          />
        )}

        {!isLoading && !currentProduct && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 3,
              textAlign: "center",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Stack
              spacing={2}
              sx={{ alignItems: "center", maxWidth: 480, mx: "auto" }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  bgcolor: "success.light",
                  color: "success.contrastText",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <PublicIcon sx={{ fontSize: 36 }} />
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {t(
                  "gs1_country.no_products_left",
                  "No more products in this batch!",
                )}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {t(
                  "gs1_country.congrats_desc",
                  "You have reviewed all available products in this queue. Try reloading, switching the filter, or picking another GS1 prefix.",
                )}
              </Typography>

              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={retry}
                sx={{ mt: 1, fontWeight: 700 }}
              >
                {t("gs1_country.load_more", "Load more products")}
              </Button>
            </Stack>
          </Paper>
        )}

        <Gs1History history={history} />

        <Snackbar
          open={Boolean(toast)}
          autoHideDuration={2500}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          {toast ? (
            <Alert
              onClose={() => setToast(null)}
              severity={toast.severity}
              variant="filled"
              sx={{ width: "100%", fontWeight: 700 }}
            >
              {toast.message}
            </Alert>
          ) : undefined}
        </Snackbar>
      </Container>
    </Box>
  );
}
