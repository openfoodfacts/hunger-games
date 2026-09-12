import { useQuery } from "@tanstack/react-query";

import {
  CircularProgress,
  Badge,
  CardActionArea,
  CardMedia,
  Card,
  Link,
} from "@mui/material";

import robotoff, { FilterState } from "../robotoff";
import logo from "../assets/logo.png";
import { getQuestionSearchParams } from "./QuestionFilter";

type SmallQuestionCardProps = {
  filterState: FilterState;
  imageSrc?: string;
};

export default function SmallQuestionCard({
  filterState,
  imageSrc,
}: SmallQuestionCardProps) {
  const targetUrl = `/questions?${getQuestionSearchParams(filterState)}`;

  const questionCountQuery = useQuery({
    queryKey: ["question-count", filterState],
    queryFn: async () => {
      const { data } = await robotoff.questions(
        { ...filterState, with_image: true },
        1,
        1,
      );
      return data?.count ?? 0;
    },
  });
  const questionNumber = questionCountQuery.data ?? null;

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
