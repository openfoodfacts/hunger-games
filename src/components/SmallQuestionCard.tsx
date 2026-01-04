import { useEffect, useState } from "react";

import {
  CircularProgress,
  Badge,
  CardActionArea,
  CardMedia,
  Card,
  Link,
} from "@mui/material";

import robotoff from "../robotoff";
import logo from "../assets/logo.png";
import { getQuestionSearchParams } from "./QuestionFilter";

type SmallQuestionCardProps = {
  filterState: Partial<{
    insightType: string;
    brandFilter: string;
    valueTag: string;
    countryFilter: string;
    sortByPopularity: boolean;
    campaign: string;
    predictor: string;
    with_image?: boolean;
  }>;
  imageSrc?: string;
};

export default function SmallQuestionCard({
  filterState,
  imageSrc,
}: SmallQuestionCardProps) {
  const targetUrl = `/questions?${getQuestionSearchParams(filterState)}`;

  const [questionNumber, setQuestionNumber] = useState<null | number>(null);

  useEffect(() => {
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
      badgeContent={
        questionNumber ?? <CircularProgress size={15} sx={{ color: "white" }} />
      }
      showZero
      color={
        questionNumber == null
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
}
