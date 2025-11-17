import * as React from "react";
import { useTranslation } from "react-i18next";

import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";

import { useParams } from "react-router";
import { Provider, useDispatch, useSelector } from "react-redux";

import store, {
  fetchQuestions,
  updateFilter,
  filterStateSelector,
  nbOfQuestionsInBufferSelector,
  questionsToAnswerSelector,
  numberOfQuestionsAvailableSelector,
  answerQuestion as answerQuestionAction,
} from "../questions/store";
import robotoff from "../../robotoff";
import off from "../../off";
import useUrlParams from "../../hooks/useUrlParams";
import { URL_ORIGINE } from "../../const";

import { LOGOS } from "./dashboardDefinition";
import Loader from "../loader";

const fetchData = async (insightId) => {
  const response = await robotoff.insightDetail(insightId);

  if (!response) {
    return response;
  }

  let bounding_box = response.data?.bounding_box;
  const source_image = response.data?.source_image;
  const logo_id = response.data?.data?.logo_id;

  if (source_image && logo_id && !bounding_box) {
    const logoData = await robotoff.getLogosImages([logo_id]);
    bounding_box = logoData?.data?.logos?.[0]?.bounding_box;
  }

  return { source_image, bounding_box };
};

const LogoQuesitonCard = (props) => {
  const { t } = useTranslation();
  const { question, toggleSelection, checked, imageSize, zoomOnLogo } = props;

  const [croppedImageUrl, setCroppedImageUrl] = React.useState("");

  React.useEffect(() => {
    if (!zoomOnLogo) {
      setCroppedImageUrl(question.source_image_url);
      return;
    }

    let isValidQuery = true;

    const getImageUrl = async () => {
      const { source_image, bounding_box } = await fetchData(
        question.insight_id,
      );

      if (!isValidQuery) {
        return;
      }

      if (bounding_box && source_image) {
        setCroppedImageUrl(
          robotoff.getCroppedImageUrl(
            off.getImageUrl(source_image),
            bounding_box,
          ),
        );
      }
    };
    getImageUrl().catch(() => {});

    return () => {
      isValidQuery = false;
    };
  }, [question.insight_id, question.source_image_url, zoomOnLogo]);

  return (
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
        {croppedImageUrl ? (
          <img
            src={croppedImageUrl}
            alt={t("nutriscore.image_alt")}
            loading="lazy"
            style={{ objectFit: "contain", width: "100%", height: "100%" }}
          />
        ) : (
          <Typography>NOT A LOGO</Typography>
        )}
        <Checkbox
          sx={{ position: "absolute", bottom: 10, right: 10 }}
          checked={checked}
          readOnly
          size="large"
        />
      </CardActionArea>
    </Card>
  );
};

const NoMoreLogos = ({ insightType, valueTag }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ width: "100%", textAlign: "center", py: 5, m: 0 }}>
      <Typography variant="subtitle1">
        {t("logos.no_more_questions")}
      </Typography>
      <Button
        color="secondary"
        size="small"
        component={Link}
        variant="contained"
        href={`/logos/deep-search?type=${insightType}&value=${valueTag}`}
        target="_blank"
        sx={{ ml: 2, minWidth: 150 }}
      >
        Search
      </Button>
    </Box>
  );
};

function LogoQuestionValidator() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [controlledState, setControlledState] = useUrlParams(
    {
      imageSize: 200,
      zoomOnLogo: true,
    },
    {},
  );
  const { valueTag } = useParams();
  const imageSize = Number.parseInt(controlledState.imageSize);
  const zoomOnLogo = JSON.parse(controlledState.zoomOnLogo);

  const selectedOption = React.useMemo(() => LOGOS[valueTag] ?? {}, [valueTag]);

  React.useLayoutEffect(() => {
    dispatch(
      updateFilter({
        insightType: selectedOption.type,
        sortByPopularity: false,
        valueTag,
        predictor:
          selectedOption?.predictor === undefined
            ? "universal-logo-detector"
            : selectedOption?.predictor,
      }),
    );
  }, [dispatch, valueTag, selectedOption]);

  const [selectedIds, setSelectedIds] = React.useState([]);
  const [lastClickedId, setLastClickedId] = React.useState(null);

  const buffer = useSelector(questionsToAnswerSelector);
  const numberOfQuestionsAvailable = useSelector(
    numberOfQuestionsAvailableSelector,
  );
  const filterState = useSelector(filterStateSelector);
  const answerQuestion = React.useCallback(
    ({ insight_id, value }) =>
      dispatch(answerQuestionAction({ insight_id, value })),
    [dispatch],
  );

  const remainingQuestionNb = useSelector(nbOfQuestionsInBufferSelector);
  React.useEffect(() => {
    if (remainingQuestionNb < 5) {
      dispatch(fetchQuestions());
    }
  }, [dispatch, remainingQuestionNb]);

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
          : [...prev, insight_id],
      );
    }
    setLastClickedId(insight_id);
  };

  const handleKeyDown = (event) => {
    if (!event.shiftKey) {
      return;
    }
    const lastClickedIndexInBuffer = buffer.findIndex(
      (question) => question.insight_id === lastClickedId,
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
            remaining: numberOfQuestionsAvailable,
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
              question.insight_id && question.insight_id !== "NO_QUESTION_LEFT",
          )
          .map((question) => (
            <LogoQuesitonCard
              key={question.insight_id}
              question={question}
              toggleSelection={toggleSelection}
              checked={selectedIds.includes(question.insight_id)}
              imageSize={imageSize}
              zoomOnLogo={zoomOnLogo}
            />
          ))}
      </div>

      {remainingQuestionNb === 0 && <NoMoreLogos {...filterState} />}

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
                  insight_id,
                }),
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
                  insight_id,
                }),
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

export default function WrappedLogoQuestionValidator() {
  return (
    <React.Suspense fallback={<Loader />}>
      <Provider store={store}>
        <LogoQuestionValidator />
      </Provider>
    </React.Suspense>
  );
}
