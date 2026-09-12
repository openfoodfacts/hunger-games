import * as React from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";

import Loader from "../pages/loader";

import robotoff from "../robotoff";
import off from "../off";
import { getQuestionSearchParams } from "./QuestionFilter/useFilterSearch";
import { getLang } from "../localeStorageManager";

const pageSize = 25;

interface OpportunitiesProps {
  type: "label" | "brand" | "category";
  campaign: string;
  countryCode: string;
}

interface OpportunityCardProps extends OpportunitiesProps {
  value: string;
  name: string;
  questionNumber: number;
}

const OpportunityCard = (props: OpportunityCardProps) => {
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
          sx={{ height: "100%" }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
              {name}
            </Typography>
            <Stack
              direction="row"
              sx={{ alignItems: "baseline", justifyContent: "flex-end", mt: 3 }}
            >
              <Typography
                color="primary"
                sx={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1 }}
              >
                {questionNumber.toLocaleString()}
              </Typography>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </React.Suspense>
  );
};

const CardSkeleton = () => (
  <React.Suspense fallback={<Loader />}>
    <Card
      variant="outlined"
      sx={{ minWidth: 0, borderRadius: 3, boxShadow: "none" }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Skeleton variant="rounded" width="80%" height={28} />
        <Skeleton
          variant="rounded"
          width={100}
          height={50}
          sx={{ mt: 3, ml: "auto", fontSize: "1.5rem" }}
        />
      </CardContent>
    </Card>
  </React.Suspense>
);

type Opportunity = [string, number];
type CategoryTranslations = Record<
  string,
  { name?: Record<string, string | undefined> }
>;

const useCategoryTranslations = (pages: Opportunity[][]) => {
  const lang = getLang() ?? "en";
  const seen = new Set<string>();
  const categoryPages = pages.map((page) =>
    page.flatMap(([category]) => {
      if (seen.has(category)) return [];
      seen.add(category);
      return category;
    }),
  );

  return useQueries({
    queries: categoryPages.map((categories) => ({
      queryKey: ["category-translations", lang, categories],
      queryFn: async () => {
        const response = await off.getCategoriesTranslations({ categories });
        return response.data;
      },
      enabled: categories.length > 0,
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
  const { type, campaign, countryCode } = props;
  const { t } = useTranslation();
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["opportunities", type, campaign, countryCode],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const response = await robotoff.getUnansweredValues({
          type,
          campaign,
          countryCode,
          page: pageParam,
          count: pageSize,
        });
        return response.data.questions ?? [];
      },
      getNextPageParam: (lastPage, pages) =>
        lastPage.length < pageSize ? undefined : pages.length + 1,
    });
  const remainingQuestions = React.useMemo(
    () =>
      [...(data?.pages.flat() ?? [])].sort(
        ([, firstQuestionNumber], [, secondQuestionNumber]) =>
          secondQuestionNumber - firstQuestionNumber,
      ),
    [data?.pages],
  );
  const translation = useCategoryTranslations(data?.pages ?? []);

  const lang = getLang() ?? "en";
  return (
    <React.Suspense fallback={<Loader />}>
      <Box>
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
          {remainingQuestions.map(([value, questionNumber]) => {
            const name =
              translation[value]?.name?.[lang] ??
              translation[value]?.name?.en ??
              value;
            return (
              <OpportunityCard
                key={value}
                value={value}
                name={name}
                type={type}
                campaign={campaign}
                countryCode={countryCode}
                questionNumber={questionNumber}
              />
            );
          })}
          {(isLoading || isFetchingNextPage) &&
            [
              0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
              19, 20, 21, 22, 23, 24,
            ].map((id) => <CardSkeleton key={id} />)}
          <Button
            disabled={isLoading || isFetchingNextPage || !hasNextPage}
            variant="contained"
            sx={{ gridColumn: "1 / -1", justifySelf: "center", px: 4 }}
            onClick={() => void fetchNextPage()}
          >
            {t("logos.load_more")}
          </Button>
        </Box>
      </Box>
    </React.Suspense>
  );
};

export default Opportunities;
