import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import Tooltip from "@mui/material/Tooltip";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import { PRESET_COMBOS } from "./constants";
import type {
  DetectedPackagingItem,
  EditablePackagingComponent,
  PresetCombo,
} from "./types";
import type { QuestionInterface } from "../../robotoff";

type SmartSuggestionsPanelProps = {
  predictions: DetectedPackagingItem[];
  robotoffQuestions: QuestionInterface[];
  onApplyPreset: (combo: PresetCombo) => void;
  onApplyPredictions: (items: DetectedPackagingItem[]) => void;
  onAddSinglePrediction: (item: DetectedPackagingItem) => void;
  onAddCustomUnit: (unit: Partial<EditablePackagingComponent>) => void;
};

export default function SmartSuggestionsPanel({
  predictions,
  robotoffQuestions,
  onApplyPreset,
  onApplyPredictions,
  onAddSinglePrediction,
}: SmartSuggestionsPanelProps) {
  const hasPredictions = predictions.length > 0;
  const hasRobotoff = robotoffQuestions.length > 0;

  return (
    <Box sx={{ mb: 2.5 }}>
      {/* 1. Detected Suggestions Banner if any detected from OCR/Category/Labels */}
      {(hasPredictions || hasRobotoff) && (
        <Card
          variant="outlined"
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 3,
            bgcolor: "primary.50",
            borderColor: "primary.light",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <AutoAwesomeIcon color="primary" fontSize="small" />
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color="primary.main"
                >
                  Smart Predictions Found
                </Typography>
                <Chip
                  size="small"
                  label={`${predictions.length} detected`}
                  color="primary"
                  sx={{ fontWeight: 700, height: 22 }}
                />
              </Stack>

              {hasPredictions && (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={() => onApplyPredictions(predictions)}
                  sx={{
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: 2,
                    boxShadow: "none",
                  }}
                >
                  Apply All Detected
                </Button>
              )}
            </Stack>

            {/* Individual Prediction Chips */}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
              {predictions.map((pred, idx) => (
                <Tooltip
                  key={`${pred.description}-${idx}`}
                  title={`${pred.description} (Source: ${pred.source}) - Click to add`}
                >
                  <Chip
                    clickable
                    icon={<FlashOnIcon sx={{ fontSize: "1rem !important" }} />}
                    label={
                      <span>
                        {pred.numberOfUnits && pred.numberOfUnits > 1 ? (
                          <strong>{pred.numberOfUnits}x </strong>
                        ) : null}
                        <strong>{pred.shape?.name || "Unit"}</strong>
                        {pred.material ? ` • ${pred.material.name}` : ""}
                        {pred.recycling ? ` (${pred.recycling.name})` : ""}
                      </span>
                    }
                    onClick={() => onAddSinglePrediction(pred)}
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      "&:hover": { bgcolor: "primary.100" },
                    }}
                  />
                </Tooltip>
              ))}

              {/* Robotoff question proposals */}
              {robotoffQuestions.map((q) => (
                <Chip
                  key={q.insight_id}
                  label={`Robotoff: ${q.value || q.question}`}
                  color="secondary"
                  variant="outlined"
                  clickable
                  onClick={() => {
                    onAddSinglePrediction({
                      source: "robotoff",
                      confidence: "high",
                      description: q.value,
                      shape: { id: q.value_tag, name: q.value },
                    });
                  }}
                  sx={{ fontWeight: 600, borderRadius: 2 }}
                />
              ))}
            </Stack>
          </Stack>
        </Card>
      )}

      {/* 2. Instant Presets ("For the Lazy") */}
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <FlashOnIcon color="warning" fontSize="small" />
          <Typography variant="subtitle2" fontWeight={800} color="text.primary">
            Quick 1-Click Templates (For the Lazy)
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(5, 1fr)",
            },
            gap: 1,
          }}
        >
          {PRESET_COMBOS.map((combo) => (
            <Card
              key={combo.id}
              variant="outlined"
              sx={{
                borderRadius: 2.5,
                transition:
                  "transform 0.15s, border-color 0.15s, box-shadow 0.15s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  borderColor: "primary.main",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                },
              }}
            >
              <CardActionArea
                onClick={() => onApplyPreset(combo)}
                sx={{ height: "100%", p: 1.25 }}
              >
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                  <Stack spacing={0.5} alignItems="center" textAlign="center">
                    <Typography fontSize="1.6rem" lineHeight={1}>
                      {combo.emoji}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      noWrap
                      sx={{ width: "100%", fontSize: "0.82rem" }}
                      title={combo.title}
                    >
                      {combo.title}
                    </Typography>
                    {combo.badge && (
                      <Chip
                        size="small"
                        label={combo.badge}
                        sx={{
                          height: 18,
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          bgcolor: "action.selected",
                        }}
                      />
                    )}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
