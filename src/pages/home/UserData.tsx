import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { CircularProgress } from "@mui/material";

import { OFF_URL } from "../../const";

const fetchUserData = async (userName: string) => {
  const editorPromise = axios
    .get(`${OFF_URL}/editor/${userName}.json?fields=count`)
    .then(({ data }) => {
      return data?.count;
    })
    .catch(() => undefined);
  const contributorPromise = axios
    .get(`${OFF_URL}/contributor/${userName}.json?fields=count`)
    .then(({ data }) => {
      return data?.count;
    })
    .catch(() => undefined);
  const photographerPromise = axios
    .get(`${OFF_URL}/photographer/${userName}.json?fields=count`)
    .then(({ data }) => {
      return data?.count;
    })
    .catch(() => undefined);

  const [editorCount, contributorCount, photographerCount] = await Promise.all([
    editorPromise,
    contributorPromise,
    photographerPromise,
  ]);

  return { editorCount, contributorCount, photographerCount };
};

type CountCardProps = {
  translationKey: string;
  value: number | string;
};

function CountCard(props: CountCardProps) {
  const { translationKey, value } = props;

  const { t } = useTranslation();

  return (
    <Card sx={{ width: 300 }} elevation={3}>
      <CardContent>
        <Typography
          sx={{ fontSize: 18, mb: 0 }}
          color="text.primary"
          gutterBottom
        >
          {t(`home.statistics.${translationKey}.title`)}
        </Typography>
        <Typography
          sx={{ fontSize: 15, mb: 1 }}
          color="text.secondary"
          gutterBottom
        >
          {t(`home.statistics.${translationKey}.description`)}
        </Typography>
        <Typography variant="h3" color="text.primary" component="div">
          {value?.toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function UserData({ username }: { username: string }) {
  const { t } = useTranslation();

  type DataType = {
    editorCount?: number;
    contributorCount?: number;
    photographerCount?: number;
  };

  const [data, setData] = useState<DataType>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const loadData = async (username: string) => {
    setLoading(true);
    try {
      const counts = await fetchUserData(username);
      setData(counts);
    } catch {
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(username);
  }, [username]);

  return (
    <Box sx={{ p: 2, mb: 10 }}>
      <Typography component="h3" variant="h5" sx={{ pb: 3 }}>
        {t("home.statistics.title", { userName: username || "<unknown>" })}
      </Typography>

      {loading ? (
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
        <Typography color="error">{error}</Typography>
      ) : (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          {Object.entries(data).map(([countType, value]) => (
            <CountCard
              key={countType}
              translationKey={countType}
              value={value ?? "N/A"}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
