import { Button, IconButton, Typography } from "@mui/material";
import { Stack } from "@mui/system";

const FooterButtons = (props) => {
  const { title, subTitle, icon, url } = props;
  return (
    <Button
      href={url}
      target="_blank"
      variant="contained"
      sx={{ width: "200px", pr: "1", pl: "0", backgroundColor: "#a08d84" }}
    >
      <IconButton>{icon}</IconButton>
      <Stack>
        <Typography noWrap variant="caption">
          {subTitle}
        </Typography>
        <Typography noWrap variant="h6">
          {title}
        </Typography>
      </Stack>
    </Button>
  );
};

export default FooterButtons;
