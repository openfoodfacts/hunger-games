import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import CardActionArea from "@mui/material/CardActionArea";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { SvgIconProps } from "@mui/material";
import { Link } from "react-router";

import { offClient } from "../../off";
import { OFF_URL } from "../../const";
import { useQueries } from "@tanstack/react-query";

type StatDetail = {
  translationKey: string;
  apiFacet: string;
  linkFacet: string;
  Icon: React.ComponentType<SvgIconProps>;
};

type CountCardProps = StatDetail & {
  userName: string;
  value?: number;
  isPending: boolean;
};

type UserDataProps = {
  userName: string;
};

const STATS: StatDetail[] = [
  {
    translationKey: "editorCount",
    apiFacet: "editor",
    linkFacet: "editors",
    Icon: EditIcon,
  },
  {
    translationKey: "contributorCount",
    apiFacet: "contributor",
    linkFacet: "contributors",
    Icon: AddAPhotoIcon,
  },
  {
    translationKey: "photographerCount",
    apiFacet: "photographer",
    linkFacet: "photographers",
    Icon: PhotoCameraIcon,
  },
];

const CountCard = ({
  translationKey,
  linkFacet,
  Icon,
  userName,
  value,
  isPending,
}: CountCardProps) => {
  const { t } = useTranslation();

  const href = userName
    ? `${OFF_URL}/facets/${linkFacet}/${encodeURIComponent(userName)}`
    : undefined;

  const content = (
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            display: "grid",
            placeItems: "center",
            borderRadius: 2,
            color: "primary.main",
            backgroundColor: "action.selected",
          }}
        >
          <Icon fontSize="small" />
        </Box>
        <Typography
          sx={{
            color: "text.primary",
            fontSize: 17,
            fontWeight: 700,
          }}
        >
          {t(`home.statistics.${translationKey}.title`)}
        </Typography>
      </Stack>
      <Typography
        gutterBottom
        sx={{
          color: "text.secondary",
          fontSize: 15,
          mt: 2,
          mb: 1,
        }}
      >
        {t(`home.statistics.${translationKey}.description`)}
      </Typography>
      {isPending ? (
        <Skeleton variant="text" width="60%" sx={{ fontSize: "3rem" }} />
      ) : (
        <Typography
          variant="h3"
          component="div"
          sx={{
            color: "text.primary",
            fontWeight: 700,
          }}
        >
          {typeof value === "number" ? value.toLocaleString() : "0"}
        </Typography>
      )}
    </CardContent>
  );

  return (
    <Card
      sx={(theme) => ({
        width: "100%",
        height: "100%",
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
      })}
    >
      {href ? (
        <CardActionArea
          component="a"
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={t(`home.statistics.${translationKey}.title`)}
          sx={{ height: "100%" }}
        >
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
};

const UserData = ({ userName }: UserDataProps) => {
  const { t } = useTranslation();
  const statQueries = useQueries({
    queries: STATS.map(({ apiFacet }) => ({
      queryKey: ["userStat", apiFacet, userName],
      queryFn: () =>
        offClient
          .getFacetValue(apiFacet, userName, {})
          .then((response) => response.count)
          .catch(() => undefined),
    })),
  });
  const isPending = statQueries.some((query) => query.isPending);
  const availableStats = STATS.map((stat, index) => ({
    ...stat,
    value: statQueries[index].data,
  })).filter(({ value }) => typeof value === "number");

  return (
    <Box
      component="section"
      aria-labelledby="user-statistics-title"
      sx={{ mt: 6 }}
    >
      <Typography
        id="user-statistics-title"
        component="h2"
        variant="h5"
        sx={{ pb: 2.5, fontWeight: 700 }}
      >
        {t(
          userName
            ? "home.statistics.title"
            : "home.statistics.title_without_name",
          { userName },
        )}
      </Typography>

      {isPending ? (
        <StatsGrid>
          {STATS.map((stat) => (
            <CountCard
              key={stat.translationKey}
              {...stat}
              userName={userName}
              isPending
            />
          ))}
        </StatsGrid>
      ) : availableStats.length > 0 ? (
        <StatsGrid>
          {availableStats.map((stat) => (
            <CountCard
              key={stat.translationKey}
              {...stat}
              userName={userName}
              isPending={false}
            />
          ))}
        </StatsGrid>
      ) : (
        <Box
          sx={(theme) => ({
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            p: { xs: 2, sm: 2.5 },
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.action.hover,
          })}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              borderRadius: 2,
              color: "primary.main",
              backgroundColor: "action.selected",
            }}
          >
            <VolunteerActivismIcon aria-hidden />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("home.statistics.empty_state.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {t("home.statistics.empty_state.description")}
            </Typography>
          </Box>
          <Button
            component={Link as React.ElementType}
            to="/questions"
            variant="contained"
            sx={{ flexShrink: 0 }}
          >
            {t("home.statistics.empty_state.action")}
          </Button>
        </Box>
      )}
    </Box>
  );
};

const StatsGrid = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr",
        sm: "repeat(3, minmax(0, 1fr))",
      },
      gap: 2,
    }}
  >
    {children}
  </Box>
);
export default UserData;
