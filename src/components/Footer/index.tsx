import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Donate from "./Donate";
import JoinTheCommunity from "./JoinTheCommunity";
import DiscoverTheProject from "./DiscoverTheProject";
import OpenFoodFacts from "./OpenFoodFacts";
import DownloadOpenFoodFacts from "./DownloadOpenFoodFacts";

export default function FooterWithLinks() {
  return (
    <Box
      component="footer"
      sx={(theme) => ({
        backgroundColor: theme.palette.background.default,
        borderTop: `1px solid ${theme.palette.divider}`,
      })}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
        <Box sx={{ display: "grid", gap: 2.5 }}>
          <Paper
            variant="outlined"
            sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: 3 }}
          >
            <Donate />
          </Paper>
          <Paper
            variant="outlined"
            sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: 3 }}
          >
            <DownloadOpenFoodFacts />
          </Paper>
        </Box>
      </Container>
      <Box
        sx={(theme) => ({
          backgroundColor: theme.palette.action.hover,
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2.5,
            }}
          >
            <Paper
              variant="outlined"
              sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}
            >
              <JoinTheCommunity />
            </Paper>
            <Paper
              variant="outlined"
              sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}
            >
              <DiscoverTheProject />
            </Paper>
          </Box>
        </Container>
      </Box>
      <OpenFoodFacts />
    </Box>
  );
}
