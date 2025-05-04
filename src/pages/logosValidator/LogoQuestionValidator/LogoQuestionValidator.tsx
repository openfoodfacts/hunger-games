import * as React from "react";
import { useTranslation } from "react-i18next";

import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";

import useUrlParams from "../../../hooks/useUrlParams";
import { URL_ORIGINE } from "../../../const";

import { LOGOS } from "../dashboardDefinition";
import Loader from "../../loader";
import useQuestions from "../../../hooks/useQuestions";
import { useFilterState } from "../../../hooks/useFilterState";
import NoMoreLogos from "./NoMoreLogos";
import { LogoQuestionCard } from "./LogoQuestionCard";

function LogoQuestionValidator() {
  const { t } = useTranslation();

  const [controlledState, setControlledState] = useUrlParams(
    {
      imageSize: 200,
      zoomOnLogo: true,
    },
    {},
  );

  const imageSize = Number.parseInt(controlledState.imageSize);
  const zoomOnLogo = JSON.parse(controlledState.zoomOnLogo);

  const [filterState] = useFilterState();

  const selectedOption = React.useMemo(
    () => LOGOS[filterState.valueTag as keyof typeof LOGOS] ?? {},
    [filterState.valueTag],
  );

  const { questions, questionsCount, status, answerQuestion } = useQuestions(
    undefined,
    {
      pageSize: 20,
      forcedParams: {
        insightType: selectedOption.type,
        valueTag: filterState.valueTag,
        sorted: "false",
        predictor:
          selectedOption?.predictor === undefined
            ? "universal-logo-detector"
            : selectedOption?.predictor,
      },
    },
  );

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [lastClickedId, setLastClickedId] = React.useState<string | null>(null);

  const toggleSelection = (insight_id: string) => (event: React.MouseEvent) => {
    if (event.shiftKey) {
      setSelectedIds((prev) => {
        const selectRange = !!lastClickedId && prev.includes(lastClickedId);
        let isInRange = false;
        const rangeIds = questions
          .map((question) => {
            if (
              question.insight_id === insight_id ||
              question.insight_id === lastClickedId
            ) {
              isInRange = !isInRange;
              if (!isInRange) {
                return question.insight_id;
              }
            }
            return isInRange ? question.insight_id : null;
          })
          .filter((x) => x !== null);

        if (selectRange) {
          return [...prev, ...rangeIds.filter((id) => !prev.includes(id))];
        }
        return prev.filter((id) => !rangeIds.includes(id));
      });
    } else {
      setSelectedIds((prev) =>
        prev.includes(insight_id)
          ? prev.filter((id) => id !== insight_id)
          : [...prev, insight_id],
      );
    }
    setLastClickedId(insight_id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!event.shiftKey || !lastClickedId) {
      return;
    }
    const lastClickedIndex = questions.findIndex(
      (question) => question.insight_id === lastClickedId,
    );
    if (lastClickedIndex === -1) {
      return;
    }

    let indexToAdd;
    if (event.key === "ArrowRight") {
      indexToAdd = lastClickedIndex + 1;
    } else if (event.key === "ArrowLeft") {
      indexToAdd = lastClickedIndex - 1;
    } else {
      return;
    }

    if (indexToAdd < 0 || indexToAdd >= questions.length) {
      return;
    }

    const idsToAdd = [lastClickedId, questions[indexToAdd].insight_id];

    setSelectedIds((prev) => [
      ...prev,
      ...idsToAdd.filter((id) => !prev.includes(id)),
    ]);
    setLastClickedId(questions[indexToAdd].insight_id);
  };

  const selectAll = () => {
    setSelectedIds(questions.map((question) => question.insight_id));
  };
  const unselectAll = () => {
    setSelectedIds([]);
  };

  const sendAnswers = (answer: 0 | 1) => {
    selectedIds.forEach((insight_id) => {
      const question = questions.find((q) => q.insight_id === insight_id);
      if (question) {
        answerQuestion({
          answer,
          question,
        });
      }
    });
    setSelectedIds([]);
  };

  return (
    <Box>
      <Box sx={{ padding: 2 }}>
        <Typography>{t("nutriscore.label")}</Typography>
        <Typography>
          {t("nutriscore.description", {
            label: selectedOption.label,
          })}
        </Typography>
        <Typography>
          Ici vous annotez des produits. Mais vous pouvez aussi aider Robotoff
          en annotant des logos détectés à cette adresse:{" "}
          <Link
            href={`${URL_ORIGINE}/logos/deep-search?type=label&value=${selectedOption.tag}`}
            target="_blank"
          >
            recherche des logos {selectedOption.label}
          </Link>
          .
        </Typography>
      </Box>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ pt: 5, px: 5, pb: 0, textAlign: "center" }}
      >
        <Typography sx={{ mx: 3 }}>
          {t("nutriscore.images_remaining", {
            remaining: questionsCount === 100 ? ">100" : questionsCount,
          })}
        </Typography>
        {selectedOption.logo && (
          <img
            src={selectedOption.logo}
            alt="searched logo"
            style={{ maxHeight: 75 }}
          />
        )}
        <Box sx={{ mx: 2, width: 500, maxWidth: 500, textAlign: "left" }}>
          <Typography gutterBottom>{t("nutriscore.image_sizes")}</Typography>
          <Slider
            aria-label={t("nutriscore.image_sizes")}
            value={imageSize}
            onChangeCommitted={(event, newValue) =>
              setControlledState((prev: any) => ({
                ...prev,
                imageSize: newValue,
              }))
            }
            valueLabelDisplay="auto"
            step={50}
            marks
            min={50}
            max={500}
            sx={{ maxWidth: 500 }}
          />
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={zoomOnLogo}
              onChange={(event) =>
                setControlledState((prev: any) => ({
                  ...prev,
                  zoomOnLogo: event.target.checked,
                }))
              }
            />
          }
          label={t("nutriscore.zoom_on_logo")}
          labelPlacement="end"
        />
      </Stack>
      <Stack
        direction="row"
        justifyContent="start"
        alignItems="center"
        sx={{ px: 5, py: 1, textAlign: "left" }}
      >
        <Button onClick={selectAll} size="small" sx={{ mr: 2 }}>
          {t("nutriscore.select_all")}
        </Button>
        <Button onClick={unselectAll} size="small">
          {t("nutriscore.deselect_all")}
        </Button>
      </Stack>

      <Divider sx={{ mb: 4 }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, minmax(${
            imageSize + 10
          }px, 1fr))`,
          gridGap: 10,
        }}
        onKeyDown={handleKeyDown}
      >
        {questions
          .filter(
            (question) =>
              question.insight_id && question.insight_id !== "NO_QUESTION_LEFT",
          )
          .map((question) => (
            <LogoQuestionCard
              key={question.insight_id}
              question={question}
              onClick={toggleSelection(question.insight_id)}
              checked={selectedIds.includes(question.insight_id)}
              imageSize={imageSize}
              zoomOnLogo={zoomOnLogo}
            />
          ))}
      </div>

      {!questionsCount && status === "success" && (
        <NoMoreLogos {...filterState} />
      )}

      <Paper
        sx={{
          paddingX: 2,
          paddingY: 1,
          position: "sticky",
          bottom: 0,
          marginTop: 2,
        }}
      >
        <Stack direction="row" justifyContent="end">
          <Button
            size="large"
            variant="contained"
            color="error"
            onClick={() => sendAnswers(0)}
            fullWidth
          >
            {t("nutriscore.incorrect")}
          </Button>
          <Button
            sx={{ ml: 3 }}
            size="large"
            variant="contained"
            color="success"
            onClick={() => sendAnswers(1)}
            fullWidth
          >
            {t("nutriscore.correct", {
              label: selectedOption.label,
            })}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default function WrappedLogoQuestionValidator() {
  return (
    <React.Suspense fallback={<Loader />}>
      <LogoQuestionValidator />
    </React.Suspense>
  );
}
