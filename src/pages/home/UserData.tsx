import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import CardActionArea from "@mui/material/CardActionArea";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { SvgIconProps } from "@mui/material";

import { offClient } from "../../off";
import { OFF_URL } from "../../const";
import { useQuery } from "@tanstack/react-query";

type StatDetail = {
  translationKey: string;
  apiFacet: string;
  linkFacet: string;
  Icon: React.ComponentType<SvgIconProps>;
};

type CountCardProps = StatDetail & {
  userName: string;
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

const CountCard = (props: CountCardProps) => {
  const { translationKey, apiFacet, linkFacet, Icon, userName } = props;

  const { t } = useTranslation();

  const { data: value, isPending } = useQuery({
    queryKey: ["userStat", apiFacet, userName],
    queryFn: () =>
      offClient
        .getFacetValue(apiFacet, userName, {})
        .then((response) => response.count)
        .catch(() => undefined),
  });

  const href = userName
    ? `${OFF_URL}/facets/${linkFacet}/${encodeURIComponent(userName)}`
    : undefined;

  const content = (
    <CardContent>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0 }}>
        <Icon fontSize="small" sx={{ color: "text.secondary" }} />
        <Typography
          sx={{
            color: "text.primary",
            fontSize: 18,
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
          }}
        >
          {typeof value === "number" ? value.toLocaleString() : "N/A"}
        </Typography>
      )}
    </CardContent>
  );

  return (
    <Card sx={{ width: 300 }} elevation={3}>
      {href ? (
        <CardActionArea
          component="a"
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={t(`home.statistics.${translationKey}.title`)}
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

  return (
    <Box sx={{ p: 2, mb: 10 }}>
      <Typography component="h3" variant="h5" sx={{ pb: 3 }}>
        {t("home.statistics.title", { userName: userName || "<unknown>" })}
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        {STATS.map((stat) => (
          <CountCard key={stat.translationKey} {...stat} userName={userName} />
        ))}
      </Stack>
    </Box>
  );
};
export default UserData;
