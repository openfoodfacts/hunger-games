import * as React from "react";
import { Link } from "react-router";

import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
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
        sx={{
          minWidth: 250,
        }}
        variant="outlined"
      >
        <CardActionArea
          component={Link as React.ElementType}
          to={targetUrl}
          sx={{ height: "100%" }}
        >
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
    () => data?.pages.flat() ?? [],
    [data?.pages],
  );
  const translation = useCategoryTranslations(data?.pages ?? []);

  const lang = getLang() ?? "en";
  return (
    <React.Suspense fallback={<Loader />}>
      <Box sx={{ mt: 2, px: 2 }}>
        <Typography variant="h6" component="h3">
          {type}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gridGap: "10px 50px",
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
            fullWidth
            onClick={() => void fetchNextPage()}
          >
            Load more
          </Button>
        </Box>
      </Box>
    </React.Suspense>
  );
};

export default Opportunities;
