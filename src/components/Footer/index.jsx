import Box from "@mui/material/Box";
import Donate from "./Donate";
import JoinTheCommunity from "./JoinTheCommunity";
import DiscoverTheProject from "./DiscoverTheProject";
import OpenFoodFacts from "./OpenFoodFacts";
import DownloadOpenFoodFacts from "./DownloadOpenFoodFacts";

const FooterWithLinks = () => {
  return (
    <Box
      sx={{
        "& .OFF-donate,& .OFF-download": {
          py: 2,
        },
        "& .OFF-discover-group": {
          py: 4,
        },
      }}
    >
      {/* Donate to open food facts */}
      <Donate />
      {/*App download links for different platforms*/}
      <DownloadOpenFoodFacts />
      <Box
        sx={{
          mx: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: "10px", sm: "" },
        }}
        className="OFF-discover-group"
      >
        {/* Different community platform links */}
        <JoinTheCommunity />
        {/* Links for project details */}
        <DiscoverTheProject />
      </Box>
      {/* Footer with OFF logo and social links */}
      <OpenFoodFacts />
    </Box>
  );
};

export default FooterWithLinks;
