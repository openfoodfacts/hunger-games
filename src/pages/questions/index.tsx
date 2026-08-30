import QuestionFilter from "../../components/QuestionFilter";
import QuestionDisplay from "./QuestionDisplay";
import ProductInformation from "./ProductInformation";
import UserData from "./UserData";

import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";

function QuestionsConsumer() {
  return (
    <Box
      sx={{
        bgcolor: "action.hover",
        minHeight: "calc(100vh - 64px)",
        "& .MuiButton-contained": {
          boxShadow: "none",
          "&:hover, &:active": { boxShadow: "none" },
        },
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 1.5, sm: 2.5 } }}>
        <Grid container spacing={{ xs: 2, lg: 3 }} alignItems="flex-start">
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                minHeight: { md: "calc(100vh - 116px)" },
                height: { md: "calc(100vh - 116px)" },
                overflow: { md: "hidden" },
              }}
            >
              <Stack
                direction="column"
                sx={{ minHeight: "inherit", height: { md: "100%" } }}
              >
                <QuestionFilter />
                <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
                <QuestionDisplay />
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <Stack spacing={2}>
              <Paper
                variant="outlined"
                sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3 }}
              >
                <ProductInformation />
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <UserData />
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* pre-fetch images of the next question */}
      {/* {nextImages.map((source_image_url) => (
        <link rel="prefetch" key={source_image_url} href={source_image_url} />
      ))} */}
    </Box>
  );
}

export default function Questions() {
  return <QuestionsConsumer />;
}
