import { Chip, Divider, Step, StepLabel, Stepper } from "@mui/material";
import { Box } from "@mui/system";
import Link from "@mui/material/Link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";

const content = [
  {
    tag: "settings.join_the_community.discover_our",
    urlText: "settings.join_the_community.code_of_conduct",
    url: "https://world.openfoodfacts.org/code-of-conduct",
  },
  {
    tag: "settings.join_the_community.join_us_on",
    urlText: "slack",
    url: "https://slack.openfoodfacts.org/",
  },
  {
    tag: "",
    urlText: "settings.join_the_community.forum",
    url: "https://forum.openfoodfacts.org/",
  },
  {
    tag: "settings.join_the_community.subscribe_to_our",
    urlText: "settings.join_the_community.newsletter",
    url: "https://link.openfoodfacts.org/newsletter-en",
  },
];

const JoinTheCommunity = () => {
  const { t } = useTranslation();
  const CustomStepIcon = (props) => {
    return <div>{<CheckCircleIcon sx={{ color: "#a08d84" }} />}</div>;
  };

  return (
    <div style={{ flexGrow: "1" }} className="OFF-join">
      <Divider light>
        <Chip label={t("settings.join_community")} />
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
                {t(step.tag) + " "}
                {
                  <Link href={step.url} underline="always">
                    {t(step.urlText)}
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
