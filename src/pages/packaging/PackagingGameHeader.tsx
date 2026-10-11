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
import KeyboardIcon from "@mui/icons-material/Keyboard";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import countryNames from "../../assets/countries.json";

type HeaderProps = {
  sessionCount: number;
  country: string;
  creator?: string;
  code?: string;
  onFilterChange: (params: {
    country?: string;
    creator?: string;
    code?: string;
  }) => void;
};

const POPULAR_COUNTRIES = [
  { id: "en:france", label: "France 🇫🇷" },
  { id: "en:spain", label: "Spain 🇪🇸" },
  { id: "en:germany", label: "Germany 🇩🇪" },
  { id: "en:italy", label: "Italy 🇮🇹" },
  { id: "en:united-kingdom", label: "United Kingdom 🇬🇧" },
  { id: "en:united-states", label: "United States 🇺🇸" },
  { id: "en:belgium", label: "Belgium 🇧🇪" },
  { id: "en:switzerland", label: "Switzerland 🇨🇭" },
  { id: "en:portugal", label: "Portugal 🇵🇹" },
];

export default function PackagingGameHeader({
  sessionCount,
  country,
  creator,
  code,
  onFilterChange,
}: HeaderProps) {
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const [filterAnchor, setFilterAnchor] = React.useState<HTMLElement | null>(
    null,
  );

  const [inputCode, setInputCode] = React.useState(code ?? "");
  const [inputCreator, setInputCreator] = React.useState(creator ?? "");
  const [selectedCountry, setSelectedCountry] = React.useState(
    country || "en:france",
  );

  const handleApplyFilter = () => {
    onFilterChange({
      country: selectedCountry,
      creator: inputCreator.trim() ? inputCreator.trim() : undefined,
      code: inputCode.trim() ? inputCode.trim() : undefined,
    });
    setFilterAnchor(null);
  };

  const handleResetFilter = () => {
    setInputCode("");
    setInputCreator("");
    setSelectedCountry("en:france");
    onFilterChange({
      country: "en:france",
      creator: undefined,
      code: undefined,
    });
    setFilterAnchor(null);
  };

  return (
    <Box
      sx={{
        py: 1.5,
        px: { xs: 1.5, md: 2.5 },
        mb: 2,
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
      >
        {/* Game Title & Branding */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <span>🥫</span>
            <span>Packaging Game</span>
          </Typography>
          <Chip
            size="small"
            label="Bulk & Easy"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, display: { xs: "none", sm: "inline-flex" } }}
          />
        </Stack>

        {/* Right stats and filter actions */}
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          {/* Session score badge */}
          <Chip
            icon={<EmojiEventsIcon sx={{ color: "#fbc02d !important" }} />}
            label={`${sessionCount} completed`}
            color="success"
            variant={sessionCount > 0 ? "filled" : "outlined"}
            sx={{ fontWeight: 700 }}
          />

          {/* Filter button */}
          <Button
            size="small"
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={(e) => setFilterAnchor(e.currentTarget)}
          >
            Filters
          </Button>

          {/* Keyboard Shortcuts button */}
          <IconButton
            size="small"
            title="Keyboard shortcuts"
            onClick={() => setShortcutsOpen(true)}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <KeyboardIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {/* Filter Popover */}
      <Popover
        open={Boolean(filterAnchor)}
        anchorEl={filterAnchor}
        onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { p: 2.5, width: 320, borderRadius: 2 } }}
      >
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          Product Filters
        </Typography>
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="country-select-label">Country</InputLabel>
            <Select
              labelId="country-select-label"
              value={selectedCountry}
              label="Country"
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              {POPULAR_COUNTRIES.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Specific Barcode"
            placeholder="e.g. 3256228586735"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "text.secondary" }}
                />
              ),
            }}
          />

          <TextField
            size="small"
            label="Creator Username"
            placeholder="e.g. scanbot"
            value={inputCreator}
            onChange={(e) => setInputCreator(e.target.value)}
          />

          <Stack
            direction="row"
            spacing={1}
            justifyContent="flex-end"
            sx={{ pt: 1 }}
          >
            <Button size="small" onClick={handleResetFilter}>
              Reset
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleApplyFilter}
            >
              Apply
            </Button>
          </Stack>
        </Stack>
      </Popover>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          ⚡ Keyboard Shortcuts
        </DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>
                  Enter / Cmd+Enter
                </TableCell>
                <TableCell>Save & Advance to next product</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Space / S</TableCell>
                <TableCell>Skip product</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>A</TableCell>
                <TableCell>Add new packaging component</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>1 .. 9</TableCell>
                <TableCell>Apply preset combo #1 .. #9</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShortcutsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
