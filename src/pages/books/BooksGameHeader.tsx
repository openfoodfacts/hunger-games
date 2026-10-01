import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useTranslation } from "react-i18next";
import type { PrefixFilter } from "./types";

interface BooksGameHeaderProps {
  sessionCount: number;
  prefix: PrefixFilter;
  codeSearch: string;
  onPrefixChange: (prefix: PrefixFilter) => void;
  onSearchBarcode: (code: string) => void;
}

export default function BooksGameHeader({
  sessionCount,
  prefix,
  codeSearch,
  onPrefixChange,
  onSearchBarcode,
}: BooksGameHeaderProps) {
  const { t } = useTranslation();
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState(codeSearch);
  const [prevCodeSearch, setPrevCodeSearch] = React.useState(codeSearch);
  if (codeSearch !== prevCodeSearch) {
    setPrevCodeSearch(codeSearch);
    setSearchInput(codeSearch);
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchBarcode(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    onSearchBarcode("");
  };

  return (
    <Box
      sx={{
        py: 2,
        px: { xs: 2, md: 3 },
        mb: 2.5,
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        {/* Title and game info */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <MenuBookIcon />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="h6" fontWeight={800} component="h1">
                {t("books.title", "Move Books to Open Products Facts")}
              </Typography>
              <Chip
                label="Open Products Facts"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: "0.75rem" }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {t(
                "books.subtitle",
                "Find books wrongly cataloged in Open Food Facts and migrate them using barcode prefixes 978 & 979",
              )}
            </Typography>
          </Box>
        </Stack>

        {/* Score & Controls */}
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {/* Session score chip */}
          <Chip
            icon={<EmojiEventsIcon sx={{ color: "#f59e0b !important" }} />}
            label={`${sessionCount} ${t("books.books_moved_session", "books moved")}`}
            color="success"
            variant="filled"
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              px: 0.5,
            }}
          />

          {/* Keyboard shortcuts helper button */}
          <Tooltip title={t("books.shortcuts_title", "Keyboard Shortcuts")}>
            <IconButton
              size="small"
              onClick={() => setShortcutsOpen(true)}
              sx={{ border: "1px solid", borderColor: "divider" }}
              aria-label="Keyboard Shortcuts"
            >
              <KeyboardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Filter and Barcode Search Bar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}
      >
        {/* Prefix Filter Toggle */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            {t("books.filter_prefix", "PREFIX")}:
          </Typography>
          <ToggleButtonGroup
            value={prefix}
            exclusive
            size="small"
            onChange={(_, val: PrefixFilter | null) => {
              if (val) onPrefixChange(val);
            }}
          >
            <ToggleButton value="all" sx={{ px: 1.5, py: 0.5, fontWeight: 700 }}>
              {t("books.prefix_all", "All (978 & 979)")}
            </ToggleButton>
            <ToggleButton value="978" sx={{ px: 1.5, py: 0.5, fontWeight: 700 }}>
              978
            </ToggleButton>
            <ToggleButton value="979" sx={{ px: 1.5, py: 0.5, fontWeight: 700 }}>
              979
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* Barcode Search Box */}
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <TextField
            size="small"
            placeholder={t("books.custom_barcode", "Lookup barcode (e.g. 978...)")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch} edge="end">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
            sx={{ minWidth: 260 }}
          />
          <Button variant="outlined" size="small" type="submit" sx={{ minHeight: 40 }}>
            {t("search", "Search")}
          </Button>
        </Box>
      </Stack>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t("books.shortcuts_title", "Keyboard Shortcuts")}
        </DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>
                  <Chip label="Y" size="small" color="success" /> /{" "}
                  <Chip label="Enter" size="small" color="success" /> /{" "}
                  <Chip label="1" size="small" color="success" />
                </TableCell>
                <TableCell>
                  {t("books.yes_book", "Yes, it's a book (Move to OPF)")}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>
                  <Chip label="N" size="small" color="error" /> /{" "}
                  <Chip label="0" size="small" color="error" />
                </TableCell>
                <TableCell>
                  {t("books.no_book", "No, not a book (Keep in OFF)")}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>
                  <Chip label="S" size="small" /> /{" "}
                  <Chip label="Space" size="small" />
                </TableCell>
                <TableCell>{t("books.skip", "Skip / Not sure")}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShortcutsOpen(false)}>
            {t("close", "Close")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
