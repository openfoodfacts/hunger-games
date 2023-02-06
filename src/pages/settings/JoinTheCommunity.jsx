import { Chip, Divider, Step, StepLabel, Stepper } from "@mui/material";
import { Box } from "@mui/system";
import Link from "@mui/material/Link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const content = [
  {
    tag: "Discover our ",
    urlText: "Code of conduct",
    url: "https://world.openfoodfacts.org/code-of-conduct",
  },
  {
    tag: "Join us on ",
    urlText: "slack",
    url: "https://slack.openfoodfacts.org/",
  },
  {
    tag: "",
    urlText: "Forum",
    url: "https://forum.openfoodfacts.org/",
  },
  {
    tag: "Subscribe to our ",
    urlText: "newsletter",
    url: "https://link.openfoodfacts.org/newsletter-en",
  },
];

const JoinTheCommunity = () => {
  const CustomStepIcon = (props) => {
    return <div>{<CheckCircleIcon sx={{ color: "#a08d84" }} />}</div>;
  };

  return (
    <div style={{ flexGrow: "1" }}>
      <Divider light>
        <Chip label="Join the community" />
      </Divider>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stepper orientation="vertical">
          {content.map((step, index) => (
            <Step active key={index}>
              <StepLabel StepIconComponent={CustomStepIcon}>
                {step.tag}
                {
                  <Link href={step.url} underline="always">
                    {step.urlText}
                  </Link>
                }
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </div>
  );
};

export default JoinTheCommunity;
