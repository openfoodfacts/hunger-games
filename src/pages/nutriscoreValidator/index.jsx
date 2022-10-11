import * as React from "react";
import { useTranslation } from "react-i18next";

import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";

import { useQuestionBuffer } from "../questions/useQuestionBuffer";
import robotoff from "../../robotoff";
import off from "../../off";
import useUrlParams from "../../hooks/useUrlParams";

const BUFFER_THRESHOLD = 10;
const PAGE_SIZE = 50;

const OPTIONS = [
  { tag: "en:nutriscore-grade-a", label: "Nutriscore A" },
  { tag: "en:nutriscore-grade-b", label: "Nutriscore B" },
  { tag: "en:nutriscore-grade-c", label: "Nutriscore C" },
  { tag: "en:nutriscore-grade-d", label: "Nutriscore D" },
  { tag: "en:nutriscore-grade-e", label: "Nutriscore E" },
  { tag: "fr:ab-agriculture-biologique", label: "AB (Agriculture Bio)" },
  { tag: "en:eu-organic", label: "Bio Européen" },
];

const fetchData = async (insightId) => {
  const response = await robotoff.insightDetail(insightId);

  if (
    response?.data?.source_image &&
    response?.data?.data?.logo_id &&
    !response?.data?.data?.bounding_box
  ) {
    const logoData = await robotoff.getLogosImages([
      response?.data?.data?.logo_id,
    ]);
    const bounding_box = logoData?.data?.logos?.[0]?.bounding_box;

    return { ...response, bounding_box };
  }

  return response;
};

const NutriscoreImage = ({ question, imageSize, zoomOnLogo }) => {
  const { t } = useTranslation();
  const [croppedImageUrl, setCroppedImageUrl] = React.useState("");

  React.useEffect(() => {
    if (!zoomOnLogo) {
      setCroppedImageUrl(question.source_image_url);
      return;
    }

    let isValidQuery = true;

    const getImageUrl = async () => {
      const { data, bounding_box } = await fetchData(question.insight_id);

      if (!isValidQuery) {
        return;
      }

      if (data?.data?.bounding_box && data?.source_image) {
        setCroppedImageUrl(
          robotoff.getCroppedImageUrl(
            off.getImageUrl(data?.source_image),
            data.data.bounding_box
          )
        );
      } else if (bounding_box && data?.source_image) {
        setCroppedImageUrl(
          robotoff.getCroppedImageUrl(
            off.getImageUrl(data?.source_image),
            bounding_box
          )
        );
      }
    };
    getImageUrl().catch(() => {});

    return () => {
      isValidQuery = false;
    };
  }, [question.insight_id, question.source_image_url, zoomOnLogo]);

  if (!question.insight_id || !croppedImageUrl) {
    return null;
  }

  return (
    <img
      src={croppedImageUrl}
      alt={t("nutriscore.image_alt")}
      loading="lazy"
      style={{ objectFit: "contain", width: "100%", height: "100%" }}
    />
  );
};

export default function NutriscoreValidator() {
  const { t } = useTranslation();

  const [selectedOption, setSelectedOption] = React.useState(OPTIONS[0]);
  const [controlledState, setControlledState] = useUrlParams({
    valueTag: "en:nutriscore-grade-a",
    imageSize: 200,
    zoomOnLogo: true,
  });

  const valueTag = controlledState.valueTag;
  const imageSize = Number.parseInt(controlledState.imageSize);
  const zoomOnLogo = JSON.parse(controlledState.zoomOnLogo);

  const filterState = React.useMemo(
    () => ({
      insightType: "label",
      brandFilter: "",
      countryFilter: "",
      sortByPopularity: false,
      valueTag,
    }),
    [valueTag]
  );

  const [selectedIds, setSelectedIds] = React.useState([]);
  const [lastClickedId, setLastClickedId] = React.useState(null);

  const updateSearchedGrad = (event) => {
    const newSelectedTag = event.target.value;
    if (selectedOption.tag === newSelectedTag) {
      return;
    }
    const newSelectedOption = OPTIONS.find(
      (option) => option.tag === newSelectedTag
    );
    setSelectedIds([]);
    setSelectedOption(newSelectedOption);
    setControlledState((prevState) => ({
      ...prevState,
      valueTag: newSelectedOption.tag,
    }));
  };

  const { buffer, answerQuestion, remainingQuestionNb } = useQuestionBuffer(
    filterState,
    PAGE_SIZE,
    BUFFER_THRESHOLD
  );

  const toggleSelection = (insight_id) => (event) => {
    if (event.shiftKey) {
      setSelectedIds((prev) => {
        const selectRange = prev.includes(lastClickedId);
        let isInRange = false;
        const rangeIds = buffer
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
          : [...prev, insight_id]
      );
    }
    setLastClickedId(insight_id);
  };

  const handleKeyDown = (event) => {
    if (!event.shiftKey) {
      return;
    }
    const lastClickedIndexInBuffer = buffer.findIndex(
      (question) => question.insight_id === lastClickedId
    );
    if (lastClickedIndexInBuffer === -1) {
      return;
    }

    let indexToAdd;
    if (event.key === "ArrowRight") {
      indexToAdd = lastClickedIndexInBuffer + 1;
    } else if (event.key === "ArrowLeft") {
      indexToAdd = lastClickedIndexInBuffer - 1;
    } else {
      return;
    }

    if (indexToAdd < 0 || indexToAdd >= buffer.length) {
      return;
    }

    const idsToAdd = [lastClickedId, buffer[indexToAdd].insight_id];

    setSelectedIds((prev) => [
      ...prev,
      ...idsToAdd.filter((id) => !prev.includes(id)),
    ]);
    setLastClickedId(buffer[indexToAdd].insight_id);
  };

  const selectAll = () => {
    setSelectedIds(buffer.map((question) => question.insight_id));
  };
  const unselectAll = () => {
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
      </Box>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ pt: 5, px: 5, pb: 0, textAlign: "center" }}
      >
        <TextField
          value={selectedOption.tag}
          onChange={updateSearchedGrad}
          select
        >
          {OPTIONS.map(({ tag, label }) => (
            <MenuItem value={tag} key={tag}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <Typography sx={{ mx: 3 }}>
          {t("nutriscore.images_remaining", { remaining: remainingQuestionNb })}
        </Typography>
        <Box sx={{ mx: 2, width: 500, maxWidth: 500, textAlign: "left" }}>
          <Typography gutterBottom>{t("nutriscore.image_sizes")}</Typography>
          <Slider
            aria-label={t("nutriscore.image_sizes")}
            value={imageSize}
            onChangeCommitted={(event, newValue) =>
              setControlledState((prev) => ({ ...prev, imageSize: newValue }))
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
          onChange={(event) =>
            setControlledState((prev) => ({
              ...prev,
              zoomOnLogo: event.target.checked,
            }))
          }
          control={<Checkbox checked={zoomOnLogo} />}
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
        {buffer
          .filter(
            (question) =>
              question.insight_id && question.insight_id !== "NO_QUESTION_LEFT"
          )
          .map((question) => (
            <Card
              sx={{ width: imageSize, height: imageSize }}
              key={question.insight_id}
            >
              <CardActionArea
                sx={{
                  width: imageSize,
                  height: imageSize,
                  position: "relative",
                }}
                onClick={toggleSelection(question.insight_id)}
                tabIndex={-1}
              >
                <NutriscoreImage
                  question={question}
                  imageSize={imageSize}
                  zoomOnLogo={zoomOnLogo}
                />
                <Checkbox
                  sx={{ position: "absolute", bottom: 10, right: 10 }}
                  checked={selectedIds.includes(question.insight_id)}
                  readOnly
                  size="large"
                />
              </CardActionArea>
            </Card>
          ))}
      </div>

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
            onClick={() => {
              selectedIds.forEach((insight_id) =>
                answerQuestion({
                  value: 0,
                  insightId: insight_id,
                  pendingDelay: 100,
                })
              );
              setSelectedIds([]);
            }}
            fullWidth
          >
            {t("nutriscore.incorrect")}
          </Button>
          <Button
            sx={{ ml: 3 }}
            size="large"
            variant="contained"
            color="success"
            onClick={() => {
              selectedIds.forEach((insight_id) =>
                answerQuestion({
                  value: 1,
                  insightId: insight_id,
                  pendingDelay: 100,
                })
              );
              setSelectedIds([]);
            }}
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
