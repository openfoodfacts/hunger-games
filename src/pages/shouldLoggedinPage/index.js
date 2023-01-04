import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const ShouldLoggedinPage = () => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
      Restricted page
    </Typography>
    <Typography>Advenced game are restricted to connected user</Typography>
  </Box>
);
export default ShouldLoggedinPage;
