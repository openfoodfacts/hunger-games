import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import Collapse from "@mui/material/Collapse";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  COMMON_SHAPES,
  GENTLE_MATERIALS,
  RECYCLING_OPTIONS,
  SPECIFIC_RESINS,
} from "./constants";
import type { Option } from "../../hooks/useOptions";
import type { EditablePackagingComponent } from "./types";

type PackagingComponentCardProps = {
  index: number;
  component: EditablePackagingComponent;
  packagingShapesOptions: Option[];
  packagingMaterialsOptions: Option[];
  packagingRecyclingOptions: Option[];
  onChange: (updated: EditablePackagingComponent) => void;
  onDelete: () => void;
  onDuplicate: () => void;
};

const COMMON_UNIT_PRESETS = [1, 2, 4, 6, 8, 12];

export default function PackagingComponentCard({
  index,
  component,
  packagingShapesOptions,
  packagingMaterialsOptions,
  packagingRecyclingOptions,
  onChange,
  onDelete,
  onDuplicate,
}: PackagingComponentCardProps) {
  const [showResins, setShowResins] = React.useState(false);
  const [showMoreShapes, setShowMoreShapes] = React.useState(false);

  const unitsNumber =
    typeof component.numberOfUnits === "number"
      ? component.numberOfUnits
      : parseInt(String(component.numberOfUnits) || "1", 10) || 1;

  const handleUnitsChange = (delta: number) => {
    const nextVal = Math.max(1, unitsNumber + delta);
    onChange({ ...component, numberOfUnits: nextVal });
  };

  const handleDirectUnits = (val: number) => {
    onChange({ ...component, numberOfUnits: val });
  };

  const handleSelectShape = (shapeId: string, label: string) => {
    onChange({
      ...component,
      shape: shapeId,
      shapeName: label,
    });
  };

  const handleSelectMaterial = (matId: string, label: string) => {
    onChange({
      ...component,
      material: matId,
      materialName: label,
    });
  };

  const handleSelectRecycling = (recId: string, label: string) => {
    onChange({
      ...component,
      recycling: recId,
      recyclingName: label,
    });
  };

  // Find shape display label
  const activeShape =
    COMMON_SHAPES.find((s) => s.id === component.shape) ??
    packagingShapesOptions.find((o) => o.value === component.shape);

  // Find material display label
  const activeMaterial =
    GENTLE_MATERIALS.find((m) => m.id === component.material) ??
    SPECIFIC_RESINS.find((r) => r.id === component.material) ??
    packagingMaterialsOptions.find((o) => o.value === component.material);

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "border-color 0.2s, box-shadow 0.2s",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        },
      }}
    >
      <Stack spacing={2}>
        {/* Card Header: Unit Number + Quick Stepper + Actions */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          sx={{ gap: 1 }}
        >
          {/* Unit Stepper */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="subtitle2"
              fontWeight={800}
              color="text.secondary"
            >
              #{index + 1}
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              Quantity:
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <IconButton
                size="small"
                onClick={() => handleUnitsChange(-1)}
                disabled={unitsNumber <= 1}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography
                sx={{
                  px: 1,
                  minWidth: 28,
                  textAlign: "center",
                  fontWeight: 800,
                }}
              >
                {unitsNumber}
              </Typography>
              <IconButton size="small" onClick={() => handleUnitsChange(1)}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Stack>

            {/* Quick Unit Presets */}
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ display: { xs: "none", sm: "flex" } }}
            >
              {COMMON_UNIT_PRESETS.map((p) => (
                <Chip
                  key={p}
                  size="small"
                  label={p}
                  clickable
                  variant={unitsNumber === p ? "filled" : "outlined"}
                  color={unitsNumber === p ? "primary" : "default"}
                  onClick={() => handleDirectUnits(p)}
                  sx={{ height: 24, fontSize: "0.75rem", fontWeight: 700 }}
                />
              ))}
            </Stack>
          </Stack>

          {/* Action buttons */}
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Duplicate this component">
              <IconButton size="small" onClick={onDuplicate}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete component">
              <IconButton size="small" color="error" onClick={onDelete}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* 1. SHAPE SELECTOR */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography
              variant="caption"
              fontWeight={800}
              color="text.secondary"
              textTransform="uppercase"
            >
              1. Shape
            </Typography>
            {activeShape && (
              <Chip
                size="small"
                label={activeShape.label}
                color="primary"
                sx={{ height: 22, fontWeight: 700 }}
              />
            )}
          </Stack>

          {/* Quick Shape Chips */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {COMMON_SHAPES.slice(0, 10).map((shape) => {
              const isSelected = component.shape === shape.id;
              return (
                <Chip
                  key={shape.id}
                  clickable
                  avatar={
                    shape.icon ? (
                      <img
                        src={shape.icon}
                        alt=""
                        style={{ width: 18, height: 18, objectFit: "contain" }}
                      />
                    ) : undefined
                  }
                  label={shape.label.split("/")[0].trim()}
                  variant={isSelected ? "filled" : "outlined"}
                  color={isSelected ? "primary" : "default"}
                  onClick={() => handleSelectShape(shape.id, shape.label)}
                  sx={{
                    fontWeight: isSelected ? 800 : 500,
                    borderRadius: 2,
                    borderWidth: isSelected ? 2 : 1,
                  }}
                />
              );
            })}

            <Button
              size="small"
              variant="text"
              endIcon={showMoreShapes ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setShowMoreShapes((prev) => !prev)}
              sx={{ textTransform: "none", fontSize: "0.75rem", py: 0 }}
            >
              {showMoreShapes ? "Fewer shapes" : "More shapes..."}
            </Button>
          </Box>

          {/* Expanded Shapes & Autocomplete */}
          <Collapse in={showMoreShapes}>
            <Box sx={{ pt: 1 }}>
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}
              >
                {COMMON_SHAPES.slice(10).map((shape) => {
                  const isSelected = component.shape === shape.id;
                  return (
                    <Chip
                      key={shape.id}
                      clickable
                      avatar={
                        shape.icon ? (
                          <img
                            src={shape.icon}
                            alt=""
                            style={{
                              width: 18,
                              height: 18,
                              objectFit: "contain",
                            }}
                          />
                        ) : undefined
                      }
                      label={shape.label.split("/")[0].trim()}
                      variant={isSelected ? "filled" : "outlined"}
                      color={isSelected ? "primary" : "default"}
                      onClick={() => handleSelectShape(shape.id, shape.label)}
                      sx={{
                        fontWeight: isSelected ? 800 : 500,
                        borderRadius: 2,
                      }}
                    />
                  );
                })}
              </Box>

              {/* Full Taxonomy Search */}
              {packagingShapesOptions.length > 0 && (
                <Autocomplete
                  size="small"
                  options={packagingShapesOptions}
                  getOptionLabel={(opt) => opt.label}
                  value={
                    packagingShapesOptions.find(
                      (o) => o.value === component.shape,
                    ) ?? null
                  }
                  onChange={(_e, newVal) => {
                    if (newVal) {
                      handleSelectShape(newVal.value, newVal.label);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search all shapes (tub, roll, envelope...)"
                    />
                  )}
                />
              )}
            </Box>
          </Collapse>
        </Box>

        {/* 2. MATERIAL SELECTOR */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography
              variant="caption"
              fontWeight={800}
              color="text.secondary"
              textTransform="uppercase"
            >
              2. Material (Be gentle)
            </Typography>
            {activeMaterial && (
              <Chip
                size="small"
                label={activeMaterial.label}
                color="secondary"
                sx={{ height: 22, fontWeight: 700 }}
              />
            )}
          </Stack>

          {/* Gentle Primary Material Chips */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {GENTLE_MATERIALS.map((mat) => {
              const isSelected = component.material === mat.id;
              return (
                <Chip
                  key={mat.id}
                  clickable
                  label={
                    <span>
                      {mat.emoji} {mat.label}
                    </span>
                  }
                  variant={isSelected ? "filled" : "outlined"}
                  color={isSelected ? "primary" : "default"}
                  onClick={() => handleSelectMaterial(mat.id, mat.label)}
                  sx={{
                    fontWeight: isSelected ? 800 : 600,
                    borderRadius: 2,
                    borderWidth: isSelected ? 2 : 1,
                  }}
                />
              );
            })}

            <Button
              size="small"
              variant="text"
              endIcon={showResins ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setShowResins((prev) => !prev)}
              sx={{ textTransform: "none", fontSize: "0.75rem", py: 0 }}
            >
              {showResins
                ? "Hide specific resins"
                : "Specific resin (if known)..."}
            </Button>
          </Box>

          {/* Expandable Specific Resins with official SVG icons */}
          <Collapse in={showResins}>
            <Box sx={{ pt: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.75 }}
              >
                Exact resin codes (PET 01, HDPE 02, PP 05, etc.):
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {SPECIFIC_RESINS.map((resin) => {
                  const isSelected = component.material === resin.id;
                  return (
                    <Chip
                      key={resin.badge}
                      clickable
                      avatar={
                        resin.icon ? (
                          <img
                            src={resin.icon}
                            alt=""
                            style={{
                              width: 18,
                              height: 18,
                              objectFit: "contain",
                            }}
                          />
                        ) : undefined
                      }
                      label={resin.badge}
                      variant={isSelected ? "filled" : "outlined"}
                      color={isSelected ? "primary" : "default"}
                      onClick={() =>
                        handleSelectMaterial(resin.id, resin.label)
                      }
                      sx={{
                        fontWeight: isSelected ? 800 : 600,
                        borderRadius: 2,
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* 3. RECYCLING SELECTOR */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography
              variant="caption"
              fontWeight={800}
              color="text.secondary"
              textTransform="uppercase"
            >
              3. Recycling Instruction
            </Typography>
            {component.recycling && (
              <Chip
                size="small"
                label={
                  RECYCLING_OPTIONS.find((r) => r.id === component.recycling)
                    ?.label || component.recycling
                }
                color={
                  component.recycling === "en:recycle"
                    ? "success"
                    : component.recycling === "en:discard"
                      ? "error"
                      : "default"
                }
                sx={{ height: 22, fontWeight: 700 }}
              />
            )}
          </Stack>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {RECYCLING_OPTIONS.map((rec) => {
              const isSelected = component.recycling === rec.id;
              return (
                <Chip
                  key={rec.id}
                  clickable
                  label={
                    <span>
                      {rec.emoji} {rec.label.split("/")[0].trim()}
                    </span>
                  }
                  variant={isSelected ? "filled" : "outlined"}
                  color={rec.color}
                  onClick={() => handleSelectRecycling(rec.id, rec.label)}
                  sx={{
                    fontWeight: isSelected ? 800 : 600,
                    borderRadius: 2,
                    borderWidth: isSelected ? 2 : 1,
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Stack>
    </Card>
  );
}
