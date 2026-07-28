import { Box } from "@mui/material";

export default function DownloadOpenFoodFacts() {
  return (
    <Box className="OFF-download" sx={{ display: "flex", justifyContent: "center" }}>
      <Box
        sx={{
          // light panel so the badge's black text stays readable in dark mode
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#f5f5f5" : "transparent",
          borderRadius: "16px",
          px: 3,
          py: 2,
          display: "inline-flex",
        }}
      >
        <mobile-badges></mobile-badges>
      </Box>
    </Box>
  );
}
