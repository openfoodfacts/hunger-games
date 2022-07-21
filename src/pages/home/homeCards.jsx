import * as React from "react";

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import home1 from "../../assets/home1.png";
import home2 from "../../assets/home2.png";
import home3 from "../../assets/home3.png";

const content = [
  {
    title: "Questions",
    desc: "Tell us if the given image answers the questions",
    link: "/questions",
    image: home1,
  },
  {
    title: "Logos",
    desc: "Find all the logos matching the given logo",
    link: "/logos",
    image: home2,
  },
  {
    title: "Eco-score",
    desc: "Annotate the questions with the highest value",
    link: "eco-score",
    image: home3,
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
      {content.map((props) => (
        <a href={props.link} style={{ textDecoration: "none" }}>
          <Card sx={{ width: 350, height: 300 }} key={props.title}>
            <CardMedia
              component="img"
              height="200"
              image={props.image}
              alt=""
              sx={{ objectFit: "contain" }}
            />
            <CardContent>
              <Typography variant="h5" component="div">
                {props.title}
              </Typography>
              <Typography
                gutterBottom
                variant="p"
                component="div"
                fontSize={14}
              >
                {props.desc}
              </Typography>
            </CardContent>
          </Card>
        </a>
      ))}
    </Stack>
  );
};

export default HomeCard;
