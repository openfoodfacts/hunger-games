import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const ShouldLoggedinPage = () => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
      Restricted page
    </Typography>
    <Typography>Advanced games are restricted to connected users</Typography>
  </Box>
);
export default ShouldLoggedinPage;
