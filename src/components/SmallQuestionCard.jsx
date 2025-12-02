import * as React from "react";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import Badge from "@mui/material/Badge";
import Link from "@mui/material/Link";

import robotoff from "../robotoff";
import logo from "../assets/logo.png";
import { getQuestionSearchParams } from "./QuestionFilter";

const SmallQuestionCard = (props) => {
  const { filterState, imageSrc } = props;

  const targetUrl = `/questions?${getQuestionSearchParams(filterState)}`;

  const [questionNumber, setQuestionNumber] = React.useState("?");

  React.useEffect(() => {
    let isValid = true;
    robotoff
      .questions({ ...filterState, with_image: true }, 1, 1)
      .then(({ data }) => {
        if (isValid) {
          setQuestionNumber(data?.count ?? 0);
        }
      });
    return () => {
      isValid = false;
    };
  }, [filterState]);

  return (
    <Badge
      sx={{
        "& .MuiBadge-badge": {
          fontSize: "1.5rem",
          minWidth: "2rem",
          minHeight: "2rem",
        },
      }}
      badgeContent={questionNumber}
      showZero
      color={
        questionNumber === "?"
          ? "info"
          : questionNumber > 0
            ? "error"
            : "success"
      }
    >
      <Card sx={{ minWidth: 200, maxWidth: 350 }}>
        <CardActionArea component={Link} href={targetUrl}>
          <CardMedia
            component="img"
            height="150"
            image={imageSrc || logo}
            alt=""
            sx={{ objectFit: "contain" }}
          />
        </CardActionArea>
      </Card>
    </Badge>
  );
};

export default SmallQuestionCard;
