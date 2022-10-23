import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import Tooltip from "@mui/material/Tooltip";
import MuiLink from "@mui/material/Link";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import DevModeContext from "../contexts/devMode";
import LoginContext from "../contexts/login";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";
import Welcome from "./welcome/Welcome";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Object wit no url are subheader in the menu
const pages = [
  { translationKey: "menu.games" },
  { url: "questions", translationKey: "menu.questions" },
  { url: "logos", translationKey: "menu.logos", devModeOnly: true },
  { url: "eco-score", translationKey: "menu.eco-score" },
  { translationKey: "menu.manage" },
  { url: "insights", translationKey: "menu.insights", devModeOnly: true },
  { url: "nutriscore", translationKey: "menu.nutriscore", devModeOnly: true },
  { url: "settings", translationKey: "menu.settings", mobileOnly: true },
];

const ResponsiveAppBar = () => {
  const { t } = useTranslation();
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const { isLoggedIn, userName, refresh } = React.useContext(LoginContext);
  const { devMode: isDevMode, visiblePages } = React.useContext(DevModeContext);
  const displayedPages = pages.filter((page) => {
    if (page.devModeOnly) {
      return isDevMode && visiblePages[page.url];
    }
    if (page.mobileOnly) {
      return !isDesktop;
    }
    return true;
  });

  return (
    <AppBar position="static" color="secondary">
      <Container maxWidth={null}>
        <Toolbar disableGutters>
          {/* Mobile content */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              justifyContent: "space-between",
              maxWidth: "100%",
            }}
          >
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {displayedPages.map((page) =>
                page.url ? (
                  <MenuItem
                    key={page.translationKey}
                    onClick={handleCloseNavMenu}
                    component={Link}
                    to={`/${page.url}`}
                    data-welcome-tour={page.url}
                  >
                    <Typography textAlign="center">
                      {t(page.translationKey)}
                    </Typography>
                  </MenuItem>
                ) : (
                  <ListSubheader key={page.translationKey}>
                    {t(page.translationKey)}
                  </ListSubheader>
                )
              )}
              <Typography textAlign="center">
                {t("Tour")}
                <Welcome />
              </Typography>
            </Menu>
            <Typography
              variant="h5"
              noWrap
              component={Link}
              to="/"
              sx={{
                flexGrow: 0,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              {t("menu.title")}
            </Typography>
            {isLoggedIn ? (
              <AccountCircleIcon color="success" />
            ) : (
              <IconButton
                onClick={async () => {
                  const isLoggedIn = await refresh();
                  if (!isLoggedIn) {
                    window
                      .open(
                        "https://world.openfoodfacts.org/cgi/login.pl",
                        "_blank"
                      )
                      .focus();
                  }
                }}
              >
                <AccountCircleIcon color="error" />
              </IconButton>
            )}
          </Box>

          {/* Desktop content */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                flexDirection: "row",
                alignItems: "baseline",
              }}
            >
              <MuiLink
                sx={{ mr: 1, display: "flex", alignSelf: "center" }}
                href="https://world.openfoodfacts.org/"
                target="_blank"
              >
                <img
                  src={logo}
                  width="30px"
                  height="30px"
                  alt="OpenFoodFact logo"
                />
              </MuiLink>
              <Typography
                variant="h6"
                noWrap
                component={Link}
                to="/"
                sx={{
                  mr: 2,
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: ".3rem",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                {t("menu.title")}
              </Typography>

              {displayedPages.map((page) =>
                page.url ? (
                  <Button
                    color="inherit"
                    key={page.url}
                    onClick={handleCloseNavMenu}
                    sx={{ my: 2, display: "block" }}
                    component={Link}
                    to={`/${page.url}`}
                    data-welcome-tour={page.url}
                  >
                    {t(page.translationKey)}
                  </Button>
                ) : null
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "baseline",
                "&>*": {
                  mr: 1.5,
                },
              }}
            >
              <IconButton
                color="inherit"
                onClick={handleCloseNavMenu}
                sx={{ my: 2 }}
                component={Link}
                to={`/settings`}
                data-welcome-tour="settings"
              >
                <SettingsIcon />
              </IconButton>
              <Welcome />
              <Tooltip
                title={
                  isLoggedIn
                    ? t("menu.logged_in_user", { userName })
                    : t("menu.log_in")
                }
              >
                {isLoggedIn ? (
                  <AccountCircleIcon color="success" />
                ) : (
                  <IconButton
                    onClick={async () => {
                      const isLoggedIn = await refresh();
                      if (!isLoggedIn) {
                        window
                          .open(
                            "https://world.openfoodfacts.org/cgi/login.pl",
                            "_blank"
                          )
                          .focus();
                      }
                    }}
                  >
                    <AccountCircleIcon color="error" />
                  </IconButton>
                )}
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
