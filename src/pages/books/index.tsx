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
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import BooksGameHeader from "./BooksGameHeader";
import BookDisplay from "./BookDisplay";
import BookHistory from "./BookHistory";
import { useBooksGameBuffer } from "./useBooksGameBuffer";
import type { PrefixFilter } from "./types";

type SearchParamsSetter = (
  update: (previous: URLSearchParams) => URLSearchParams,
) => void;

const useTypedSearchParams = useSearchParams as unknown as () => [
  URLSearchParams,
  SearchParamsSetter,
];

export default function BooksPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useTypedSearchParams();

  const initialPrefix = (searchParams.get("prefix") as PrefixFilter) || "all";
  const initialCode = searchParams.get("code") || undefined;

  const {
    currentProduct,
    isLoading,
    isSubmitting,
    error,
    sessionCount,
    history,
    prefix,
    codeSearch,
    changePrefix,
    searchBarcode,
    moveCurrentBook,
    markNotABook,
    skipBook,
    retry,
  } = useBooksGameBuffer(initialPrefix, initialCode);

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Sync prefix and code in URL search params
  const handlePrefixChange = (newPrefix: PrefixFilter) => {
    changePrefix(newPrefix);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newPrefix === "all") {
        next.delete("prefix");
      } else {
        next.set("prefix", newPrefix);
      }
      next.delete("code");
      return next;
    });
  };

  const handleSearchBarcode = (code: string) => {
    searchBarcode(code);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (code) {
        next.set("code", code);
      } else {
        next.delete("code");
      }
      return next;
    });
  };

  const handleMoveToOpf = () => {
    void (async () => {
      try {
        await moveCurrentBook();
        setToastMessage(
          t(
            "books.toast_moved_success",
            "Book moved to Open Products Facts! (Category added)",
          ),
        );
      } catch {
        setToastMessage(
          t(
            "books.toast_move_error",
            "Failed to update Open Food Facts category",
          ),
        );
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
        {/* Game Header */}
        <BooksGameHeader
          sessionCount={sessionCount}
          prefix={prefix}
          codeSearch={codeSearch}
          onPrefixChange={handlePrefixChange}
          onSearchBarcode={handleSearchBarcode}
        />

        {/* Error notification */}
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

        {/* Loading State */}
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
            <Typography variant="h6" fontWeight={700}>
              {t(
                "books.loading_books",
                "Loading books from Open Food Facts...",
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t(
                "books.loading_facet_desc",
                "Checking facets codes 978xxxxxxxxxx and 979xxxxxxxxxx",
              )}
            </Typography>
          </Paper>
        )}

        {/* Active Product Evaluation */}
        {!isLoading && currentProduct && (
          <BookDisplay
            key={currentProduct.code}
            product={currentProduct}
            isSubmitting={isSubmitting}
            onMoveToOpf={handleMoveToOpf}
            onNotABook={markNotABook}
            onSkip={skipBook}
          />
        )}

        {/* Finished / Empty Queue State */}
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
            <Stack spacing={2} alignItems="center" maxWidth={480} mx="auto">
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
                <MenuBookIcon sx={{ fontSize: 36 }} />
              </Box>

              <Typography variant="h5" fontWeight={800}>
                {t("books.no_products_left", "No more books in this batch!")}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {t(
                  "books.congrats_desc",
                  "You have completed reviewing all available products in this queue. You can reload or change prefix.",
                )}
              </Typography>

              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={retry}
                sx={{ mt: 1, fontWeight: 700 }}
              >
                {t("books.load_more", "Load more products")}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Recent Session History */}
        <BookHistory history={history} />

        {/* Feedback Snackbar */}
        <Snackbar
          open={Boolean(toastMessage)}
          autoHideDuration={2500}
          onClose={() => setToastMessage(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setToastMessage(null)}
            severity={toastMessage?.includes("Failed") ? "error" : "success"}
            variant="filled"
            sx={{ width: "100%", fontWeight: 700 }}
          >
            {toastMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
