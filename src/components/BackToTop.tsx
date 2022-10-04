import * as React from "react";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Fab from "@mui/material/Fab";
import Tooltip from "@mui/material/Tooltip";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import Fade from "@mui/material/Fade";

export default function BackToTop() {
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 200,
  });

  const handleClick = () => {
    window.scrollTo({ top: 0 });
    setOpen(false);
  };

  return (
    <Fade in={trigger}>
      <Tooltip
        title="Scroll to top"
        open={open}
        onClose={handleClose}
        onOpen={handleOpen}
      >
        <Fab
          sx={(theme) => ({
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 10,
            backgroundColor: theme.palette.secondary.light,
            boxShadow: `0px 4px 20px rgba(170, 180, 190, 0.3)`,
            "&:hover": {
              backgroundColor: undefined,
            },
            "&:active": {
              boxShadow: `0px 4px 20px rgba(170, 180, 190, 0.6)`,
            },
          })}
          size="small"
          aria-label="Scroll to top"
          onClick={handleClick}
        >
          <KeyboardArrowUpRoundedIcon
            sx={{
              color: "black",
            }}
          />
        </Fab>
      </Tooltip>
    </Fade>
  );
}
