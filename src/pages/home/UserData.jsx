import * as React from "react";
import axios from "axios";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

const fetchUserData = async (userName) => {
  console.log(userName);

  const editorPromise = axios
    .get(`https://world.openfoodfacts.org/editor/${userName}.json?fields=count`)
    .then(({ data }) => {
      console.log({ data });
      return data?.count;
    })
    .catch(() => undefined);
  const contributorPromise = axios
    .get(
      `https://world.openfoodfacts.org/contributor/${userName}.json?fields=count`
    )
    .then(({ data }) => {
      console.log({ data });
      return data?.count;
    })
    .catch(() => undefined);
  const photographerPromise = axios
    .get(
      `https://world.openfoodfacts.org/photographer/${userName}.json?fields=count`
    )
    .then(({ data }) => {
      console.log({ data });
      return data?.count;
    })
    .catch(() => undefined);

  const [editorCount, contributorCount, photographerCount] = await Promise.all([
    editorPromise,
    contributorPromise,
    photographerPromise,
  ]);

  console.log(editorCount, contributorCount, photographerCount);
  return { editorCount, contributorCount, photographerCount };
};

const CountCard = (props) => {
  const { translationKey, value } = props;

  return (
    <Card sx={{ width: 300 }} elevation={3}>
      <CardContent>
        <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
          {translationKey}
        </Typography>
        <Typography variant="h3" color="text.primary" component="div">
          {value.toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

const UserData = ({ userName }) => {
  const [counts, setCounts] = React.useState({});

  React.useEffect(() => {
    fetchUserData(userName)
      .then((counts) => {
        console.log({ counts });
        setCounts(counts);
      })
      .catch(() => {});
  }, [userName]);
  console.log(counts);
  return (
    <Box sx={{ p: 2, mb: 10 }}>
      <Typography component="h3" variant="h5" sx={{ pb: 3 }}>
        {userName} statistics:
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        {Object.keys(counts).map((countType) => (
          <CountCard
            key={countType}
            translationKey={countType}
            value={counts[countType]}
          />
        ))}
      </Stack>
    </Box>
  );
};
export default UserData;
