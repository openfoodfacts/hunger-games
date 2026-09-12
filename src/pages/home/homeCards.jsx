import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import home_questions from "../../assets/home_questions.svg";
import home_logos from "../../assets/home_logos.svg";
import home_greenscore from "../../assets/home_greenscore.svg";
import home_ingredients_spellcheck from "../../assets/home_ingredients_spellcheck.svg";
import home_ingredients_crop from "../../assets/home_ingredients_crop.svg";
import home_nutrition from "../../assets/home_nutrition.svg";
import home_prices_validate from "../../assets/home_prices_validate.svg";
import home_prices_create_product from "../../assets/home_prices_create_product.svg";
import home_packaging from "../../assets/home_packaging.svg";
import home_weights from "../../assets/home_weights.svg";
import home_brands from "../../assets/home_brands.svg";
import home_labels from "../../assets/home_labels.svg";
import home_open_beauty_facts from "../../assets/home_open_beauty_facts.svg";
import home_open_pet_food_facts from "../../assets/home_open_pet_food_facts.svg";
import home_open_products_facts from "../../assets/home_open_products_facts.svg";

const cards = [
  // FEATURED / CORE ANNOTATION GAMES
  {
    id: "questions",
    title: "home.game_selector.cards.questions.title",
    desc: "home.game_selector.cards.questions.description",
    link: "/questions",
    image: home_questions,
    category: "featured",
  },
  {
    id: "logos",
    title: "home.game_selector.cards.logos.title",
    desc: "home.game_selector.cards.logos.description",
    link: "/logos/deep-search",
    image: home_logos,
    category: "featured",
  },
  {
    id: "green_score",
    title: "home.game_selector.cards.green_score.title",
    desc: "home.game_selector.cards.green_score.description",
    link: "/green-score",
    image: home_greenscore,
    category: "featured",
  },
  {
    id: "nutrition",
    title: "home.game_selector.cards.nutrition.title",
    desc: "home.game_selector.cards.nutrition.description",
    link: "/nutrition",
    image: home_nutrition,
    category: "featured",
  },
  {
    id: "ingredient_spellcheck",
    title: "home.game_selector.cards.ingredient_spellcheck.title",
    desc: "home.game_selector.cards.ingredient_spellcheck.description",
    link: "/ingredient-spellcheck",
    image: home_ingredients_spellcheck,
    category: "featured",
  },
  {
    id: "ingredient_detection",
    title: "home.game_selector.cards.ingredient_detection.title",
    desc: "home.game_selector.cards.ingredient_detection.description",
    link: "/ingredient-detection",
    image: home_ingredients_crop,
    category: "featured",
  },

  // QUESTION CHALLENGES BY TYPE
  {
    id: "questions_packaging",
    title: "home.game_selector.cards.questions_packaging.title",
    desc: "home.game_selector.cards.questions_packaging.description",
    link: "/questions?type=packaging",
    image: home_packaging,
    category: "questions",
  },
  {
    id: "questions_weights",
    title: "home.game_selector.cards.questions_weights.title",
    desc: "home.game_selector.cards.questions_weights.description",
    link: "/questions?type=product_weight",
    image: home_weights,
    category: "questions",
  },
  {
    id: "questions_brands",
    title: "home.game_selector.cards.questions_brands.title",
    desc: "home.game_selector.cards.questions_brands.description",
    link: "/questions?type=brand",
    image: home_brands,
    category: "questions",
  },
  {
    id: "questions_labels",
    title: "home.game_selector.cards.questions_labels.title",
    desc: "home.game_selector.cards.questions_labels.description",
    link: "/questions?type=label",
    image: home_labels,
    category: "questions",
  },

  // MOVE PRODUCTS TO SISTER PROJECTS
  {
    id: "move_open_beauty_facts",
    title: "home.game_selector.cards.move_open_beauty_facts.title",
    desc: "home.game_selector.cards.move_open_beauty_facts.description",
    link: "/questions?type=category&value_tag=en:open-beauty-facts",
    image: home_open_beauty_facts,
    category: "move_products",
    badge: "Open Beauty Facts",
  },
  {
    id: "move_open_pet_food_facts",
    title: "home.game_selector.cards.move_open_pet_food_facts.title",
    desc: "home.game_selector.cards.move_open_pet_food_facts.description",
    link: "/questions?type=category&value_tag=en:open-pet-food-facts",
    image: home_open_pet_food_facts,
    category: "move_products",
    badge: "Open Pet Food Facts",
  },
  {
    id: "move_open_products_facts",
    title: "home.game_selector.cards.move_open_products_facts.title",
    desc: "home.game_selector.cards.move_open_products_facts.description",
    link: "/questions?type=category&value_tag=en:open-products-facts",
    image: home_open_products_facts,
    category: "move_products",
    badge: "Open Products Facts",
  },

  // OPEN PRICES PROMOS
  {
    id: "prices_validation",
    title: "home.game_selector.cards.prices_validation.title",
    desc: "home.game_selector.cards.prices_validation.description",
    href: "https://prices.openfoodfacts.org/prices/add/validate",
    image: home_prices_validate,
    category: "open_prices",
    badge: "Open Prices",
  },
  {
    id: "prices_create_product",
    title: "home.game_selector.cards.prices_create_product.title",
    desc: "home.game_selector.cards.prices_create_product.description",
    href: "https://prices.openfoodfacts.org/experiments/create-off-product",
    image: home_prices_create_product,
    category: "open_prices",
    badge: "Open Prices",
  },
];

const CATEGORIES = [
  { id: "all", labelKey: "home.game_selector.categories.all" },
  { id: "featured", labelKey: "home.game_selector.categories.featured" },
  { id: "questions", labelKey: "home.game_selector.categories.questions" },
  {
    id: "move_products",
    labelKey: "home.game_selector.categories.move_products",
  },
  { id: "open_prices", labelKey: "home.game_selector.categories.open_prices" },
];

const HomeCard = ({ cardInfo, t }) => {
  const { title, desc, image, Icon, badge } = cardInfo;
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
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
          >
            <Typography component="h3" variant="h6" sx={{ fontWeight: 700 }}>
              {t(title)}
            </Typography>
            {badge && (
              <Chip
                label={badge}
                size="small"
                sx={{ flexShrink: 0, fontWeight: 700 }}
              />
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t(desc)}
          </Typography>
        </CardContent>
        {cardInfo.href && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              px: 2.5,
              pb: 2.25,
              alignItems: "center",
              color: "primary.main",
            }}
          >
            <OpenInNewRoundedIcon fontSize="small" aria-hidden />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {t("home.game_selector.external_link")}
            </Typography>
          </Stack>
        )}
      </CardActionArea>
    </Card>
  );
};

const HomeCards = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = React.useState("all");

  const filteredCards = React.useMemo(() => {
    if (selectedCategory === "all") {
      return cards;
    }
    return cards.filter((card) => card.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 1,
          mb: 3,
        }}
      >
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.id}
            clickable
            color={selectedCategory === cat.id ? "primary" : "default"}
            variant={selectedCategory === cat.id ? "filled" : "outlined"}
            aria-pressed={selectedCategory === cat.id}
            label={`${t(cat.labelKey)} (${
              cat.id === "all"
                ? cards.length
                : cards.filter((c) => c.category === cat.id).length
            })`}
            onClick={() => setSelectedCategory(cat.id)}
            sx={{
              fontWeight: selectedCategory === cat.id ? 700 : 500,
              fontSize: "0.875rem",
              py: 2,
              px: 0.5,
              borderRadius: 3,
            }}
          />
        ))}
      </Stack>

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
        {filteredCards.map((cardInfo) => (
          <HomeCard key={cardInfo.id} cardInfo={cardInfo} t={t} />
        ))}
      </Box>
    </Box>
  );
};

export default HomeCards;
