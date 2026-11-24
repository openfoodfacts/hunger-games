import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
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
import PublicIcon from "@mui/icons-material/Public";
import { useTranslation } from "react-i18next";
import { GS1_COUNTRIES } from "./gs1Prefixes";
import type { Gs1CountryConfig, VpnFilterMode } from "./types";

interface Gs1GameHeaderProps {
  country: Gs1CountryConfig;
  sessionCount: number;
  vpnFilter: VpnFilterMode;
  codeSearch: string;
  onPrefixChange: (prefix: string) => void;
  onVpnFilterChange: (filter: VpnFilterMode) => void;
  onSearchBarcode: (code: string) => void;
}

export default function Gs1GameHeader({
  country,
  sessionCount,
  vpnFilter,
  codeSearch,
  onPrefixChange,
  onVpnFilterChange,
  onSearchBarcode,
}: Gs1GameHeaderProps) {
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
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
        }}
      >
        {/* Title and game info */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
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
            <PublicIcon />
          </Box>
          <Box>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", flexWrap: "wrap" }}
            >
              <Typography variant="h6" component="h1" sx={{ fontWeight: 800 }}>
                {t("gs1_country.title", "Passport Control")}
              </Typography>
              <Chip
                label={t("gs1_country.badge", "GS1 Passport")}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: "0.75rem" }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {t(
                "gs1_country.subtitle",
                "Stamp products with their true country of sale using their GS1 barcode prefix (fixing VPN mismatches like US instead of Croatia)",
              )}
            </Typography>
          </Box>
        </Stack>

        {/* Score & Shortcuts */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <Chip
            icon={<EmojiEventsIcon sx={{ color: "#f59e0b !important" }} />}
            label={`${sessionCount} ${t("gs1_country.countries_added_session", "countries added")}`}
            color="success"
            variant="filled"
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              px: 0.5,
            }}
          />

          <Tooltip
            title={t("gs1_country.shortcuts_title", "Keyboard Shortcuts")}
          >
            <IconButton
              size="small"
              onClick={() => setShortcutsOpen(true)}
              sx={{ border: "1px solid", borderColor: "divider" }}
              aria-label={t(
                "gs1_country.shortcuts_title",
                "Keyboard Shortcuts",
              )}
            >
              <KeyboardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Filter & Search Bar */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          mt: 2,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ alignItems: { xs: "stretch", sm: "center" }, flexWrap: "wrap" }}
        >
          <Autocomplete
            size="small"
            disableClearable
            options={GS1_COUNTRIES}
            value={country}
            onChange={(_, newValue) => {
              if (newValue) {
                onPrefixChange(newValue.prefix);
              }
            }}
            getOptionLabel={(opt) => `${opt.flag} ${opt.prefix} — ${opt.name}`}
            isOptionEqualToValue={(opt, val) => opt.prefix === val.prefix}
            sx={{ minWidth: { xs: "100%", sm: 260 } }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("gs1_country.prefix_label", "GS1 Prefix / Country")}
              />
            )}
          />

          <ToggleButtonGroup
            value={vpnFilter}
            exclusive
            size="small"
            onChange={(_, val: VpnFilterMode | null) => {
              if (val) onVpnFilterChange(val);
            }}
            aria-label={t("gs1_country.vpn_filter_label", "Country Filter")}
          >
            <ToggleButton
              value="all"
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              {t("gs1_country.filter_all", "All missing {{country}}", {
                country: country.name,
              })}
            </ToggleButton>
            <ToggleButton
              value="us_only"
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              🇺🇸 {t("gs1_country.filter_us", "US listed (VPN)")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* Barcode Search */}
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{ display: "flex", gap: 1 }}
        >
          <TextField
            size="small"
            placeholder={t("gs1_country.search_barcode", "Search barcode...")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ width: { xs: "100%", sm: 220 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      aria-label={t("clear", "Clear")}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
          <Button
            type="submit"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 700, textTransform: "none" }}
          >
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
          {t("gs1_country.shortcuts_title", "Keyboard Shortcuts")}
        </DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Y / Enter / 1</TableCell>
                <TableCell>
                  {t(
                    "gs1_country.yes_sold_button",
                    "Yes, sold in {{country}}",
                    { country: country.name },
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>N / 0</TableCell>
                <TableCell>
                  {t(
                    "gs1_country.no_sold_button",
                    "No, not sold in {{country}}",
                    { country: country.name },
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>S / Space</TableCell>
                <TableCell>{t("skip", "Skip")}</TableCell>
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
