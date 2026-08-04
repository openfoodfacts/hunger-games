import * as React from "react";
import { Link } from "react-router";

import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";

import { useTranslation as useI18nTranslation } from "react-i18next";

import Loader from "../pages/loader";

import robotoff from "../robotoff";
import off from "../off";
import { getQuestionSearchParams } from "./QuestionFilter/useFilterSearch";
import { getLang } from "../localeStorageManager";

const pageSize = 100;

type SortOrder = "count" | "alpha";

// Lazily loads the count for one card when it scrolls into view
const LazyCount = ({
  value,
  countMap,
}: {
  value: string;
  countMap: Record<string, number | null>;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const count = countMap[value];

  return (
    <div ref={ref}>
      {!visible || count === undefined ? (
        <Skeleton
          variant="rectangular"
          width={80}
          height={32}
          sx={{ mt: 1, ml: "auto" }}
        />
      ) : count === null ? null : (
        <Typography sx={{ textAlign: "end", mt: 1, fontSize: "1.5rem" }}>
          {count.toLocaleString()}
        </Typography>
      )}
    </div>
  );
};

const OpportunityCard = (props: {
  type: string;
  value: string;
  name: string;
  campaign: string;
  countryCode: string;
  showCounts: boolean;
  countMap: Record<string, number | null>;
}) => {
  const { type, value, name, campaign, countryCode, showCounts, countMap } =
    props;

  const targetUrl = `/questions?${getQuestionSearchParams({
    valueTag: value,
    insightType: type,
    campaign,
    countryFilter: countryCode,
    sortByPopularity: true,
  })}`;

  return (
    <Card sx={{ minWidth: 250 }} variant="outlined">
      <CardActionArea component={Link} to={targetUrl} sx={{ height: "100%" }}>
        <CardContent>
          <Typography variant="h6">{name}</Typography>
          {showCounts && <LazyCount value={value} countMap={countMap} />}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const CardSkeleton = () => (
  <Card sx={{ minWidth: 250 }}>
    <CardContent>
      <Skeleton variant="rectangular" width={200} height={40} />
    </CardContent>
  </Card>
);

const useCategoryTranslation = (toTranslate: string[]) => {
  const [translation, setTranslation] = React.useState<
    Record<string, { name?: Record<string, string> }>
  >({});

  React.useEffect(() => {
    const remaining = toTranslate.filter((key) => !translation[key]);

    if (remaining.length > 0) {
      off
        .getCategoriesTranslations({ categories: remaining })
        .then(({ data }) => {
          setTranslation((prev) => ({
            ...prev,
            ...data,
          }));
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toTranslate]);

  return translation;
};

// Fetch all pages of unanswered values without counts, then build countMap
const useAllValues = (
  type: string,
  campaign: string,
  countryCode: string,
): {
  values: string[];
  countMap: Record<string, number | null>;
  isLoading: boolean;
} => {
  const [values, setValues] = React.useState<string[]>([]);
  const [countMap, setCountMap] = React.useState<Record<string, number | null>>(
    {},
  );
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setValues([]);
    setCountMap({});
    setIsLoading(true);

    let cancelled = false;

    const fetchPage = async (page: number) => {
      const { data } = await robotoff.getUnansweredValues({
        type: type as "label" | "brand" | "category",
        campaign,
        countryCode,
        page,
        count: pageSize,
      });

      if (cancelled) return;

      const questions: [string, number][] = data?.questions ?? [];

      // Accumulate values immediately for rendering
      setValues((prev) => [...prev, ...questions.map(([v]) => v)]);

      // Store counts too (for sort-by-count and show-counts)
      setCountMap((prev) => {
        const next = { ...prev };
        questions.forEach(([v, n]) => {
          next[v] = n;
        });
        return next;
      });

      if (questions.length === pageSize) {
        // There may be more pages
        await fetchPage(page + 1);
      } else {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchPage(1).catch(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [type, campaign, countryCode]);

  return { values, countMap, isLoading };
};

const Opportunities = (props: {
  type: string;
  campaign: string;
  countryCode: string;
}) => {
  const { type, campaign, countryCode } = props;
  const { t } = useI18nTranslation();

  const { values, countMap, isLoading } = useAllValues(
    type,
    campaign,
    countryCode,
  );

  const [showCounts, setShowCounts] = React.useState(false);
  const [filter, setFilter] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("count");

  const translation = useCategoryTranslation(values);
  const lang = getLang();

  const displayedItems = React.useMemo(() => {
    let items = values.map((value) => ({
      value,
      name:
        translation[value]?.name?.[lang] ??
        translation[value]?.name?.en ??
        value,
      count: countMap[value] ?? 0,
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
      items.sort((a, b) => b.count - a.count);
    }

    return items;
  }, [values, translation, lang, filter, sortOrder, countMap]);

  return (
    <React.Suspense fallback={<Loader />}>
      <Box sx={{ mt: 2, px: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            mb: 2,
          }}
        >
          <TextField
            size="small"
            label={t("opportunities.filter")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ flex: "1 1 200px", maxWidth: 400 }}
          />
          <ToggleButtonGroup
            value={sortOrder}
            exclusive
            onChange={(_, v) => v && setSortOrder(v)}
            size="small"
            aria-label={t("opportunities.sortOrder")}
          >
            <ToggleButton value="count" aria-label={t("opportunities.sortByCount")}>
              <FormatListNumberedIcon fontSize="small" sx={{ mr: 0.5 }} />
              {t("opportunities.sortByCount")}
            </ToggleButton>
            <ToggleButton value="alpha" aria-label={t("opportunities.sortAlpha")}>
              <SortByAlphaIcon fontSize="small" sx={{ mr: 0.5 }} />
              {t("opportunities.sortAlpha")}
            </ToggleButton>
          </ToggleButtonGroup>
          <FormControlLabel
            control={
              <Switch
                checked={showCounts}
                onChange={(e) => setShowCounts(e.target.checked)}
              />
            }
            label={t("opportunities.showCounts")}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gridGap: "10px 50px",
          }}
        >
          {displayedItems.map(({ value, name }) => (
            <OpportunityCard
              key={value}
              value={value}
              name={name}
              type={type}
              campaign={campaign}
              countryCode={countryCode}
              showCounts={showCounts}
              countMap={countMap}
            />
          ))}
          {isLoading &&
            Array.from({ length: 25 }, (_, id) => (
              <CardSkeleton key={id} />
            ))}
        </Box>
      </Box>
    </React.Suspense>
  );
};

export default Opportunities;
