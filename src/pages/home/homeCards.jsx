import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import home_questions from "../../assets/home_questions.png";
import home_logos from "../../assets/home_logos.png";
import home_ecoscore from "../../assets/home_ecoscore.png";

const cards = [
  {
    title: "home.game_selector.cards.questions.title",
    desc: "home.game_selector.cards.questions.description",
    link: "/questions",
    image: home_questions,
  },
  {
    title: "home.game_selector.cards.logos.title",
    desc: "home.game_selector.cards.logos.description",
    link: "/logos",
    image: home_logos,
  },
  {
    title: "home.game_selector.cards.eco_score.title",
    desc: "home.game_selector.cards.eco_score.description",
    link: "/eco-score",
    image: home_ecoscore,
  },
];

const HomeCards = () => {
  const { t } = useTranslation();
  return (
    <Stack
      spacing={3}
      direction={{ xs: "column", sm: "column", md: "row" }}
      alignItems="center"
      justifyContent="center"
      sx={{
        marginBottom: "30px",
      }}
    >
      {cards.map((cardInfo) => (
        <Card sx={{ width: 350, height: 300 }} key={cardInfo.title}>
          <CardActionArea component={Link} to={cardInfo.link}>
            <CardMedia
              component="img"
              height="200"
              image={cardInfo.image}
              alt={t(cardInfo.title)}
              sx={{ objectFit: "contain" }}
            />
            <CardContent>
              <Typography variant="h5" component="div">
                {t(cardInfo.title)}
              </Typography>
              <Typography
                gutterBottom
                variant="p"
                component="div"
                fontSize={14}
              >
                {t(cardInfo.desc)}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Stack>
  );
};

export default HomeCards;
