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
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import Tooltip from "@mui/material/Tooltip";
import MuiLink from "@mui/material/Link";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";

import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";

import DevModeContext from "../contexts/devMode";
import LoginContext from "../contexts/login";
import logo from "../assets/logo.png";
import { Link } from "react-router";

import { useTranslation } from "react-i18next";
import WelcomeTour from "./welcome/Welcome";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { OFF_URL } from "../const";
import { useCountry } from "../contexts/CountryProvider";
import countryNames from "../assets/countries.json";

type Page = {
  translationKey: string;
  url?: string;
  devModeOnly?: boolean;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
  children?: Page[];
};

// Object with no url are subheader in the menu
const PAGES: Page[] = [
  { translationKey: "menu.games" },
  { url: "questions", translationKey: "menu.questions" },
  { url: "green-score", translationKey: "menu.green-score" },
  {
    translationKey: "menu.logos",
    children: [
      {
        url: "logos",
        translationKey: "menu.logos-annotation",
        devModeOnly: true,
      },
      {
        url: "logos/search",
        translationKey: "menu.logos-search",
      },
      {
        url: "logos/product-search",
        translationKey: "menu.logos-product-search",
      },
      {
        url: "logos/deep-search",
        translationKey: "menu.logos-deep-search",
      },
    ],
  },
  {
    url: "nutrition",
    translationKey: "menu.nutritions",
    desktopOnly: true,
  },
  { translationKey: "menu.manage" },
  {
    translationKey: "menu.ingredients",
    children: [
      {
        url: "ingredient-spellcheck",
        translationKey: "menu.ingredient-spellcheck",
      },
      {
        url: "ingredient-detection",
        translationKey: "menu.ingredient-detection",
      },
    ],
  },
  { url: "insights", translationKey: "menu.insights", devModeOnly: true },
  { url: "dashboard", translationKey: "menu.dashboard" },
  { url: "settings", translationKey: "menu.settings", mobileOnly: true },
  {
    url: "https://nutripatrol.openfoodfacts.org",
    translationKey: "menu.moderation",
  },
];

const MultiPagesButton = ({
  translationKey,
  children,
  isOpen,
  isExternalUrl,
  toggleIsOpen,
}: {
  translationKey: string;
  children: Page[];
  isOpen: boolean;
  isExternalUrl: (url?: string) => boolean;
  toggleIsOpen: () => void;
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <>
      <Button
        ref={setAnchorEl}
        color="inherit"
        key={translationKey}
        onClick={toggleIsOpen}
        sx={{ my: 2, display: "block" }}
      >
        {t(translationKey)}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={toggleIsOpen}
        sx={{ display: { xs: "none", md: "flex" } }}
      >
        {children.map((subPage) => (
          <MenuItem
            sx={{ pl: 4 }}
            key={subPage.translationKey}
            onClick={toggleIsOpen}
            {...(isExternalUrl(subPage.url)
              ? { component: "a", target: "_blank", href: subPage.url }
              : { component: Link, to: `/${subPage.url}` })}
          >
            <Typography textAlign="center">
              {t(subPage.translationKey)}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const ResponsiveAppBar = () => {
  const { t } = useTranslation();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null,
  );
  const [isTourOpen, setIsTourOpen] = React.useState(false);
  const [country, setCountry] = useCountry();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const handleOpenNavMenu: React.MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const { isLoggedIn, userName, refresh } = React.useContext(LoginContext);
  const { devMode: isDevMode, visiblePages } = React.useContext(DevModeContext);
  const [menuOpenState, setMenuOpenState] = React.useState<
    Record<string, boolean>
  >({});

  const isPageVisible = (page: {
    devModeOnly?: boolean;
    mobileOnly?: boolean;
    desktopOnly?: boolean;
    url?: string;
  }) => {
    if (page.devModeOnly) {
      return (
        isDevMode &&
        page.url &&
        visiblePages[page.url as keyof typeof visiblePages]
      );
    }
    if (page.mobileOnly) {
      return !isDesktop;
    }
    if (page.desktopOnly) {
      return isDesktop;
    }
    return true;
  };

  const isExternalUrl = (url?: string): boolean =>
    Boolean(url?.trim().startsWith("http"));

  const displayedPages = PAGES.map((page) => {
    if (!page.children) {
      return page;
    }
    return { ...page, children: page.children.filter(isPageVisible) };
  }).filter((page) => {
    if (page.children !== undefined && page.children.length === 0) {
      return false;
    }
    return isPageVisible(page);
  });

  return (
    <AppBar
      position="static"
      sx={(theme) => ({
        backgroundColor: theme.palette.cafeCreme.main,
        color: theme.palette.cafeCreme.contrastText,
      })}
    >
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          {/* Mobile content */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "flex", lg: "none" },
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
            {anchorElNav && (
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                // keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", lg: "none" },
                }}
              >
                {displayedPages.map((page) => {
                  if (page.url) {
                    return (
                      <MenuItem
                        color="inherit"
                        sx={{ display: "block" }}
                        {...(isExternalUrl(page.url)
                          ? { component: "a", target: "_blank", href: page.url }
                          : { component: Link, to: `/${page.url}` })}
                      >
                        <Typography textAlign="left">
                          {t(page.translationKey)}
                        </Typography>
                      </MenuItem>
                    );
                  }
                  if (page.children) {
                    return (
                      <List
                        component="div"
                        disablePadding
                        key={page.translationKey}
                      >
                        <MenuItem
                          onClick={() =>
                            setMenuOpenState((prev) => ({
                              ...prev,
                              [`Mobile-${page.translationKey}`]:
                                !prev[`Mobile-${page.translationKey}`],
                            }))
                          }
                        >
                          <Typography textAlign="center">
                            {t(page.translationKey)}
                          </Typography>

                          {menuOpenState[`Mobile-${page.translationKey}`] ? (
                            <ExpandLess />
                          ) : (
                            <ExpandMore />
                          )}
                        </MenuItem>
                        <Collapse
                          in={menuOpenState[`Mobile-${page.translationKey}`]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <List component="div" disablePadding>
                            {page.children.map((subPage) => (
                              <MenuItem
                                sx={{ pl: 4 }}
                                key={subPage.translationKey}
                                onClick={handleCloseNavMenu}
                                component={Link}
                                to={`/${subPage.url}`}
                              >
                                <Typography textAlign="center">
                                  {t(subPage.translationKey)}
                                </Typography>
                              </MenuItem>
                            ))}
                          </List>
                        </Collapse>
                      </List>
                    );
                  }
                  return (
                    <ListSubheader key={`Mobile-${page.translationKey}`}>
                      {t(page.translationKey)}
                    </ListSubheader>
                  );
                })}
                <MenuItem
                  component="button"
                  color="inherit"
                  sx={{ mt: -1 }}
                  onClick={() => {
                    setIsTourOpen(true);
                    handleCloseNavMenu();
                  }}
                >
                  <Typography textAlign="center">{t("menu.tour")}</Typography>
                </MenuItem>
              </Menu>
            )}

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
                    window.open(`${OFF_URL}/cgi/login.pl`, "_blank")?.focus();
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
              display: { xs: "none", lg: "flex" },
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MuiLink
                sx={{ mr: 1, display: "flex", alignSelf: "center" }}
                href={OFF_URL}
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

              {displayedPages.map((page) => {
                if (page.url) {
                  return isExternalUrl(page.url) ? (
                    <Button
                      color="inherit"
                      key={page.url}
                      onClick={handleCloseNavMenu}
                      sx={{ my: 2, display: "block" }}
                      component={"a"}
                      href={page.url}
                      target="_blank"
                      data-welcome-tour={page.url}
                    >
                      {t(page.translationKey)}
                    </Button>
                  ) : (
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
                  );
                }

                const children = page.children;
                if (children != null) {
                  return (
                    <MultiPagesButton
                      {...page}
                      children={children}
                      key={page.translationKey}
                      isExternalUrl={isExternalUrl}
                      isOpen={!!menuOpenState[`Desktop-${page.translationKey}`]}
                      toggleIsOpen={() =>
                        setMenuOpenState((prev) => ({
                          ...prev,
                          [`Desktop-${page.translationKey}`]:
                            !prev[`Desktop-${page.translationKey}`],
                        }))
                      }
                    />
                  );
                }

                return null;
              })}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                "&>*": {
                  mr: 1.5,
                },
              }}
            >
              <Select
                value={country || "world"}
                onChange={(event) => {
                  setCountry(
                    event.target.value === "world" ? "" : event.target.value,
                    "global",
                  );
                }}
                variant="outlined"
                sx={{ fieldset: { border: "none" } }}
              >
                {countryNames.map(({ label, countryCode }) => (
                  <MenuItem value={countryCode || "world"} key={countryCode}>
                    {label}
                    {countryCode && ` (${countryCode})`}
                  </MenuItem>
                ))}
              </Select>
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
              <IconButton
                color="inherit"
                onClick={() => {
                  setIsTourOpen(true);
                }}
                data-welcome-tour="tour"
              >
                <QuestionMarkIcon />
              </IconButton>
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
                          .open(`${OFF_URL}/cgi/login.pl`, "_blank")
                          ?.focus();
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
      <WelcomeTour isOpen={isTourOpen} setIsOpen={setIsTourOpen} />
    </AppBar>
  );
};
export default ResponsiveAppBar;
