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

const CountCard = (props) => {
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
};

const UserData = ({ userName }) => {
  const { t } = useTranslation();

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchUserData(userName)
      .then((counts) => setData(counts))
      .catch(() => {
        setError("Failed to fetch user data");
      })
      .finally(() => setLoading(false));
  }, [userName]);

  return (
    <Box sx={{ p: 2, mb: 10 }}>
      <Typography component="h3" variant="h5" sx={{ pb: 3 }}>
        {t("home.statistics.title", { userName: userName || "<unknown>" })}
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
};
export default UserData;
