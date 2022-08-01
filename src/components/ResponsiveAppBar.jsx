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
import MuiLink from "@mui/material/Link";
import SettingsIcon from '@mui/icons-material/Settings';

import DevModeContext from "../contexts/devMode";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

// Object wit no url are subheader in the menu
const pages = [
  { translationKey: "menu.games" },
  { url: "questions", translationKey: "menu.questions" },
  { url: "logos", translationKey: "menu.logos" },
  { url: "eco-score", translationKey: "menu.eco-score" },
  { translationKey: "menu.manage" },
  { url: "insights", translationKey: "menu.insights" },
  // { url: "settings", translationKey: "menu.settings" },
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

  const { devMode: isDevMode } = React.useContext(DevModeContext);

  const displayedPages = pages.filter(
    (page) => page.url !== "insights" || isDevMode
  );

  return (
    <AppBar position="static" color="secondary">
      <Container maxWidth={null}>
        <Toolbar disableGutters>
          {/* Mobile content */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
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
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Hunger Games
          </Typography>

          {/* Desktop content */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "row",
              alignItems: "center",
              width: '100%',
              justifyContent: 'space-between'
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
              sx={{ mr: 1, display: "flex", alignSelf: 'center' }}
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
              component="a"
              href="/"
              sx={{
                mr: 2,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Hunger Games
            </Typography>

              {displayedPages.map((page) =>
                page.url ? (
                  <Button
                    color="inherit"
                    key={page.url}
                    onClick={handleCloseNavMenu}
                    sx={{ my: 2, mr:1, display: "block", textAlign: 'center'}}
                    component={Link}
                    to={`/${page.url}`}
                  >
                    {page.url === 'settings' ? <SettingsIcon /> : t(page.translationKey)}
                  </Button>
                ) : null
              )}

          </Box>

            <Button
              color="inherit"
              onClick={handleCloseNavMenu}
              sx={{ my: 2, display: "block"}}
              component={Link}
              to={`/settings`}
            >
              <SettingsIcon />
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
