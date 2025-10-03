import * as React from "react";
import { Link } from "react-router";

import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";

import Loader from "../pages/loader";

import robotoff from "../robotoff";
import off from "../off";
import { getQuestionSearchParams } from "./QuestionFilter/useFilterSearch";
import { getLang } from "../localeStorageManager";

const pageSize = 25;

const OpportunityCard = (props) => {
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

const useTranslation = (toTranslate) => {
  const [translation, setTranslation] = React.useState({});

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
  }, [toTranslate]);

  return translation;
};

const Opportunities = (props) => {
  const { type, campaign, countryCode } = props;
  const [remainingQuestions, setRemainingQuestions] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setRemainingQuestions([]);
  }, [type, campaign, countryCode]);

  React.useEffect(() => {
    let isValid = true;
    setIsLoading(true);

    robotoff
      .getUnansweredValues({
        type,
        campaign,
        countryCode,
        page,
        count: pageSize,
      })
      .then(({ data }) => {
        if (isValid) {
          setRemainingQuestions((prev) => [
            ...prev,
            ...(data?.questions ?? []),
          ]);
          setIsLoading(false);
        }
      })
      .catch(() => {
        setIsLoading(false);
      });

    return () => {
      isValid = false;
    };
  }, [type, campaign, countryCode, page]);

  const translation = useTranslation(
    remainingQuestions.map(([value]) => value),
  );

  const lang = getLang();
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
          {isLoading &&
            [
              0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
              19, 20, 21, 22, 23, 24,
            ].map((id) => <CardSkeleton key={id} />)}
          <Button
            disabled={isLoading}
            variant="contained"
            fullWidth
            onClick={() => setPage((p) => p + 1)}
          >
            Load more
          </Button>
        </Box>
      </Box>
    </React.Suspense>
  );
};

export default Opportunities;
