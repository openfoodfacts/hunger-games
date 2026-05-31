import * as React from "react";

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Badge from "@mui/material/Badge";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import { default as MuiLink } from "@mui/material/Link";
import { Link } from "react-router";

import robotoff from "../../robotoff";
import { getQuestionSearchParams } from "../../components/QuestionFilter";
import { LogoDefinition } from "./dashboardDefinition";

const DashboardCard = (props: LogoDefinition) => {
  const { tag, label, logo, message, link, type } = props;

  const questionsUrl = `/questions?${getQuestionSearchParams({
    // insightType: "label",
    insightType: type,
    valueTag: tag,
  })}`;
  // const logoQuestionsUrl = `/logoQuestion/${tag}`;

  const logoAnnotationUrl = `/logos/deep-search?type=${type}&value=${tag}`;

  const [questionNumber, setQuestionNumber] = React.useState<"?" | number>("?");

  React.useEffect(() => {
    let isValid = true;
    robotoff
      .questions(
        {
          insightType: "label",
          valueTag: tag,
        },
        1,
        1,
      )
      .then(({ data }) => {
        if (isValid) {
          setQuestionNumber(data?.count ?? 0);
        }
      });
    return () => {
      isValid = false;
    };
  }, [tag]);

  return (
    <div style={{ minWidth: 200, maxWidth: 350 }}>
      <Badge
        sx={{
          width: "100%",
          height: "100%",
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
        <Card
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardMedia
            component="img"
            height="150"
            image={logo}
            alt=""
            sx={{ objectFit: "contain" }}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography gutterBottom variant="h5" component="div">
              {label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {message} {link && <MuiLink href={link}>More info</MuiLink>}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              variant="outlined"
              size="small"
              component={Link}
              to={questionsUrl}
            >
              Questions
            </Button>

            {/* <Button
              variant="outlined"
              size="small"
              component={Link}
              to={logoQuestionsUrl}
            >
              Annotation
            </Button> */}

            <Button
              variant="outlined"
              size="small"
              component={Link}
              to={logoAnnotationUrl}
            >
              Search
            </Button>
          </CardActions>
        </Card>
      </Badge>
    </div>
  );
};

export default DashboardCard;
