import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import InsightsIcon from "@mui/icons-material/Insights";
import { useTranslation } from "react-i18next";
import {
  useGameOpportunities,
  type OpportunityGameType,
} from "../hooks/useGameOpportunities";

export interface GameOpportunityBadgeProps {
  game: OpportunityGameType;
  country?: string;
}

export default function GameOpportunityBadge({
  game,
  country,
}: GameOpportunityBadgeProps) {
  const { t } = useTranslation();
  const { data: count, isLoading } = useGameOpportunities(game, country);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      sx={{ mb: 2 }}
    >
      <Chip
        icon={<InsightsIcon fontSize="small" />}
        label={
          isLoading ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            `${(count ?? 0).toLocaleString()} ${t("opportunities.label", "opportunities")}`
          )
        }
        color={count && count > 0 ? "primary" : "default"}
        variant={count && count > 0 ? "filled" : "outlined"}
        size="small"
      />
    </Stack>
  );
}
