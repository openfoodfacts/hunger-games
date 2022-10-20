import * as React from "react";
import { Link } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

import robotoff from "../robotoff";
import { getQuestionSearchParams } from "./QuestionFilter/useFilterSearch";

const OpportunityCard = (props) => {
  const { type, value, campaign, country, questionNumber } = props;

  const targetUrl = `/questions?${getQuestionSearchParams({
    valueTag: value,
    insightType: type,
    campaign,
    countryFilter: country,
    sortByPopularity: true,
  })}`;
  return (
    <Card
      sx={{
        minWidth: 250,
      }}
      variant="outlined"
    >
      <CardActionArea component={Link} to={targetUrl} sx={{ height: "100%" }}>
        <CardContent>
          <Typography variant="h6">{value}</Typography>
          <Typography sx={{ textAlign: "end", mt: 3, fontSize: "1.5rem" }}>
            {questionNumber.toLocaleString()}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const CardSkeleton = () => (
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
);

const Opportunities = (props) => {
  const { type, campaign, country } = props;
  const [remainingQuestions, setRemainingQuestions] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isValid = true;
    setIsLoading(true);

    robotoff
      .getUnansweredValues({ type, campaign, country, page: 1 })
      .then(({ data }) => {
        if (isValid) {
          setRemainingQuestions(data.questions);
          setIsLoading(false);
        }
      })
      .catch(() => {
        setIsLoading(false);
      });

    return () => {
      isValid = false;
    };
  }, [type, campaign, country]);

  return (
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
        {isLoading &&
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => (
            <CardSkeleton key={id} />
          ))}
        {!isLoading &&
          remainingQuestions.map(([value, questionNumber]) => (
            <OpportunityCard
              key={value}
              value={value}
              type={type}
              campaign={campaign}
              country={country}
              questionNumber={questionNumber}
            />
          ))}
      </Box>
    </Box>
  );
};

export default Opportunities;
