import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import home_questions from "../../assets/home_questions.svg";
import home_logos from "../../assets/home_logos.svg";

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
    link: "/logos/deep-search",
    image: home_logos,
  },
  {
    title: "home.game_selector.cards.green_score.title",
    desc: "home.game_selector.cards.green_score.description",
    link: "/green-score",
    image:
      "https://static.openfoodfacts.org/images/attributes/dist/green-score-a.svg",
  },
  {
    title: "home.game_selector.cards.create_products.title",
    desc: "home.game_selector.cards.create_products.description",
    href: "https://prices.openfoodfacts.org/experiments/create-off-product",
    Icon: AddShoppingCartIcon,
  },
];

const HomeCards = () => {
  const { t } = useTranslation();
  return (
    <Stack
      spacing={3}
      direction={{ xs: "column", sm: "column", md: "row" }}
      sx={{
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "30px",
      }}
    >
      {cards.map((cardInfo) => (
        <Card sx={{ width: 350, height: 300 }} key={cardInfo.title}>
          <CardActionArea
            {...(cardInfo.href
              ? {
                  component: "a",
                  href: cardInfo.href,
                  target: "_blank",
                  rel: "noreferrer",
                }
              : { component: Link, to: cardInfo.link })}
          >
            {cardInfo.Icon ? (
              <Box
                sx={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <cardInfo.Icon
                  sx={{ fontSize: 96, color: "text.secondary" }}
                  aria-hidden
                />
              </Box>
            ) : (
              <CardMedia
                component="img"
                height="200"
                image={cardInfo.image}
                alt={t(cardInfo.title)}
                sx={{ objectFit: "contain" }}
              />
            )}
            <CardContent>
              <Typography variant="h5" component="div">
                {t(cardInfo.title)}
              </Typography>
              <Typography
                gutterBottom
                variant="p"
                component="div"
                sx={{
                  fontSize: 14,
                }}
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
