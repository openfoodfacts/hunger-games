import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import PackagingComponentCard from "./PackagingComponentCard";
import type { Option } from "../../hooks/useOptions";
import type { EditablePackagingComponent } from "./types";

type PackagingComponentsListProps = {
  components: EditablePackagingComponent[];
  packagingShapesOptions: Option[];
  packagingMaterialsOptions: Option[];
  packagingRecyclingOptions: Option[];
  isSubmitting: boolean;
  onComponentChange: (
    index: number,
    updated: EditablePackagingComponent,
  ) => void;
  onDeleteComponent: (index: number) => void;
  onDuplicateComponent: (index: number) => void;
  onAddComponent: () => void;
  onClearAll: () => void;
  onSkip: () => void;
  onSubmit: () => void;
};

export default function PackagingComponentsList({
  components,
  packagingShapesOptions,
  packagingMaterialsOptions,
  packagingRecyclingOptions,
  isSubmitting,
  onComponentChange,
  onDeleteComponent,
  onDuplicateComponent,
  onAddComponent,
  onClearAll,
  onSkip,
  onSubmit,
}: PackagingComponentsListProps) {
  const hasComponents = components.length > 0;

  return (
    <Box>
      <Stack spacing={2}>
        {/* Header bar above components */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1" fontWeight={800}>
            📦 Packaging Components ({components.length})
          </Typography>
          {hasComponents && (
            <Button
              size="small"
              color="inherit"
              startIcon={<DeleteSweepIcon fontSize="small" />}
              onClick={onClearAll}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                color: "text.secondary",
              }}
            >
              Clear All
            </Button>
          )}
        </Stack>

        {/* List of Component Cards */}
        {components.map((comp, idx) => (
          <PackagingComponentCard
            key={comp.id}
            index={idx}
            component={comp}
            packagingShapesOptions={packagingShapesOptions}
            packagingMaterialsOptions={packagingMaterialsOptions}
            packagingRecyclingOptions={packagingRecyclingOptions}
            onChange={(updated) => onComponentChange(idx, updated)}
            onDelete={() => onDeleteComponent(idx)}
            onDuplicate={() => onDuplicateComponent(idx)}
          />
        ))}

        {/* Empty state */}
        {!hasComponents && (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 3,
              borderStyle: "dashed",
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <Typography fontSize="2.5rem" sx={{ mb: 1 }}>
              🥡
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
              No components added yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click any 1-Click Template or Smart Proposition above, or add a
              custom component:
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onAddComponent}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
            >
              Add First Component
            </Button>
          </Paper>
        )}

        {/* Add Another Component Button */}
        {hasComponents && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAddComponent}
            fullWidth
            sx={{
              py: 1.25,
              borderRadius: 2.5,
              borderStyle: "dashed",
              borderWidth: 2,
              fontWeight: 700,
              textTransform: "none",
            }}
          >
            + Add Another Packaging Component
          </Button>
        )}

        {/* Action Controls Bar */}
        <Paper
          elevation={4}
          sx={{
            p: 2,
            mt: 3,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            position: "sticky",
            bottom: 16,
            zIndex: 10,
            boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              startIcon={<SkipNextIcon />}
              onClick={onSkip}
              disabled={isSubmitting}
              sx={{
                width: { xs: "100%", sm: "auto" },
                minWidth: 140,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Skip (Space)
            </Button>

            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <CheckCircleIcon />
                )
              }
              onClick={onSubmit}
              disabled={isSubmitting || !hasComponents}
              sx={{
                width: { xs: "100%", sm: "auto" },
                minWidth: 220,
                py: 1.25,
                borderRadius: 2,
                fontSize: "1rem",
                fontWeight: 800,
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(76, 175, 80, 0.4)",
              }}
            >
              {isSubmitting
                ? "Saving..."
                : `Validate & Next (${components.length}) ↵`}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
