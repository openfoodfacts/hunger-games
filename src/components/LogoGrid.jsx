import * as React from "react";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";
import EditIcon from "@mui/icons-material/Edit";
import LinkIcon from "@mui/icons-material/Link";
import { useTheme } from "@mui/system";

const externalLogoURL = (id) => `/logos?logo_id=${id}&count=50`;
const editLogoURL = (id) => `/logos/${id}`;

const LogoCard = React.memo(({ selected, id, toggleLogoSelection, annotation_value, image, annotation_type, distance }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Card
      disabled={!!annotation_type}
      sx={{
        width: 180,
        marginBottom: "20px",
        boxSizing: "border-box",
        backgroundColor: selected ? theme.palette.action.active : annotation_type ? theme.palette.action.disabled : undefined,
        // border: selected ? `solid ${theme.palette.primary.main} ${theme.spacing(1)}` : undefined,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", padding: 1 }}>
        <Tooltip title="Edit this logo">
          <IconButton size="small" component={Link} to={editLogoURL(id)}>
            <EditIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="See similar logos">
          <IconButton size="small" component={Link} to={externalLogoURL(id)}>
            <LinkIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />
      <CardActionArea disabled={!!annotation_type} onClick={() => toggleLogoSelection(id)} sx={{ flexGrow: 1 }}>
        <CardMedia component="img" height="150px" width="180px" loading="lazy" image={image} sx={{ objectFit: "contain" }} />
        <Typography sx={{ padding: 1 }} variant="caption">
          {distance !== undefined && `${t("logos.distance")} ${distance.toFixed(1)}`}
        </Typography>
        <br />
        <Typography sx={{ padding: 1 }} variant="caption">
          {(annotation_type || annotation_value) && `${t("logos.annotation")} ${annotation_value || ""} (${annotation_type || ""})`}
        </Typography>
      </CardActionArea>
    </Card>
  );
});

const LogoGrid = (props) => {
  const { logos, toggleLogoSelection } = props;

  return (
    <Box
      sx={{
        paddingTop: 5,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      }}
    >
      {logos.map((logo) => (
        <LogoCard
          key={logo.id}
          selected={logo.selected}
          id={logo.id}
          toggleLogoSelection={toggleLogoSelection}
          annotation_value={logo.annotation_value}
          image={logo.image.src}
          annotation_type={logo.annotation_type}
          distance={logo.distance}
        />
      ))}
    </Box>
  );
};

export default LogoGrid;
