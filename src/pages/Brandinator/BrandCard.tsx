import * as React from "react";
import { Link as RouterLink } from "react-router";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import ImageSearchRoundedIcon from "@mui/icons-material/ImageSearchRounded";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";

import {
  type BrandItem,
  type ProjectConfig,
  GITHUB_BRAND_IMAGES_UPLOAD_URL,
  TAXONOMY_EDITOR_START_URL,
} from "./brandinatorService";

interface BrandCardProps {
  brand: BrandItem;
  project: ProjectConfig;
  highlightSearch?: string;
}

export const BrandCard = React.memo(function BrandCard({
  brand,
  project,
}: BrandCardProps) {
  const [imgError, setImgError] = React.useState(false);

  const questionsUrl = `/questions?type=brand&value_tag=${encodeURIComponent(
    brand.slug,
  )}&sorted=true`;
  const logoSearchUrl = `/logos/search?type=brand&value=${encodeURIComponent(
    brand.name,
  )}`;
  const logoDeepSearchUrl = `/logos/deep-search?type=brand&value=${encodeURIComponent(
    brand.name,
  )}`;
  const externalCatalogUrl = `${project.worldUrl}/brand/${encodeURIComponent(
    brand.slug,
  )}`;

  const brandInitial = brand.name ? brand.name.charAt(0).toUpperCase() : "?";

  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        transition: theme.transitions.create(["transform", "box-shadow"]),
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: theme.shadows[4],
        },
      })}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {/* Top Header: Brand Logo / Avatar + Name + Catalog Link */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          {brand.imageUrl && !imgError ? (
            <Box
              component="img"
              src={brand.imageUrl}
              alt={brand.name}
              onError={() => setImgError(true)}
              loading="lazy"
              sx={{
                width: 48,
                height: 48,
                objectFit: "contain",
                borderRadius: 2,
                p: 0.5,
                bgcolor: "#ffffff",
                border: "1px solid",
                borderColor: "divider",
                flexShrink: 0,
              }}
            />
          ) : (
            <Tooltip title="No logo available - Click to add logo on GitHub">
              <Box
                component="a"
                href={GITHUB_BRAND_IMAGES_UPLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  textDecoration: "none",
                  position: "relative",
                  display: "inline-block",
                  flexShrink: 0,
                  "&:hover .add-photo-badge": {
                    transform: "scale(1.15)",
                  },
                }}
              >
                <Avatar
                  sx={(theme) => ({
                    width: 48,
                    height: 48,
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    borderRadius: 2,
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    transition: "opacity 0.2s",
                    "&:hover": {
                      opacity: 0.85,
                    },
                  })}
                >
                  {brandInitial}
                </Avatar>
                <Box
                  className="add-photo-badge"
                  sx={(theme) => ({
                    position: "absolute",
                    bottom: -3,
                    right: -3,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText,
                    display: "grid",
                    placeItems: "center",
                    boxShadow: 1,
                    border: `1.5px solid ${theme.palette.background.paper}`,
                    transition: "transform 0.15s ease-in-out",
                  })}
                >
                  <AddPhotoAlternateRoundedIcon sx={{ fontSize: 13 }} />
                </Box>
              </Box>
            </Tooltip>
          )}

          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                fontSize: { xs: "1rem", sm: "1.1rem" },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={brand.name}
            >
              {brand.name}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: "monospace",
              }}
              title={brand.slug}
            >
              {brand.slug}
            </Typography>
          </Box>

          <Tooltip title={`Open on ${project.name}`}>
            <IconButton
              component="a"
              href={externalCatalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{ color: "text.secondary" }}
            >
              <OpenInNewRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Opportunity Badge (like in Categories game) & Product Count */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexWrap: "wrap", gap: 0.75, alignItems: "center" }}
        >
          {brand.opportunities > 0 ? (
            <Chip
              label={`${brand.opportunities.toLocaleString()} opportunities`}
              color="primary"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
              component={RouterLink as React.ElementType}
              to={questionsUrl}
            />
          ) : (
            <Chip
              label="0 opportunities"
              variant="outlined"
              size="small"
              sx={{ fontSize: "0.75rem", opacity: 0.7 }}
            />
          )}

          {brand.products > 0 && (
            <Chip
              label={`${brand.products.toLocaleString()} products`}
              variant="outlined"
              size="small"
              sx={{ fontSize: "0.75rem" }}
            />
          )}

          {brand.isTaxonomized ? (
            <Chip
              icon={<CheckCircleRoundedIcon fontSize="small" />}
              label="Taxonomized"
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontSize: "0.75rem", fontWeight: 600 }}
            />
          ) : (
            <Tooltip title="Brand not in taxonomy - Click to add in Taxonomy Editor">
              <Chip
                component="a"
                href={TAXONOMY_EDITOR_START_URL}
                target="_blank"
                rel="noopener noreferrer"
                clickable
                icon={<WarningAmberRoundedIcon fontSize="small" />}
                label="Untaxonomized"
                size="small"
                variant="outlined"
                color="warning"
                sx={{
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "warning.main",
                    color: "warning.contrastText",
                  },
                }}
              />
            </Tooltip>
          )}

          {brand.wikidata && (
            <Tooltip title={`Wikidata: ${brand.wikidata}`}>
              <IconButton
                component="a"
                href={`https://www.wikidata.org/wiki/${brand.wikidata}`}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ p: 0.5, color: "text.secondary" }}
              >
                <LanguageRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* Action Buttons: Questions Game, Logo Game, Deep Search */}
        <Box sx={{ mt: "auto", pt: 1 }}>
          <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
            <Button
              component={RouterLink as React.ElementType}
              to={questionsUrl}
              variant={brand.opportunities > 0 ? "contained" : "outlined"}
              size="small"
              color="primary"
              startIcon={<HelpOutlineRoundedIcon />}
              sx={{
                flex: 1,
                fontSize: "0.75rem",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Questions
            </Button>

            <Button
              component={RouterLink as React.ElementType}
              to={logoSearchUrl}
              variant="outlined"
              size="small"
              color="inherit"
              startIcon={<ImageSearchRoundedIcon />}
              sx={{
                flex: 1,
                fontSize: "0.75rem",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Logos
            </Button>

            <Tooltip title="Deep Logo Search">
              <IconButton
                component={RouterLink as React.ElementType}
                to={logoDeepSearchUrl}
                size="small"
                color="default"
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <ManageSearchRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
});
