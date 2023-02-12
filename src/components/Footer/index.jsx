import { Box } from "@mui/system";
import Donate from "./Donate";
import JoinTheCommunity from "./JoinTheCommunity";
import DiscoverTheProject from "./DiscoverTheProject";
import OpenFoodFacts from "./OpenFoodFacts";
import DownloadOpenFoodFacts from "./DownloadOpenFoodFacts";

const FooterWithLinks = () => {
  return (
    <>
      <br />
      {/* Donate to open food facts */}
      <Donate />
      <br />
      {/*App download links for different platforms*/}
      <DownloadOpenFoodFacts />
      <br />
      <br />
      <Box
        sx={{
          mx: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: "10px", sm: "" },
        }}
      >
        {/* Different community platform links */}
        <JoinTheCommunity />
        {/* Links for project details */}
        <DiscoverTheProject />
      </Box>
      <br />
      {/* Footer with OFF logo and social links */}
      <OpenFoodFacts />
    </>
  );
};

export default FooterWithLinks;
