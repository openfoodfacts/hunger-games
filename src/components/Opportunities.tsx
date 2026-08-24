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
import MenuItem from "@mui/material/MenuItem";

import Loader from "../pages/loader";

import robotoff from "../robotoff";
import off from "../off";
import { getQuestionSearchParams } from "./QuestionFilter/useFilterSearch";
import { getLang } from "../localeStorageManager";

// A single request returns every category (~937 worldwide, ~25 KB). Robotoff
// takes about the same time whatever `count` is, so paging only added waiting.
const MAX_CATEGORIES = 1000;

// The taxonomy endpoint passes every tag in the query string, and the server
// answers 414 past ~8 KB of URL. Batch the lookups to stay well under that.
const TRANSLATION_BATCH_SIZE = 100;

type InsightType = "label" | "brand" | "category";

/** Robotoff returns each row as a [tag, questionNumber] pair. */
type CategoryCount = [string, number];

/** Taxonomy lookup: tag -> localised names, keyed by language code. */
type CategoryNames = Record<string, { name?: Record<string, string> }>;

type SortBy = "count" | "name";

type OpportunitiesProps = {
  type: InsightType;
  campaign: string;
  countryCode: string;
};

const OpportunityCard = (props: {
  type: InsightType;
  value: string;
  name: string;
  campaign: string;
  countryCode: string;
  questionNumber: number;
}) => {
  const { type, value, name, campaign, countryCode, questionNumber } = props;

  const targetUrl = `/questions?${getQuestionSearchParams({
    valueTag: value,
    insightType: type,
    campaign,
    countryFilter: countryCode,
    sortByPopularity: true,
  })}`;

  return (
    <React.Suspense fallback={<Loader />}>
      <Card
        sx={{
          minWidth: 250,
        }}
        variant="outlined"
      >
        <CardActionArea component={Link} to={targetUrl} sx={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h6">{name}</Typography>
            <Typography sx={{ textAlign: "end", mt: 3, fontSize: "1.5rem" }}>
              {questionNumber.toLocaleString()}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </React.Suspense>
  );
};

const CardSkeleton = () => (
  <React.Suspense fallback={<Loader />}>
    <Card
      sx={{
        minWidth: 250,
      }}
    >
      <CardContent>
        <Skeleton variant="rectangular" width={200} height={40} />
        <Skeleton
          variant="rectangular"
          width={100}
          height={50}
          sx={{ mt: 3, ml: "auto", fontSize: "1.5rem" }}
        />
      </CardContent>
    </Card>
  </React.Suspense>
);

const useCategoryNames = (toTranslate: string[]) => {
  const [translation, setTranslation] = React.useState<CategoryNames>({});
  const requested = React.useRef(new Set<string>());

  // Join into a stable string so the effect only reruns when the set of tags
  // actually changes, rather than on every render.
  const tagKey = toTranslate.join(",");

  React.useEffect(() => {
    let isValid = true;

    const missing = (tagKey ? tagKey.split(",") : []).filter(
      (tag) => !requested.current.has(tag),
    );

    if (missing.length === 0) {
      return;
    }
    missing.forEach((tag) => requested.current.add(tag));

    for (let i = 0; i < missing.length; i += TRANSLATION_BATCH_SIZE) {
      off
        .getCategoriesTranslations({
          categories: missing.slice(i, i + TRANSLATION_BATCH_SIZE),
        })
        .then(({ data }: { data: CategoryNames }) => {
          if (isValid) {
            setTranslation((prev) => ({
              ...prev,
              ...data,
            }));
          }
        })
        .catch(() => {});
    }

    return () => {
      isValid = false;
    };
  }, [tagKey]);

  return translation;
};

const Opportunities = (props: OpportunitiesProps) => {
  const { type, campaign, countryCode } = props;
  const { t } = useTranslation();

  const [remainingQuestions, setRemainingQuestions] = React.useState<
    CategoryCount[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortBy>("count");

  React.useEffect(() => {
    let isValid = true;
    setIsLoading(true);

    robotoff
      .getUnansweredValues({
        type,
        campaign,
        countryCode,
        page: 1,
        count: MAX_CATEGORIES,
      })
      .then(({ data }: { data?: { questions?: CategoryCount[] } }) => {
        if (isValid) {
          setRemainingQuestions(data?.questions ?? []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isValid) {
          setRemainingQuestions([]);
          setIsLoading(false);
        }
      });

    return () => {
      isValid = false;
    };
  }, [type, campaign, countryCode]);

  const translation = useCategoryNames(
    remainingQuestions.map(([value]) => value),
  );

  const lang: string = getLang();

  const visibleCategories = React.useMemo(() => {
    const rows = remainingQuestions.map(([value, questionNumber]) => ({
      value,
      questionNumber,
      name:
        translation[value]?.name?.[lang] ??
        translation[value]?.name?.en ??
        value,
    }));

    const query = search.trim().toLowerCase();
    const filtered = query
      ? rows.filter(
          (row) =>
            row.name.toLowerCase().includes(query) ||
            row.value.toLowerCase().includes(query),
        )
      : rows;

    return sortBy === "name"
      ? [...filtered].sort((a, b) => a.name.localeCompare(b.name))
      : [...filtered].sort((a, b) => b.questionNumber - a.questionNumber);
  }, [remainingQuestions, translation, lang, search, sortBy]);

  return (
    <React.Suspense fallback={<Loader />}>
      <Box sx={{ mt: 2, px: 2 }}>
        <Typography variant="h6" component="h3">
          {type}
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ my: 2 }}
        >
          <TextField
            size="small"
            label={t("green-score.searchCategory")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          <TextField
            select
            size="small"
            label={t("green-score.sortBy")}
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortBy)}
            sx={{ width: 220 }}
          >
            <MenuItem value="count">{t("green-score.sortByCount")}</MenuItem>
            <MenuItem value="name">{t("green-score.sortByName")}</MenuItem>
          </TextField>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gridGap: "10px 50px",
          }}
        >
          {visibleCategories.map(({ value, questionNumber, name }) => (
            <OpportunityCard
              key={value}
              value={value}
              name={name}
              type={type}
              campaign={campaign}
              countryCode={countryCode}
              questionNumber={questionNumber}
            />
          ))}
          {isLoading &&
            Array.from({ length: 12 }, (_, id) => <CardSkeleton key={id} />)}
        </Box>

        {!isLoading && visibleCategories.length === 0 && (
          <Typography sx={{ mt: 2 }}>
            {t("green-score.noCategories")}
          </Typography>
        )}
      </Box>
    </React.Suspense>
  );
};

export default Opportunities;
