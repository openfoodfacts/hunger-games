import * as React from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from "@mui/material/CardActionArea";
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
        <Card sx={{ width: 350, height: 300 }} key={props.title}>
<<<<<<< HEAD
	        <CardActionArea component={props.link} href={props.title}>
=======
	 <CardActionArea component={Link} href={targetUrl}>
>>>>>>> 24d9569bb0a34e7ae86ea6899954bcc0e8fe7382
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
<<<<<<< HEAD
          </CardActionArea>
        </Card>
=======
          </Card>
        </a>
>>>>>>> 24d9569bb0a34e7ae86ea6899954bcc0e8fe7382
      ))}
    </Stack>
  );
};

<<<<<<< HEAD
export default HomeCards;
=======
export default HomeCard;
>>>>>>> 24d9569bb0a34e7ae86ea6899954bcc0e8fe7382
