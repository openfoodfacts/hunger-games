import * as React from "react";

import { useQueries } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { useTranslation } from "react-i18next";

import SmallQuestionCard from "../../components/SmallQuestionCard";
import Opportunities from "../../components/Opportunities";
import Loader from "../loader";
import { useCountry } from "../../contexts/CountryProvider";
import robotoff from "../../robotoff";

import countryNames from "../../assets/countries.json";
import greenScoreCards from "./cards";

const greenScoreImage =
  "https://static.openfoodfacts.org/images/attributes/dist/green-score-a.svg";

export default function GreenScore() {
  const { t } = useTranslation();
  const [country, setCountry] = useCountry();
  const greenScoreCountQueries = useQueries({
    queries: greenScoreCards.map(({ filterState }) => ({
      queryKey: ["question-count", filterState],
      queryFn: async () => {
        const { data } = await robotoff.questions(
          { ...filterState, with_image: true },
          1,
          1,
        );
        return data?.count ?? 0;
      },
    })),
  });
  const sortedGreenScoreCards = React.useMemo(
    () =>
      greenScoreCards
        .map((card, index) => ({
          ...card,
          questionNumber: greenScoreCountQueries[index].data,
          questionCountLoading: greenScoreCountQueries[index].isLoading,
        }))
        .sort(
          (first, second) =>
            (second.questionNumber ?? -1) - (first.questionNumber ?? -1),
        ),
    [greenScoreCountQueries],
  );

  return (
    <React.Suspense fallback={<Loader />}>
      <Box
        component="main"
        sx={(theme) => ({
          minHeight: "calc(100vh - 64px)",
          background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.action.hover} 100%)`,
        })}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
          <Paper
            component="section"
            elevation={0}
            aria-labelledby="green-score-title"
            sx={(theme) => ({
              position: "relative",
              overflow: "hidden",
              px: { xs: 3, sm: 5, md: 7 },
              py: { xs: 3, sm: 4 },
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              color: theme.palette.cafeCreme.contrastText,
              backgroundColor: theme.palette.cafeCreme.main,
              "&::after": {
                content: '""',
                position: "absolute",
                width: 220,
                height: 220,
                right: { xs: -130, sm: -70 },
                top: -130,
                borderRadius: "50%",
                backgroundColor: theme.palette.action.hover,
              },
            })}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 2, sm: 3.5 }}
              sx={{ position: "relative", zIndex: 1, alignItems: "center" }}
            >
              <Box
                sx={(theme) => ({
                  width: { xs: 92, sm: 112 },
                  height: { xs: 92, sm: 112 },
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  borderRadius: "32%",
                  backgroundColor: theme.palette.action.hover,
                })}
              >
                <Box
                  component="img"
                  src={greenScoreImage}
                  alt=""
                  sx={{ width: "72%", height: "72%", objectFit: "contain" }}
                />
              </Box>
              <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                <Typography
                  variant="overline"
                  sx={{
                    display: "block",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    opacity: 0.78,
                  }}
                >
                  {t("menu.title")}
                </Typography>
                <Typography
                  id="green-score-title"
                  component="h1"
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.1,
                    fontSize: { xs: "1.9rem", sm: "2.5rem" },
                  }}
                >
                  {t("menu.green-score")}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ maxWidth: 620, mt: 1, opacity: 0.86 }}
                >
                  {t("green-score.description")}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Box
            component="section"
            aria-labelledby="green-score-labels-title"
            sx={{ mt: { xs: 4, sm: 6 } }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                mb: 2.5,
              }}
            >
              <Box>
                <Typography
                  id="green-score-labels-title"
                  component="h2"
                  variant="h4"
                  sx={{ fontWeight: 800, lineHeight: 1.15 }}
                >
                  {t("questions.labels")}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  {t("green-score.labelsDescription")}
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(3, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                  lg: "repeat(5, minmax(0, 1fr))",
                },
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              {sortedGreenScoreCards.map((props) => (
                <SmallQuestionCard key={props.title} {...props} />
              ))}
            </Box>
          </Box>

          <Box component="section" sx={{ mt: { xs: 4, sm: 6 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{
                alignItems: { xs: "stretch", sm: "center" },
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box>
                <Typography
                  component="h2"
                  variant="h4"
                  sx={{ fontWeight: 800 }}
                >
                  {t("questions.categories")}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  {t("green-score.categoriesDescription")}
                </Typography>
              </Box>
              <TextField
                select
                size="small"
                label={t("green-score.countryLabel")}
                value={country}
                onChange={(event) => {
                  setCountry(event.target.value, "global");
                }}
                sx={{ width: { xs: "100%", sm: 210 }, flexShrink: 0 }}
              >
                {countryNames.map((country) => (
                  <MenuItem
                    value={country.countryCode}
                    key={country.countryCode}
                  >
                    {country.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Opportunities
              type="category"
              countryCode={country}
              campaign="agribalyse-category"
            />
          </Box>
        </Container>
      </Box>
    </React.Suspense>
  );
}
