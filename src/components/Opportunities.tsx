import * as React from "react";
import { Link } from "react-router";

import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";

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
      const chunkSize = 100;
      for (let i = 0; i < remaining.length; i += chunkSize) {
        const chunk = remaining.slice(i, i + chunkSize);
        off
          .getCategoriesTranslations({ categories: chunk })
          .then(({ data }) => {
            setTranslation((prev) => ({
              ...prev,
              ...data,
            }));
          })
          .catch(() => {});
      }
    }
  }, [toTranslate]);

  return translation;
};

const Opportunities = (props) => {
  const { type, campaign, countryCode } = props;
  const [remainingQuestions, setRemainingQuestions] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState("count");

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
        count: 10000,
      })
      .then(({ data }) => {
        if (isValid) {
          setRemainingQuestions(data?.questions ?? []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        setIsLoading(false);
      });

    return () => {
      isValid = false;
    };
  }, [type, campaign, countryCode]);

  const translation = useTranslation(
    remainingQuestions.map(([value]) => value),
  );

  const lang = getLang();

  const displayItems = React.useMemo(() => {
    let items = remainingQuestions.map(([value, questionNumber]) => {
      const name =
        translation[value]?.name?.[lang] ??
        translation[value]?.name?.en ??
        value;
      return { value, questionNumber, name };
    });

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      items = items.filter((item) =>
        item.name.toLowerCase().includes(lowerQuery),
      );
    }

    if (sortBy === "alphabetically") {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      items.sort((a, b) => b.questionNumber - a.questionNumber);
    }

    return items;
  }, [remainingQuestions, translation, lang, searchQuery, sortBy]);

  return (
    <React.Suspense fallback={<Loader />}>
      <Box sx={{ mt: 2, px: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" component="h3" sx={{ textTransform: "capitalize" }}>
            {type}
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <TextField
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 200, flexGrow: 1 }}
            />
            <TextField
              select
              size="small"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="count">By count</MenuItem>
              <MenuItem value="alphabetically">Alphabetically</MenuItem>
            </TextField>
          </Stack>
        </Stack>

        {isLoading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gridGap: "10px 50px",
            }}
          >
            {[...Array(20)].map((_, id) => (
              <CardSkeleton key={id} />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gridGap: "10px 50px",
            }}
          >
            {displayItems.map((item) => (
              <OpportunityCard
                key={item.value}
                value={item.value}
                name={item.name}
                type={type}
                campaign={campaign}
                countryCode={countryCode}
                questionNumber={item.questionNumber}
              />
            ))}
          </Box>
        )}
      </Box>
    </React.Suspense>
  );
};

export default Opportunities;
