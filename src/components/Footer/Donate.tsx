import Box from "@mui/material/Box";

const Donate = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        minHeight: 56,
        alignItems: "center",
      }}
    >
      <donation-banner></donation-banner>
    </Box>
  );
};

export default Donate;
