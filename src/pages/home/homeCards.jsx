import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

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

const HomeCard = ({ cardInfo, t }) => {
  const { title, desc, image, Icon } = cardInfo;
  const actionProps = cardInfo.href
    ? {
        component: "a",
        href: cardInfo.href,
        target: "_blank",
        rel: "noreferrer",
      }
    : { component: Link, to: cardInfo.link };

  return (
    <Card
      sx={(theme) => ({
        minWidth: 0,
        height: "100%",
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
        transition: theme.transitions.create(["transform", "box-shadow"]),
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[2],
        },
      })}
    >
      <CardActionArea
        {...actionProps}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <Box
          sx={(theme) => ({
            height: { xs: 170, sm: 190 },
            display: "grid",
            placeItems: "center",
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.background.paper
                : theme.palette.secondary.light,
          })}
        >
          {Icon ? (
            <Icon
              sx={(theme) => ({
                fontSize: 84,
                color: theme.palette.primary.main,
              })}
              aria-hidden
            />
          ) : (
            <Box
              component="img"
              src={image}
              alt={t(title)}
              sx={{
                width: "80%",
                height: "80%",
                objectFit: "contain",
              }}
            />
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
          <Typography component="h3" variant="h6" sx={{ fontWeight: 700 }}>
            {t(title)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t(desc)}
          </Typography>
        </CardContent>
        <Stack
          direction="row"
          sx={{
            px: 2.5,
            pb: 2.25,
            alignItems: "center",
            justifyContent: "space-between",
            color: "primary.main",
          }}
        >
          {cardInfo.href && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <OpenInNewRoundedIcon fontSize="small" aria-hidden />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {t("home.game_selector.external_link")}
              </Typography>
            </Stack>
          )}
          <ArrowForwardRoundedIcon fontSize="small" aria-hidden />
        </Stack>
      </CardActionArea>
    </Card>
  );
};

const HomeCards = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(4, minmax(0, 1fr))",
        },
        gap: 2.5,
        alignItems: "stretch",
      }}
    >
      {cards.map((cardInfo) => (
        <HomeCard key={cardInfo.title} cardInfo={cardInfo} t={t} />
      ))}
    </Box>
  );
};

export default HomeCards;
