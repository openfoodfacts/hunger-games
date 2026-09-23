import * as React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Skeleton from "@mui/material/Skeleton";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import ImageSearchRoundedIcon from "@mui/icons-material/ImageSearchRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Link as RouterLink } from "react-router";

import Loader from "../loader";
import { useCountry } from "../../contexts/CountryProvider";
import countryNames from "../../assets/countries.json";
import home_brandinator from "../../assets/home_brandinator.png";
import { BrandCard } from "./BrandCard";
import {
  PROJECTS,
  type ProjectId,
  type BrandItem,
  getInitialOFFBrands,
  fetchRobotoffBrandOpportunities,
  fetchProjectFacetsBrands,
  GITHUB_BRAND_IMAGES_UPLOAD_URL,
  TAXONOMY_EDITOR_START_URL,
} from "./brandinatorService";

const PAGE_SIZE = 36;

type SortOption = "opportunities" | "products" | "name_asc" | "name_desc";
type TaxonomyFilter = "all" | "taxonomized" | "untaxonomized";

export default function BrandinatorPage() {
  const { t } = useTranslation();
  const [country, setCountry] = useCountry();

  const [projectId, setProjectId] = React.useState<ProjectId>("openfoodfacts");
  const activeProject = PROJECTS[projectId];

  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [sortOption, setSortOption] =
    React.useState<SortOption>("opportunities");
  const [taxonomyFilter, setTaxonomyFilter] =
    React.useState<TaxonomyFilter>("all");
  const [onlyOpportunities, setOnlyOpportunities] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [displayCount, setDisplayCount] = React.useState(PAGE_SIZE);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
      setDisplayCount(PAGE_SIZE);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query Robotoff opportunities when on Open Food Facts
  const { data: opportunitiesMap } = useQuery({
    queryKey: ["brandinator-opportunities", country],
    queryFn: () => fetchRobotoffBrandOpportunities(country, 300),
    enabled: activeProject.hasRobotoff,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Query sister projects facets brands when not Open Food Facts
  const { data: sisterProjectBrands, isLoading: isSisterLoading } = useQuery({
    queryKey: ["brandinator-sister-brands", projectId],
    queryFn: () => fetchProjectFacetsBrands(activeProject),
    enabled: projectId !== "openfoodfacts",
    staleTime: 1000 * 60 * 30,
  });

  // Base brand list
  const baseBrands = React.useMemo<BrandItem[]>(() => {
    if (projectId === "openfoodfacts") {
      const initial = getInitialOFFBrands();
      if (!opportunitiesMap) return initial;

      // Update brand opportunities from Robotoff
      return initial.map((b) => {
        const slugNorm = b.slug.toLowerCase().replace(/[^a-z0-9]/g, "");
        const opp =
          opportunitiesMap[b.slug.toLowerCase()] ??
          opportunitiesMap[slugNorm] ??
          b.opportunities;
        return {
          ...b,
          opportunities: opp,
        };
      });
    }
    return sisterProjectBrands || [];
  }, [projectId, opportunitiesMap, sisterProjectBrands]);

  // Filter and sort brands
  const filteredBrands = React.useMemo(() => {
    let result = baseBrands;

    // Search filter
    if (debouncedSearch) {
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(debouncedSearch) ||
          b.slug.toLowerCase().includes(debouncedSearch),
      );
    }

    // Taxonomy filter
    if (taxonomyFilter === "taxonomized") {
      result = result.filter((b) => b.isTaxonomized);
    } else if (taxonomyFilter === "untaxonomized") {
      result = result.filter((b) => !b.isTaxonomized);
    }

    // Opportunity filter
    if (onlyOpportunities) {
      result = result.filter((b) => b.opportunities > 0);
    }

    // Sorting
    return [...result].sort((a, b) => {
      switch (sortOption) {
        case "opportunities":
          if (b.opportunities !== a.opportunities) {
            return b.opportunities - a.opportunities;
          }
          return b.products - a.products;
        case "products":
          if (b.products !== a.products) {
            return b.products - a.products;
          }
          return b.opportunities - a.opportunities;
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, [
    baseBrands,
    debouncedSearch,
    taxonomyFilter,
    onlyOpportunities,
    sortOption,
  ]);

  const displayedBrands = React.useMemo(() => {
    return filteredBrands.slice(0, displayCount);
  }, [filteredBrands, displayCount]);

  // Total opportunities in active project
  const totalOpportunities = React.useMemo(() => {
    return baseBrands.reduce((acc, b) => acc + (b.opportunities || 0), 0);
  }, [baseBrands]);

  const totalTaxonomized = React.useMemo(() => {
    return baseBrands.filter((b) => b.isTaxonomized).length;
  }, [baseBrands]);

  const handleProjectChange = (
    _event: React.SyntheticEvent,
    newValue: ProjectId,
  ) => {
    setProjectId(newValue);
    setDisplayCount(PAGE_SIZE);
  };

  return (
    <React.Suspense fallback={<Loader />}>
      <Box
        component="main"
        sx={(theme) => ({
          minHeight: "calc(100vh - 64px)",
          background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.action.hover} 100%)`,
          py: { xs: 3, sm: 5 },
        })}
      >
        <Container maxWidth="xl">
          {/* Header Banner */}
          <Paper
            elevation={0}
            sx={(theme) => ({
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.cafeCreme.main,
              color: theme.palette.cafeCreme.contrastText,
              mb: 4,
            })}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{
                justifyContent: "space-between",
                alignItems: { md: "center" },
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 2, sm: 3 }}
                sx={{ alignItems: { sm: "center" } }}
              >
                <Box
                  component="img"
                  src={home_brandinator}
                  alt="Brandinator"
                  sx={{
                    width: { xs: 140, sm: 160 },
                    height: "auto",
                    borderRadius: 2,
                    boxShadow: 2,
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      color: "primary.main",
                    }}
                  >
                    DASHBOARD & GAME
                  </Typography>
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "2rem", sm: "2.75rem" },
                      lineHeight: 1.1,
                    }}
                  >
                    Brandinator
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ maxWidth: 650, mt: 1, opacity: 0.9 }}
                  >
                    Explore taxonomized brands, ground truth product counts, and
                    opportunity questions. Help validate brand logos and
                    complete annotations across Open Food Facts and sister
                    projects!
                  </Typography>
                </Box>
              </Stack>

              {/* Stats Chips */}
              <Stack
                direction="row"
                spacing={2}
                sx={{ flexWrap: "wrap", gap: 1 }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    textAlign: "center",
                    minWidth: 120,
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {baseBrands.length.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Brands
                  </Typography>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    textAlign: "center",
                    minWidth: 120,
                  }}
                >
                  <Typography
                    variant="h5"
                    color="primary"
                    sx={{ fontWeight: 800 }}
                  >
                    {totalOpportunities.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Opportunities
                  </Typography>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    textAlign: "center",
                    minWidth: 120,
                  }}
                >
                  <Typography
                    variant="h5"
                    color="success.main"
                    sx={{ fontWeight: 800 }}
                  >
                    {totalTaxonomized.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Taxonomized
                  </Typography>
                </Paper>
              </Stack>
            </Stack>

            {/* Project Tabs (Open Food Facts, Open Beauty Facts, Open Pet Food Facts, Open Products Facts) */}
            <Box sx={{ mt: 3, borderTop: 1, borderColor: "divider", pt: 1 }}>
              <Tabs
                value={projectId}
                onChange={handleProjectChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  "& .MuiTab-root": {
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "0.95rem",
                  },
                }}
              >
                {Object.values(PROJECTS).map((proj) => (
                  <Tab
                    key={proj.id}
                    value={proj.id}
                    label={
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "center" }}
                      >
                        <span>{proj.name}</span>
                        {proj.id === projectId && isSisterLoading && (
                          <CircularProgress size={14} color="inherit" />
                        )}
                      </Stack>
                    }
                  />
                ))}
              </Tabs>
            </Box>
          </Paper>

          {/* Controls Bar: Search, Country, Filters, Sort, View Mode */}
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 3,
              mb: 4,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ alignItems: "center" }}
            >
              {/* Search Field */}
              <TextField
                placeholder="Search brands by name or tag..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1, width: { xs: "100%", md: "auto" } }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          aria-label="clear search"
                          onClick={() => setSearchTerm("")}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  },
                }}
              />

              {/* Country Selector (for Open Food Facts) */}
              {activeProject.hasRobotoff && (
                <TextField
                  select
                  size="small"
                  label={t("green-score.countryLabel")}
                  value={country}
                  onChange={(e) => setCountry(e.target.value, "global")}
                  sx={{ width: { xs: "100%", sm: 220 }, flexShrink: 0 }}
                >
                  <MenuItem value="world">Global (All Countries)</MenuItem>
                  {countryNames.map((c) => (
                    <MenuItem key={c.countryCode} value={c.countryCode}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              {/* Sort Selector */}
              <TextField
                select
                size="small"
                label="Sort By"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                sx={{ width: { xs: "100%", sm: 220 }, flexShrink: 0 }}
              >
                <MenuItem value="opportunities">Most Opportunities</MenuItem>
                <MenuItem value="products">Most Products</MenuItem>
                <MenuItem value="name_asc">Name (A → Z)</MenuItem>
                <MenuItem value="name_desc">Name (Z → A)</MenuItem>
              </TextField>

              {/* View Mode Toggle */}
              <ToggleButtonGroup
                size="small"
                value={viewMode}
                exclusive
                onChange={(_e, mode: "grid" | "list" | null) => {
                  if (mode) setViewMode(mode);
                }}
                sx={{
                  flexShrink: 0,
                  alignSelf: { xs: "flex-end", md: "center" },
                }}
              >
                <ToggleButton value="grid" aria-label="grid view">
                  <GridViewRoundedIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  <ViewListRoundedIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {/* Filter Chips & Toggles */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                pt: 1,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", gap: 1 }}
              >
                <Chip
                  label="All Brands"
                  variant={taxonomyFilter === "all" ? "filled" : "outlined"}
                  color={taxonomyFilter === "all" ? "primary" : "default"}
                  onClick={() => setTaxonomyFilter("all")}
                />
                <Chip
                  label="Taxonomized Only"
                  variant={
                    taxonomyFilter === "taxonomized" ? "filled" : "outlined"
                  }
                  color={
                    taxonomyFilter === "taxonomized" ? "success" : "default"
                  }
                  onClick={() => setTaxonomyFilter("taxonomized")}
                />
                <Chip
                  label="Untaxonomized Only"
                  variant={
                    taxonomyFilter === "untaxonomized" ? "filled" : "outlined"
                  }
                  color={
                    taxonomyFilter === "untaxonomized" ? "warning" : "default"
                  }
                  onClick={() => setTaxonomyFilter("untaxonomized")}
                />
              </Stack>

              {activeProject.hasRobotoff && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={onlyOpportunities}
                      onChange={(e) => setOnlyOpportunities(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Only with opportunities (&gt; 0)
                    </Typography>
                  }
                />
              )}
            </Stack>
          </Paper>

          {/* Results Summary */}
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing{" "}
              <strong>
                {Math.min(
                  displayedBrands.length,
                  filteredBrands.length,
                ).toLocaleString()}
              </strong>{" "}
              of <strong>{filteredBrands.length.toLocaleString()}</strong>{" "}
              brands
              {debouncedSearch && ` matching "${debouncedSearch}"`}
            </Typography>
          </Stack>

          {/* Content Loading State for Sister Projects */}
          {isSisterLoading && projectId !== "openfoodfacts" ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                  lg: "repeat(4, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {Array.from({ length: 12 }, (_, i) => i).map((i) => (
                <Paper
                  key={i}
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: 3 }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: "center", mb: 2 }}
                  >
                    <Skeleton variant="rounded" width={48} height={48} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width="70%" height={24} />
                      <Skeleton width="40%" height={16} />
                    </Box>
                  </Stack>
                  <Skeleton width="50%" height={24} sx={{ mb: 2 }} />
                  <Skeleton variant="rounded" width="100%" height={36} />
                </Paper>
              ))}
            </Box>
          ) : filteredBrands.length === 0 ? (
            /* Empty State */
            <Paper
              variant="outlined"
              sx={{ p: 6, textAlign: "center", borderRadius: 3, my: 4 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                No brands found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search query, country, or taxonomy filter.
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => {
                  setSearchTerm("");
                  setTaxonomyFilter("all");
                  setOnlyOpportunities(false);
                }}
              >
                Reset Filters
              </Button>
            </Paper>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                  lg: "repeat(4, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {displayedBrands.map((brand) => (
                <BrandCard
                  key={`${brand.slug}-${brand.name}`}
                  brand={brand}
                  project={activeProject}
                  highlightSearch={debouncedSearch}
                />
              ))}
            </Box>
          ) : (
            /* List / Table View */
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 3 }}
            >
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Brand</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Opportunities
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Products</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Taxonomy</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedBrands.map((brand) => {
                    const questionsUrl = `/questions?type=brand&value_tag=${encodeURIComponent(
                      brand.slug,
                    )}&sorted=true`;
                    const logoSearchUrl = `/logos/search?type=brand&value=${encodeURIComponent(
                      brand.name,
                    )}`;
                    const externalCatalogUrl = `${activeProject.worldUrl}/brand/${encodeURIComponent(
                      brand.slug,
                    )}`;

                    return (
                      <TableRow key={`${brand.slug}-${brand.name}`} hover>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{ alignItems: "center" }}
                          >
                            {brand.imageUrl ? (
                              <Box
                                component="img"
                                src={brand.imageUrl}
                                alt={brand.name}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  objectFit: "contain",
                                  borderRadius: 1,
                                  p: 0.25,
                                  bgcolor: "#fff",
                                  border: "1px solid",
                                  borderColor: "divider",
                                }}
                              />
                            ) : (
                              <Tooltip title="No logo available - Click to add logo on GitHub">
                                <Box
                                  component="a"
                                  href={GITHUB_BRAND_IMAGES_UPLOAD_URL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    textDecoration: "none",
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1,
                                    bgcolor: "primary.main",
                                    color: "primary.contrastText",
                                    display: "grid",
                                    placeItems: "center",
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                    transition: "opacity 0.2s",
                                    "&:hover": {
                                      opacity: 0.8,
                                    },
                                  }}
                                >
                                  {brand.name.charAt(0).toUpperCase()}
                                </Box>
                              </Tooltip>
                            )}
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700 }}
                              >
                                {brand.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontFamily: "monospace" }}
                              >
                                {brand.slug}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          {brand.opportunities > 0 ? (
                            <Chip
                              label={brand.opportunities.toLocaleString()}
                              color="primary"
                              size="small"
                              sx={{ fontWeight: 700 }}
                              component={RouterLink as React.ElementType}
                              to={questionsUrl}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              0
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {brand.products > 0
                              ? brand.products.toLocaleString()
                              : "—"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {brand.isTaxonomized ? (
                            <Chip
                              icon={<CheckCircleRoundedIcon fontSize="small" />}
                              label="Taxonomized"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          ) : (
                            <Tooltip title="Brand not in taxonomy - Click to add in Taxonomy Editor">
                              <Chip
                                component="a"
                                href={TAXONOMY_EDITOR_START_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                clickable
                                icon={
                                  <WarningAmberRoundedIcon fontSize="small" />
                                }
                                label="Untaxonomized"
                                size="small"
                                color="warning"
                                variant="outlined"
                                sx={{
                                  cursor: "pointer",
                                  "&:hover": {
                                    bgcolor: "warning.main",
                                    color: "warning.contrastText",
                                  },
                                }}
                              />
                            </Tooltip>
                          )}
                        </TableCell>

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ justifyContent: "flex-end" }}
                          >
                            <Button
                              component={RouterLink as React.ElementType}
                              to={questionsUrl}
                              size="small"
                              variant={
                                brand.opportunities > 0
                                  ? "contained"
                                  : "outlined"
                              }
                              color="primary"
                              startIcon={<HelpOutlineRoundedIcon />}
                              sx={{
                                fontSize: "0.75rem",
                                textTransform: "none",
                              }}
                            >
                              Questions
                            </Button>
                            <Button
                              component={RouterLink as React.ElementType}
                              to={logoSearchUrl}
                              size="small"
                              variant="outlined"
                              color="inherit"
                              startIcon={<ImageSearchRoundedIcon />}
                              sx={{
                                fontSize: "0.75rem",
                                textTransform: "none",
                              }}
                            >
                              Logos
                            </Button>
                            <Tooltip title={`Open on ${activeProject.name}`}>
                              <IconButton
                                component="a"
                                href={externalCatalogUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                              >
                                <OpenInNewRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Load More Button */}
          {displayedBrands.length < filteredBrands.length && (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => setDisplayCount((prev) => prev + PAGE_SIZE)}
                sx={{ px: 5, borderRadius: 2 }}
              >
                Load More Brands (
                {filteredBrands.length - displayedBrands.length} remaining)
              </Button>
            </Box>
          )}
        </Container>
      </Box>
    </React.Suspense>
  );
}
