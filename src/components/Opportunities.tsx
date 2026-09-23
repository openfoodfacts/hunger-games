import * as React from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import SearchIcon from "@mui/icons-material/Search";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";

import Loader from "../pages/loader";

import robotoff from "../robotoff";
import off from "../off";
import { getQuestionSearchParams } from "./QuestionFilter/useFilterSearch";
import { getLang } from "../localeStorageManager";

const pageSize = 100;

export interface CategoryTaxonomyItem {
  id: string;
  name?: Record<string, string>;
}

export interface OpportunitiesProps {
  type: "label" | "brand" | "category";
  campaign: string;
  countryCode: string;
  cachedCategories?: CategoryTaxonomyItem[];
  allCategories?: CategoryTaxonomyItem[];
}

interface OpportunityCardProps {
  type: string;
  value: string;
  name: string;
  campaign: string;
  countryCode: string;
  questionNumber: number;
  showCounts: boolean;
}

const OpportunityCard = (props: OpportunityCardProps) => {
  const {
    type,
    value,
    name,
    campaign,
    countryCode,
    questionNumber,
    showCounts,
  } = props;

  const targetUrl = `/questions?${getQuestionSearchParams({
    valueTag: value,
    insightType: type,
    campaign,
    countryFilter: countryCode,
    sortByPopularity: true,
  })}`;

  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        minWidth: 0,
        height: "100%",
        borderRadius: 3,
        boxShadow: "none",
        transition: theme.transitions.create(["transform", "box-shadow"]),
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[2],
        },
      })}
    >
      <CardActionArea
        component={Link as React.ElementType}
        to={targetUrl}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "space-between",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, width: "100%" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
            {name}
          </Typography>
          {showCounts && (
            <Stack
              direction="row"
              sx={{
                alignItems: "baseline",
                justifyContent: "flex-end",
                mt: 2.5,
              }}
            >
              <Typography
                color="primary"
                sx={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1 }}
              >
                {questionNumber.toLocaleString()}
              </Typography>
            </Stack>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const CardSkeleton = () => (
  <Card
    variant="outlined"
    sx={{ minWidth: 0, borderRadius: 3, boxShadow: "none" }}
  >
    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Skeleton variant="rounded" width="80%" height={28} />
      <Skeleton
        variant="rounded"
        width={100}
        height={40}
        sx={{ mt: 2.5, ml: "auto" }}
      />
    </CardContent>
  </Card>
);

type SortOrder = "count" | "alpha";

type CategoryTranslations = Record<
  string,
  { name?: Record<string, string | undefined> }
>;

const useCategoryTranslations = (
  missingCategories: string[],
): CategoryTranslations => {
  const lang = getLang() ?? "en";

  // Chunk missing categories into batches of 50
  const chunks = React.useMemo(() => {
    const result: string[][] = [];
    for (let i = 0; i < missingCategories.length; i += 50) {
      result.push(missingCategories.slice(i, i + 50));
    }
    return result;
  }, [missingCategories]);

  return useQueries({
    queries: chunks.map((chunk) => ({
      queryKey: ["category-translations", lang, chunk],
      queryFn: async () => {
        const response = await off.getCategoriesTranslations({
          categories: chunk,
        });
        return response.data;
      },
      enabled: chunk.length > 0,
      staleTime: 60 * 60 * 1000,
    })),
    combine: (results) =>
      results.reduce<CategoryTranslations>(
        (translations, result) => ({
          ...translations,
          ...(result.data ?? {}),
        }),
        {},
      ),
  });
};

const Opportunities = (props: OpportunitiesProps) => {
  const { type, campaign, countryCode, cachedCategories, allCategories } =
    props;
  const { t } = useTranslation();

  const [filter, setFilter] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("count");
  const [showCounts, setShowCounts] = React.useState(true);
  const [showAllCategories, setShowAllCategories] = React.useState(false);

  // Pre-seed taxonomy name lookup map from static assets for instant localization
  const taxonomyMap = React.useMemo(() => {
    const map = new Map<string, Record<string, string>>();
    if (cachedCategories) {
      for (const item of cachedCategories) {
        if (item.name) {
          map.set(item.id, item.name);
        }
      }
    }
    if (allCategories) {
      for (const item of allCategories) {
        if (item.name && !map.has(item.id)) {
          map.set(item.id, item.name);
        }
      }
    }
    return map;
  }, [cachedCategories, allCategories]);

  const effectiveCampaign = showAllCategories ? "" : campaign;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["opportunities", type, effectiveCampaign, countryCode],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await robotoff.getUnansweredValues({
        type,
        campaign: effectiveCampaign,
        countryCode,
        page: pageParam,
        count: pageSize,
      });
      return response.data.questions ?? [];
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.length < pageSize ? undefined : pages.length + 1,
    staleTime: 5 * 60 * 1000,
  });

  // Automatically fetch subsequent pages in the background without needing a "Load more" button
  React.useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const rawQuestions = React.useMemo(
    () => data?.pages.flat() ?? [],
    [data?.pages],
  );

  // Extract category IDs that are not present in the local taxonomy cache
  const missingCategories = React.useMemo(() => {
    const seen = new Set<string>();
    const missing: string[] = [];
    for (const [category] of rawQuestions) {
      if (!taxonomyMap.has(category) && !seen.has(category)) {
        seen.add(category);
        missing.push(category);
      }
    }
    return missing;
  }, [rawQuestions, taxonomyMap]);

  const remoteTranslations = useCategoryTranslations(missingCategories);

  const lang = getLang() ?? "en";

  // Resolve category name: check local taxonomy cache first, then API translations, then fallback to id
  const getCategoryName = React.useCallback(
    (categoryId: string): string => {
      const cached = taxonomyMap.get(categoryId);
      if (cached) {
        const localized = cached[lang] ?? cached.en;
        if (localized) return localized;
      }
      const remote = remoteTranslations[categoryId]?.name;
      if (remote) {
        const localized = remote[lang] ?? remote.en;
        if (localized) return localized;
      }
      return categoryId;
    },
    [taxonomyMap, remoteTranslations, lang],
  );

  const displayedItems = React.useMemo(() => {
    // Exclude any categories with count <= 0 to prevent phantom opportunities
    let items = rawQuestions
      .filter(([, count]) => count > 0)
      .map(([value, questionNumber]) => ({
        value,
        name: getCategoryName(value),
        questionNumber,
      }));

    if (filter.trim()) {
      const needle = filter.trim().toLowerCase();
      items = items.filter(
        ({ name, value }) =>
          name.toLowerCase().includes(needle) ||
          value.toLowerCase().includes(needle),
      );
    }

    if (sortOrder === "alpha") {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      items.sort((a, b) => b.questionNumber - a.questionNumber);
    }

    return items;
  }, [rawQuestions, getCategoryName, filter, sortOrder]);

  return (
    <React.Suspense fallback={<Loader />}>
      <Box sx={{ mt: 3 }}>
        {/* Controls Toolbar */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            flexWrap: "wrap",
            mb: 2.5,
          }}
        >
          <TextField
            size="small"
            placeholder={t("opportunities.filter")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: { xs: "1 1 100%", sm: "1 1 240px" }, maxWidth: { sm: 360 } }}
          />

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              flexWrap: "wrap",
              alignItems: "center",
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            <ToggleButtonGroup
              value={sortOrder}
              exclusive
              onChange={(_, value: SortOrder | null) => {
                if (value) setSortOrder(value);
              }}
              size="small"
              aria-label={t("opportunities.sortOrder")}
            >
              <ToggleButton
                value="count"
                aria-label={t("opportunities.sortByCount")}
                sx={{ textTransform: "none", fontWeight: 600, px: 1.5 }}
              >
                <FormatListNumberedIcon fontSize="small" sx={{ mr: 0.75 }} />
                {t("opportunities.sortByCount")}
              </ToggleButton>
              <ToggleButton
                value="alpha"
                aria-label={t("opportunities.sortAlpha")}
                sx={{ textTransform: "none", fontWeight: 600, px: 1.5 }}
              >
                <SortByAlphaIcon fontSize="small" sx={{ mr: 0.75 }} />
                {t("opportunities.sortAlpha")}
              </ToggleButton>
            </ToggleButtonGroup>

            <FormControlLabel
              control={
                <Switch
                  checked={showCounts}
                  onChange={(e) => setShowCounts(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t("opportunities.showCounts")}
                </Typography>
              }
              sx={{ m: 0 }}
            />

            {allCategories && allCategories.length > 0 && (
              <FormControlLabel
                control={
                  <Switch
                    checked={showAllCategories}
                    onChange={(e) => setShowAllCategories(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {t("opportunities.showAllCategories")}
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            )}
          </Stack>
        </Stack>

        {/* Categories Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          {displayedItems.map(({ value, name, questionNumber }) => (
            <OpportunityCard
              key={value}
              value={value}
              name={name}
              type={type}
              campaign={effectiveCampaign}
              countryCode={countryCode}
              questionNumber={questionNumber}
              showCounts={showCounts}
            />
          ))}

          {/* Skeletons while loading initial page */}
          {isLoading &&
            Array.from({ length: 12 }, (_, id) => <CardSkeleton key={id} />)}
        </Box>

        {/* Empty state */}
        {!isLoading && displayedItems.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="body1" color="text.secondary">
              {t("opportunities.noResults")}
            </Typography>
          </Box>
        )}
      </Box>
    </React.Suspense>
  );
};

export default Opportunities;
