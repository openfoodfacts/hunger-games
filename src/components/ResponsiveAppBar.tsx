import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import ListItemIcon from "@mui/material/ListItemIcon";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import ParkOutlinedIcon from "@mui/icons-material/ParkOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import FindInPageOutlinedIcon from "@mui/icons-material/FindInPageOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import InsightsIcon from "@mui/icons-material/Insights";
import AppsIcon from "@mui/icons-material/Apps";

import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PublicIcon from "@mui/icons-material/Public";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import DevModeContext from "../contexts/devMode";
import LoginContext from "../contexts/login";
import logo from "../assets/logo.png";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import WelcomeTour from "./welcome/Welcome";
import { OFF_URL } from "../const";
import { useCountry } from "../contexts/CountryProvider";
import countryNames from "../assets/countries.json";

type Page = { translationKey: string; url: string; devModeOnly?: boolean };

const PAGE_ICONS: Record<string, typeof SearchIcon> = {
  questions: QuizOutlinedIcon,
  "green-score": ParkOutlinedIcon,
  brandinator: SellOutlinedIcon,
  nutrition: RestaurantOutlinedIcon,
  "ingredient-spellcheck": SpellcheckIcon,
  "ingredient-detection": FindInPageOutlinedIcon,
  "logos/search": SearchIcon,
  "logos/product-search": Inventory2OutlinedIcon,
  "logos/deep-search": TravelExploreIcon,
  logos: EditOutlinedIcon,
  insights: InsightsIcon,
  "": AppsIcon,
};

const NAV_GROUPS: { id: string; pages: Page[] }[] = [
  {
    id: "games",
    pages: [
      { url: "questions", translationKey: "menu.questions" },
      { url: "green-score", translationKey: "menu.green-score" },
      { url: "brandinator", translationKey: "menu.brandinator" },
      {
        url: "nutrition",
        translationKey: "home.game_selector.cards.nutrition.title",
      },
      {
        url: "ingredient-spellcheck",
        translationKey: "home.game_selector.cards.ingredient_spellcheck.title",
      },
      {
        url: "ingredient-detection",
        translationKey: "home.game_selector.cards.ingredient_detection.title",
      },
    ],
  },
  {
    id: "logo_search",
    pages: [
      { url: "logos/search", translationKey: "menu.logos-search" },
      {
        url: "logos/product-search",
        translationKey: "menu.logos-product-search",
      },
      { url: "logos/deep-search", translationKey: "menu.logos-deep-search" },
      {
        url: "logos",
        translationKey: "menu.logos-annotation",
        devModeOnly: true,
      },
      { url: "insights", translationKey: "menu.insights", devModeOnly: true },
    ],
  },
];

const menuSlotProps = {
  paper: {
    sx: {
      mt: 1,
      minWidth: 240,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "0 8px 28px rgba(0, 0, 0, 0.12)",
      "& .MuiMenu-list": { p: 0.75 },
      "& .MuiMenuItem-root": {
        borderRadius: 1,
        minHeight: 42,
        fontSize: "0.9rem",
        px: 1.5,
        my: 0.25,
      },
      "& .MuiDivider-root": { my: 0.75, mx: 1 },
    },
  },
};

const NavBrand = ({ compact = false }: { compact?: boolean }) => {
  const { t } = useTranslation();
  return (
    <Box
      component={Link as React.ElementType}
      to="/"
      aria-label={t("menu.title")}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        minWidth: 0,
        borderRadius: 2,
        px: compact ? 0.5 : 0.75,
        py: 0.5,
        color: "inherit",
        textDecoration: "none",
        "&:hover": { backgroundColor: "action.hover" },
      }}
    >
      <Box
        component="img"
        src={logo}
        alt=""
        sx={{
          width: compact ? 32 : 36,
          height: compact ? 32 : 36,
          objectFit: "contain",
          flexShrink: 0,
        }}
      />
      <Box sx={{ minWidth: 0, lineHeight: 1 }}>
        <Typography
          component="span"
          sx={{
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: compact ? "0.98rem" : "1.05rem",
            fontWeight: 800,
            letterSpacing: "-0.025em",
          }}
        >
          {t("menu.title")}
        </Typography>
        {!compact && (
          <Typography
            component="span"
            sx={{
              display: "block",
              mt: 0.25,
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              lineHeight: 1,
              opacity: 0.62,
              textTransform: "uppercase",
            }}
          >
            Open Food Facts
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const ResponsiveAppBar = () => {
  const { t } = useTranslation();
  const [anchorElNav, setAnchorElNav] = React.useState<HTMLElement | null>(
    null,
  );
  const [groupMenu, setGroupMenu] = React.useState<{
    id: string;
    anchor: HTMLElement;
  } | null>(null);
  const [isTourOpen, setIsTourOpen] = React.useState(false);
  const [country, setCountry] = useCountry();
  const { isLoggedIn, userName, refresh } = React.useContext(LoginContext);
  const { devMode, visiblePages } = React.useContext(DevModeContext);
  const [mobileGroups, setMobileGroups] = React.useState<
    Record<string, boolean>
  >({});
  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    pages: group.pages.filter(
      (page) => !page.devModeOnly || (devMode && !!visiblePages[page.url]),
    ),
  }));
  const accountLabel = isLoggedIn
    ? userName || t("menu.logged_in")
    : t("menu.log_in");
  const accountAriaLabel =
    isLoggedIn && userName
      ? t("menu.logged_in_user", { userName })
      : accountLabel;
  const closeNavigation = () => {
    setAnchorElNav(null);
    setGroupMenu(null);
  };
  const openLogin = () =>
    void (async () => {
      if (!(await refresh())) {
        window.open(`${OFF_URL}/cgi/login.pl`, "_blank")?.focus();
      }
    })();

  const countrySelector = (
    <Box
      data-welcome-tour="country"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 0, md: 0.5 },
        px: { xs: 1.5, md: 1 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: { xs: 34, md: 20 },
          flexShrink: 0,
        }}
      >
        <PublicIcon sx={{ fontSize: { xs: 24, md: 20 } }} aria-hidden="true" />
      </Box>
      <Autocomplete
        disableClearable
        options={countryNames}
        getOptionLabel={(option) =>
          option.countryCode
            ? `${option.label} (${option.countryCode})`
            : option.label
        }
        isOptionEqualToValue={(option, value) =>
          option.countryCode === value.countryCode
        }
        value={
          countryNames.find((item) => item.countryCode === country) ??
          countryNames.find((item) => item.countryCode === "")
        }
        onChange={(_, newValue) =>
          setCountry(newValue?.countryCode ?? "", "global")
        }
        sx={{
          width: { xs: 220, md: 160, xl: 220 },
          fieldset: { border: "none" },
          "& .MuiInputBase-root": {
            borderRadius: 1,
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            size="small"
            slotProps={{
              ...params.slotProps,
              htmlInput: {
                ...params.slotProps.htmlInput,
                "aria-label": t("menu.country", { defaultValue: "Country" }),
              },
            }}
          />
        )}
      />
    </Box>
  );

  const renderTool = (page: Page, mobile = false) => {
    const external = page.url.startsWith("http");
    const Icon = PAGE_ICONS[page.url] ?? SearchIcon;
    return (
      <MenuItem
        key={page.url}
        onClick={closeNavigation}
        {...(external
          ? {
              component: "a",
              href: page.url,
              target: "_blank",
              rel: "noreferrer",
            }
          : { component: Link as React.ElementType, to: `/${page.url}` })}
        sx={{
          pl: mobile ? "24px !important" : 1.5,
          ...(page.url === "" && {
            color: "primary.main",
            fontWeight: 700,
          }),
        }}
      >
        <ListItemIcon sx={{ minWidth: 34, color: "inherit", opacity: 0.75 }}>
          <Icon fontSize="small" />
        </ListItemIcon>
        {t(page.translationKey)}
        {external ? " ↗" : ""}
      </MenuItem>
    );
  };

  return (
    <AppBar
      position="static"
      sx={(appTheme) => ({
        backgroundColor: appTheme.palette.cafeCreme.main,
        color: appTheme.palette.cafeCreme.contrastText,
        boxShadow: "none",
        borderBottom: `1px solid ${appTheme.palette.divider}`,
      })}
    >
      <Container maxWidth={false}>
        <Toolbar
          disableGutters
          sx={{ minHeight: { xs: 58, lg: 66 }, px: { xs: 0.5, lg: 0 } }}
        >
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              maxWidth: "100%",
            }}
          >
            <IconButton
              size="large"
              aria-label={t("menu.open_navigation", {
                defaultValue: "Open navigation menu",
              })}
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={(event) => setAnchorElNav(event.currentTarget)}
              color="inherit"
              data-welcome-tour="games"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              slotProps={menuSlotProps}
              id="menu-appbar"
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={closeNavigation}
            >
              {groups.map((group) => (
                <React.Fragment key={group.id}>
                  <MenuItem
                    onClick={() =>
                      setMobileGroups((prev) => ({
                        ...prev,
                        [group.id]: !prev[group.id],
                      }))
                    }
                    aria-expanded={!!mobileGroups[group.id]}
                    sx={{ justifyContent: "space-between", fontWeight: 700 }}
                  >
                    {t(`menu.${group.id}`)}
                    {mobileGroups[group.id] ? <ExpandLess /> : <ExpandMore />}
                  </MenuItem>
                  <Collapse in={!!mobileGroups[group.id]} unmountOnExit>
                    <List disablePadding>
                      {group.pages.map((page) => renderTool(page, true))}
                      {group.id === "games" && <Divider />}
                      {group.id === "games" &&
                        renderTool(
                          { url: "", translationKey: "menu.all_games" },
                          true,
                        )}
                    </List>
                  </Collapse>
                </React.Fragment>
              ))}
              <MenuItem
                component={Link as React.ElementType}
                to="/dashboard"
                onClick={closeNavigation}
              >
                {t("menu.dashboard")}
              </MenuItem>
              {!isLoggedIn && (
                <MenuItem
                  component="a"
                  href={`${OFF_URL}/cgi/user.pl`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeNavigation}
                >
                  {t("menu.sign_up")}
                </MenuItem>
              )}
              <Divider />
              {countrySelector}
              <MenuItem
                component={Link as React.ElementType}
                to="/settings"
                onClick={closeNavigation}
                data-welcome-tour="settings"
              >
                <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                  <SettingsIcon />
                </ListItemIcon>
                {t("menu.settings")}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  closeNavigation();
                  setIsTourOpen(true);
                }}
                data-welcome-tour="tour"
              >
                <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                  <HelpOutlineIcon />
                </ListItemIcon>
                {t("menu.tour")}
              </MenuItem>
            </Menu>
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <NavBrand compact />
            </Box>
            {isLoggedIn ? (
              <Tooltip title={accountAriaLabel}>
                <Box
                  role="img"
                  aria-label={accountAriaLabel}
                  sx={{
                    minWidth: 0,
                    maxWidth: { xs: 120, sm: 180 },
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    pl: 1,
                    pr: 0.5,
                  }}
                >
                  <AccountCircleIcon color="success" />
                  <Typography
                    variant="button"
                    noWrap
                    sx={{ textTransform: "none" }}
                  >
                    {accountLabel}
                  </Typography>
                </Box>
              </Tooltip>
            ) : (
              <Button
                color="inherit"
                aria-label={t("menu.log_in")}
                onClick={openLogin}
                startIcon={<AccountCircleIcon color="error" />}
                sx={{ minWidth: 0, px: 1, whiteSpace: "nowrap" }}
              >
                {t("menu.log_in")}
              </Button>
            )}
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <NavBrand />
              <Divider
                orientation="vertical"
                sx={{
                  height: 32,
                  alignSelf: "center",
                  mx: { lg: 1, xl: 1.5 },
                  borderColor: "divider",
                }}
              />
              {groups.map((group) => (
                <Button
                  key={group.id}
                  color="inherit"
                  aria-haspopup="menu"
                  aria-controls={
                    groupMenu?.id === group.id
                      ? "desktop-navigation-menu"
                      : undefined
                  }
                  aria-expanded={groupMenu?.id === group.id}
                  onClick={(event) =>
                    setGroupMenu({ id: group.id, anchor: event.currentTarget })
                  }
                  data-welcome-tour={group.id}
                  endIcon={<ExpandMore />}
                  sx={{
                    whiteSpace: "nowrap",
                    minWidth: 0,
                    pl: 1,
                    pr: 0.5,
                    borderRadius: 1.5,
                    bgcolor:
                      groupMenu?.id === group.id
                        ? "action.selected"
                        : undefined,
                    "& .MuiButton-endIcon": {
                      transition: "transform 160ms ease",
                      transform:
                        groupMenu?.id === group.id ? "rotate(180deg)" : "none",
                      "@media (prefers-reduced-motion: reduce)": {
                        transition: "none",
                      },
                    },
                  }}
                >
                  {t(`menu.${group.id}`)}
                </Button>
              ))}
              <Button
                color="inherit"
                component={Link as React.ElementType}
                to="/dashboard"
                data-welcome-tour="dashboard"
                sx={{ whiteSpace: "nowrap" }}
              >
                {t("menu.dashboard")}
              </Button>
              <Menu
                slotProps={menuSlotProps}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                id="desktop-navigation-menu"
                anchorEl={groupMenu?.anchor ?? null}
                open={Boolean(groupMenu)}
                onClose={() => setGroupMenu(null)}
              >
                {groups
                  .find((group) => group.id === groupMenu?.id)
                  ?.pages.map((page) => renderTool(page))}
                {groupMenu?.id === "games" && <Divider />}
                {groupMenu?.id === "games" &&
                  renderTool({ url: "", translationKey: "menu.all_games" })}
              </Menu>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Divider
                orientation="vertical"
                sx={{
                  height: 32,
                  alignSelf: "center",
                  mx: { md: 0.5, lg: 1 },
                  borderColor: "divider",
                }}
              />
              {countrySelector}
              <Tooltip title={t("menu.settings")}>
                <IconButton
                  color="inherit"
                  aria-label={t("menu.settings")}
                  component={Link as React.ElementType}
                  to="/settings"
                  data-welcome-tour="settings"
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("menu.help", { defaultValue: "Help" })}>
                <IconButton
                  color="inherit"
                  aria-label={t("menu.help", { defaultValue: "Help" })}
                  onClick={() => setIsTourOpen(true)}
                  data-welcome-tour="tour"
                >
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={accountAriaLabel}>
                {isLoggedIn ? (
                  <Box
                    role="img"
                    aria-label={accountAriaLabel}
                    sx={{
                      px: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <AccountCircleIcon color="success" />
                    <Typography variant="button" sx={{ textTransform: "none" }}>
                      {accountLabel}
                    </Typography>
                  </Box>
                ) : (
                  <Button
                    color="inherit"
                    onClick={openLogin}
                    startIcon={<AccountCircleIcon color="error" />}
                  >
                    {accountLabel}
                  </Button>
                )}
              </Tooltip>
              {!isLoggedIn && (
                <Button
                  variant="outlined"
                  size="small"
                  href={`${OFF_URL}/cgi/user.pl`}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {t("menu.sign_up")}
                </Button>
              )}
            </Box>
          </Box>
        </Toolbar>
      </Container>
      <WelcomeTour isOpen={isTourOpen} setIsOpen={setIsTourOpen} />
    </AppBar>
  );
};
export default ResponsiveAppBar;
