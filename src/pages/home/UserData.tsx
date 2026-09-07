import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import CardActionArea from "@mui/material/CardActionArea";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { CircularProgress, SvgIconProps } from "@mui/material";

import { offClient } from "../../off";
import { OFF_URL } from "../../const";
import { useQuery } from "@tanstack/react-query";

type CountCardProps = {
  translationKey: string;
  value: number | null | undefined;
  Icon: React.ComponentType<SvgIconProps>;
  href?: string;
};

const STAT_DETAILS: Record<
  string,
  { facet: string; Icon: React.ComponentType<SvgIconProps> }
> = {
  contributorCount: { facet: "contributors", Icon: AddAPhotoIcon },
  editorCount: { facet: "editors", Icon: EditIcon },
  photographerCount: { facet: "photographers", Icon: PhotoCameraIcon },
};

type UserDataProps = {
  userName: string;
};

const fetchUserData = async (userName: string) => {
  const editorPromise = offClient
    .getFacetValue("editor", userName, {})
    .then((value) => value.count)
    .catch(() => undefined);

  const contributorPromise = offClient
    .getFacetValue("contributor", userName, {})
    .then((value) => value.count)
    .catch(() => undefined);
  const photographerPromise = offClient
    .getFacetValue("photographer", userName, {})
    .then((value) => value.count)
    .catch(() => undefined);

  const [editorCount, contributorCount, photographerCount] = await Promise.all([
    editorPromise,
    contributorPromise,
    photographerPromise,
  ]);

  return { editorCount, contributorCount, photographerCount };
};

const CountCard = (props: CountCardProps) => {
  const { translationKey, value, Icon, href } = props;

  const { t } = useTranslation();

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
      <Typography
        variant="h3"
        component="div"
        sx={{
          color: "text.primary",
        }}
      >
        {typeof value === "number" ? value.toLocaleString() : "N/A"}
      </Typography>
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
  const { data, isLoading, error } = useQuery({
    queryKey: ["userStats", userName],
    queryFn: async () => {
      const data = await fetchUserData(userName);
      return data;
    },
  });

  return (
    <Box sx={{ p: 2, mb: 10 }}>
      <Typography component="h3" variant="h5" sx={{ pb: 3 }}>
        {t("home.statistics.title", { userName: userName || "<unknown>" })}
      </Typography>

      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error.message}</Typography>
      ) : (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          {Object.entries(data ?? {}).map(([countType, value]) => {
            const details = STAT_DETAILS[countType];
            return (
              <CountCard
                key={countType}
                translationKey={countType}
                value={value}
                Icon={details.Icon}
                href={
                  userName
                    ? `${OFF_URL}/facets/${details.facet}/${encodeURIComponent(userName)}`
                    : undefined
                }
              />
            );
          })}
        </Stack>
      )}
    </Box>
  );
};
export default UserData;
