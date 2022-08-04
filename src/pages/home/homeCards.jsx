import * as React from "react";
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
    title: "Questions",
    desc: "Tell us if the given image answers the questions",
    link: "/questions",
    image: home_questions,
  },
  {
    title: "Logos",
    desc: "Find all the logos matching the given logo",
    link: "/logos",
    image: home_logos,
  },
  {
    title: "Eco-score",
    desc: "Annotate the questions with the highest value",
    link: "/eco-score",
    image: home_ecoscore,
  },
];

const HomeCards = () => {
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
              alt={cardInfo.title}
              sx={{ objectFit: "contain" }}
            />
            <CardContent>
              <Typography variant="h5" component="div">
                {cardInfo.title}
              </Typography>
              <Typography
                gutterBottom
                variant="p"
                component="div"
                fontSize={14}
              >
                {cardInfo.desc}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Stack>
  );
};

export default HomeCards;
