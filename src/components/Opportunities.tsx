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
const INITIAL_VISIBLE_COUNT = 60;
const PAGE_INCREMENT = 60;

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
  questionNumber: number | null;
  isCountLoading: boolean;
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
    isCountLoading,
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
                minHeight: 34,
                mt: 2.5,
              }}
            >
              {isCountLoading || questionNumber == null ? (
                <Skeleton
                  variant="rounded"
                  width={64}
                  height={28}
                  sx={{ borderRadius: 1.5 }}
                />
              ) : (
                <Typography
                  color="primary"
                  sx={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1 }}
                >
                  {questionNumber.toLocaleString()}
                </Typography>
              )}
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
  const [visibleCount, setVisibleCount] = React.useState(INITIAL_VISIBLE_COUNT);

  // Pre-seed taxonomy lookup map for instant multilingual name resolution
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
    isLoading: isCountLoading,
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

  // Automatically fetch subsequent count pages in the background
  React.useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const rawQuestions = React.useMemo(
    () => data?.pages.flat() ?? [],
    [data?.pages],
  );

  // Map of known counts returned from Robotoff
  const countMap = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const [category, count] of rawQuestions) {
      map.set(category, count);
    }
    return map;
  }, [rawQuestions]);

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

  // Resolve category name: check local taxonomy cache first, then API translations, then fallback to ID
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

  // Active base taxonomy (Agribalyse or all)
  const baseTaxonomyItems = React.useMemo(() => {
    return showAllCategories
      ? (allCategories ?? cachedCategories ?? [])
      : (cachedCategories ?? []);
  }, [showAllCategories, allCategories, cachedCategories]);

  // Build the complete list of items to display:
  // - Starts with cached categories immediately (names & clickability available on line 1)
  // - Appends any extra categories returned by Robotoff
  const allCategoryEntries = React.useMemo(() => {
    const seen = new Set<string>();
    const entries: {
      value: string;
      name: string;
      questionNumber: number | null;
    }[] = [];

    // 1. Add base taxonomy categories
    for (const item of baseTaxonomyItems) {
      seen.add(item.id);
      entries.push({
        value: item.id,
        name: getCategoryName(item.id),
        questionNumber: countMap.get(item.id) ?? null,
      });
    }

    // 2. Add extra categories returned by Robotoff that weren't in base taxonomy
    for (const [category, count] of rawQuestions) {
      if (!seen.has(category) && count > 0) {
        seen.add(category);
        entries.push({
          value: category,
          name: getCategoryName(category),
          questionNumber: count,
        });
      }
    }

    return entries;
  }, [baseTaxonomyItems, rawQuestions, countMap, getCategoryName]);

  // Filter and sort items
  const filteredAndSortedItems = React.useMemo(() => {
    let items = allCategoryEntries;

    if (filter.trim()) {
      const needle = filter.trim().toLowerCase();
      items = items.filter(
        ({ name, value }) =>
          name.toLowerCase().includes(needle) ||
          value.toLowerCase().includes(needle),
      );
    }

    if (sortOrder === "alpha") {
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Sort by count: categories with known counts come first sorted descending,
      // followed by categories whose counts are still loading
      items = [...items].sort((a, b) => {
        const countA = a.questionNumber ?? -1;
        const countB = b.questionNumber ?? -1;
        if (countA !== countB) return countB - countA;
        return a.name.localeCompare(b.name);
      });
    }

    return items;
  }, [allCategoryEntries, filter, sortOrder]);

  // Sentinel ref for infinite-scrolling the visible items
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => prev + PAGE_INCREMENT);
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filteredAndSortedItems.length]);

  const displayedItems = React.useMemo(() => {
    return filteredAndSortedItems.slice(0, visibleCount);
  }, [filteredAndSortedItems, visibleCount]);

  const hasMore = visibleCount < filteredAndSortedItems.length;

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
            onChange={(e) => {
              setFilter(e.target.value);
              setVisibleCount(INITIAL_VISIBLE_COUNT);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 240px" },
              maxWidth: { sm: 360 },
            }}
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
                    onChange={(e) => {
                      setShowAllCategories(e.target.checked);
                      setVisibleCount(INITIAL_VISIBLE_COUNT);
                    }}
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

        {/* Categories Grid - cards render immediately with localized titles and links */}
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
              isCountLoading={isCountLoading}
              showCounts={showCounts}
            />
          ))}

          {/* Skeletons only if no categories are cached at all */}
          {baseTaxonomyItems.length === 0 &&
            isCountLoading &&
            Array.from({ length: 12 }, (_, id) => <CardSkeleton key={id} />)}
        </Box>

        {/* Scroll Sentinel for progressive loading */}
        {hasMore && <Box ref={sentinelRef} sx={{ height: 20, my: 2 }} />}

        {/* Empty state */}
        {!isCountLoading && displayedItems.length === 0 && (
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
