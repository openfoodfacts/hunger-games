import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { LOGOS, DASHBOARD } from "./dashboardDefinition";
import DashboardCard from "./DashboardCard";
import { Link, useParams } from "react-router";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { value, index, ...other } = props;

  // Keep logos mounted to avoid loading again the number of remaining questions
  const [hasBeenVisible, setHasBeenVisible] = React.useState(value === index);
  if (value === index && !hasBeenVisible) {
    setHasBeenVisible(true);
  }

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      sx={{ flexGrow: 1 }}
      {...other}
    >
      {hasBeenVisible && (
        <Box
          sx={{
            p: 3,
          }}
        >
          <Typography>{DASHBOARD[index].title}</Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, 350px)",
              gap: "30px",
            }}
          >
            {DASHBOARD[index].logos.map((tag) => (
              <DashboardCard key={tag} {...LOGOS[tag]} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export default function VerticalTabs() {
  const { dasboardId } = useParams();

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [value, setValue] = React.useState(
    DASHBOARD.findIndex(({ tag }) => tag === dasboardId) || 0,
  );

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <React.Suspense>
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: isDesktop ? "row" : "column",
          height: isDesktop ? "calc( 100vh - 100px)" : undefined,
          width: isDesktop ? undefined : "100vw",
        }}
      >
        <Tabs
          orientation={isDesktop ? "vertical" : "horizontal"}
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Logo categories"
          sx={{
            ...(isDesktop ? { borderRight: 1 } : { borderBottom: 1 }),
            borderColor: "divider",
          }}
        >
          {DASHBOARD.map(({ tag, title }, index) => (
            <Tab
              label={title}
              key={index}
              {...a11yProps(index)}
              component={Link}
              to={`/dashboard/${tag}`}
            />
          ))}
        </Tabs>
        {DASHBOARD.map(({ tag, title }, index) => (
          <TabPanel value={value} key={index} index={index} />
        ))}
      </Box>
    </React.Suspense>
  );
}
