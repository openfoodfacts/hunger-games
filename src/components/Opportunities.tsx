import * as React from "react";
import { Link } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

import robotoff from "../robotoff";
import { getQuestionSearchParams } from "./QuestionFilter/useFilterSearch";

const OpportunityCard = (props) => {
  const { type, value, questionNumber } = props;

  const targetUrl = `/questions?${getQuestionSearchParams({
    valueTag: value,
    insightType: type,
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
  const { type } = props;
  const [remainingQuestions, setRemainingQuestions] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isValid = true;
    setIsLoading(true);

    robotoff
      .getUnansweredValues({ type, page: 1 })
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
  }, [type]);

  return (
    <Box sx={{ mt: 2, px: 2 }}>
      <Typography variant="h6" component="h3">
        {type}
      </Typography>
      <Stack
        spacing={2}
        direction="row"
        sx={{
          maxWidth: "100%",
          overflow: "auto",
          py: 2,
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
              questionNumber={questionNumber}
            />
          ))}
      </Stack>
    </Box>
  );
};

export default Opportunities;
