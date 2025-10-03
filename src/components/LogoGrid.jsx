import * as React from "react";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Checkbox from "@mui/material/Checkbox";

import { Link } from "react-router";

import { useTranslation } from "react-i18next";
import EditIcon from "@mui/icons-material/Edit";
import LinkIcon from "@mui/icons-material/Link";
import { useTheme } from "@mui/system";
import LogoForm from "../components/LogoForm";
import { IS_DEVELOPMENT_MODE } from "../const";
import robotoff from "../robotoff";

const externalLogoURL = (id) => `/logos?logo_id=${id}&count=50`;

// eslint-disable-next-line react/display-name
const LogoCard = React.memo(
  ({
    selected,
    id,
    index,
    selectionApiRef,
    annotation_value,
    image,
    annotation_type,
    distance,
    readOnly,
    editOpen,
  }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [editing, setEditing] = React.useState(editOpen);

    const updateLogo = React.useCallback(
      async (data) => {
        if (data == null) {
          return;
        }
        const { type, value } = data;
        if (!IS_DEVELOPMENT_MODE) {
          await robotoff.updateLogo(id, value, type);
        }
      },
      [id],
    );

    const handleClick = (event) => {
      if (event.shiftKey) {
        selectionApiRef.current.rangeSelection?.(index, id, selected);
      } else {
        selectionApiRef.current.singleSelection?.(index, id, selected);
      }
    };

    const toggleOpenEditor = () => {
      setEditing((prev) => !prev);
    };

    return (
      <Card
        sx={{
          width: 180,
          margin: "20px auto 0 auto",
          boxSizing: "border-box",
          backgroundColor: selected
            ? theme.palette.action.selected
            : annotation_type
              ? theme.palette.action.disabledBackground
              : undefined,
          // border: selected ? `solid ${theme.palette.primary.main} ${theme.spacing(1)}` : undefined,
          position: "relative",
        }}
      >
        <Box
          sx={{ display: "flex", justifyContent: "space-between", padding: 1 }}
        >
          <Tooltip title="Edit this logo">
            <IconButton size="small" onClick={toggleOpenEditor}>
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
        <CardActionArea
          disabled={readOnly || !!annotation_type}
          onClick={handleClick}
          sx={{ flexGrow: 1 }}
        >
          <CardMedia
            component="img"
            height="150px"
            width="180px"
            loading="lazy"
            image={image}
            sx={{ objectFit: "contain" }}
          />
        </CardActionArea>
        <Typography sx={{ padding: 1 }} variant="caption">
          {distance !== undefined &&
            `${t("logos.distance")} ${distance.toFixed(1)}`}
        </Typography>
        <br />

        {editOpen || editing ? (
          <LogoForm
            value={annotation_value}
            type={annotation_type}
            updateMode
            request={updateLogo}
            sx={{
              "&": {
                flexDirection: "column",
              },
              "& .MuiTextField-root, & .MuiButtonBase-root, & .MuiAutocomplete-root":
                {
                  minWidth: 0,
                  width: "100%",
                  margin: 0,
                },
            }}
          />
        ) : (
          <Typography sx={{ padding: 1 }} variant="caption">
            {(annotation_type || annotation_value) &&
              `${t("logos.annotation")} ${annotation_value || ""} (${
                annotation_type || ""
              })`}
          </Typography>
        )}
        {!readOnly && (
          <Checkbox
            checked={selected}
            disabled={!!annotation_type}
            size="small"
            onClick={handleClick}
            sx={{ position: "absolute", bottom: 0, right: 0 }}
          />
        )}
      </Card>
    );
  },
);

const LogoGrid = (props) => {
  const {
    logos,
    toggleLogoSelection,
    setLogoSelectionRange,
    readOnly,
    sx,
    editOpen,
  } = props;

  const [lastClicked, setLastClicked] = React.useState(null);
  const selectionApiRef = React.useRef({});

  const [logoIds, setLogoIds] = React.useState([]);

  React.useEffect(() => {
    if (
      JSON.stringify(logoIds) !== JSON.stringify(logos.map((logo) => logo.id))
    ) {
      // Reset lastClick when logos ret reordered or modified
      setLogoIds(logos.map((logo) => logo.id));
      setLastClicked(null);
    }
  }, [logoIds, logos]);

  React.useEffect(() => {
    selectionApiRef.current = {
      rangeSelection: (index, id, selected) => {
        if (setLogoSelectionRange === undefined) {
          toggleLogoSelection(id);
          return;
        }
        if (lastClicked === null) {
          toggleLogoSelection(id);
          setLastClicked({ selected: !selected, index });
        }

        const newSelectionState =
          selected === lastClicked.selected
            ? !lastClicked.selected
            : lastClicked.selected;
        const minIndex = Math.min(index, lastClicked.index);
        const maxIndex = Math.max(index, lastClicked.index);
        setLogoSelectionRange(
          logoIds.slice(minIndex, maxIndex + 1),
          newSelectionState,
        );
        setLastClicked({ selected: newSelectionState, index });
      },
      singleSelection: (index, id, selected) => {
        toggleLogoSelection(id);
        if (setLogoSelectionRange !== undefined) {
          setLastClicked({ selected: !selected, index });
        }
      },
    };
  }, [lastClicked, logoIds, setLogoSelectionRange, toggleLogoSelection]);

  return (
    <Box
      sx={{
        paddingTop: 5,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        alignItems: "center",
        justifyContent: "center",
        ...sx,
      }}
    >
      {logos.map((logo, logoIndex) => (
        <LogoCard
          key={logo.id}
          index={logoIndex}
          selected={logo.selected || false}
          id={logo.id}
          annotation_value={logo.annotation_value}
          image={logo.image.src}
          annotation_type={logo.annotation_type}
          distance={logo.distance}
          readOnly={readOnly}
          selectionApiRef={selectionApiRef}
          editOpen={editOpen}
        />
      ))}
    </Box>
  );
};

export default LogoGrid;
