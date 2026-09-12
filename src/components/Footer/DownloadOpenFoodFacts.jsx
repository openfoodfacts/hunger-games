import { Box, useMediaQuery, useTheme } from "@mui/material";

export default function DownloadOpenFoodFacts() {
  const theme = useTheme();
  const systemPrefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const needsLightBackdrop =
    theme.palette.mode === "dark" && !systemPrefersDark;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        minHeight: 56,
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          bgcolor: needsLightBackdrop ? "#f5f5f5" : "transparent",
          borderRadius: needsLightBackdrop ? "16px" : 0,
          px: needsLightBackdrop ? 3 : 0,
          py: needsLightBackdrop ? 2 : 0,
          display: "inline-flex",
        }}
      >
        <mobile-badges></mobile-badges>
      </Box>
    </Box>
  );
}
