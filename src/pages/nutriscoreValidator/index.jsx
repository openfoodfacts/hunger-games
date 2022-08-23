import * as React from "react";

import { useQuestionBuffer } from "../questions/useQuestionBuffer";

import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";

import robotoff from "../../robotoff";

const BUFFER_THRESHOLD = 1;
const PAGE_SIZE = 50;

const NutriscoreImage = ({ question, imageSize, zoomOnLogo }) => {
  const [cropArea, setCropArea] = React.useState([0, 0, 1, 1]);

  React.useEffect(() => {
    if (!zoomOnLogo) {
      return;
    }
    robotoff
      .insightDetail(question.insight_id)
      .then(({ data }) => {
        if (data.data.bounding_box) {
          setCropArea(data.data.bounding_box);
        }
      })
      .catch(() => {});
  }, [question.insight_id, zoomOnLogo]);

  if (!question.insight_id) {
    return null;
  }

  const dx = zoomOnLogo ? 1 / (cropArea[3] - cropArea[1]) : 1;
  const dy = zoomOnLogo ? 1 / (cropArea[2] - cropArea[0]) : 1;

  const sizeX = `${Math.round(Math.max(0.5, dx) * imageSize)}px`;
  const sizeY = `${Math.round(Math.max(0.5, dy) * imageSize)}px`;

  const useXScale = zoomOnLogo ? dx < dy : sizeX > sizeY;
  return (
    <CardMedia
      component="div"
      sx={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <img
        src={question.source_image_url}
        alt=""
        style={{
          width: useXScale ? sizeX : "auto",
          height: !useXScale ? sizeY : "auto",
          position: "absolute",
          top: 0,
          left: 0,
          transform: zoomOnLogo
            ? `translate(-${cropArea[1] * 100}%, -${cropArea[0] * 100}%)`
            : "",
        }}
        loading="lazy"
      />
    </CardMedia>
  );
};

export default function NutriscoreValidator() {
  const [imageSize, setImageSize] = React.useState(300);
  const [zoomOnLogo, setZoomOnLogo] = React.useState(true);

  const [nutriscoreGrade, setNutriscoreGrade] = React.useState("a");
  const [filterState, setFilterState] = React.useState({
    insightType: "label",
    brandFilter: "",
    countryFilter: "",
    sortByPopularity: false,
    valueTag: "en:nutriscore-grade-a",
  });
  const [selectedIds, setSelectedIds] = React.useState([]);

  const updateSearchedGrad = (event) => {
    const newGrade = event.target.value;
    if (nutriscoreGrade === newGrade) {
      return;
    }
    setSelectedIds([]);
    setNutriscoreGrade(newGrade);
    setFilterState((prevState) => ({
      ...prevState,
      valueTag: `en:nutriscore-grade-${newGrade}`,
    }));
  };

  const toggleSelection = (insight_id) => () => {
    setSelectedIds((prev) =>
      prev.includes(insight_id)
        ? prev.filter((id) => id !== insight_id)
        : [...prev, insight_id]
    );
  };

  const { buffer, answerQuestion, remainingQuestionNb } = useQuestionBuffer(
    filterState,
    PAGE_SIZE,
    BUFFER_THRESHOLD
  );

  return (
    <Box>
      <Box sx={{ padding: 2 }}>
        <Typography>Annotate nutriscore logo detection by batch.</Typography>
        <Typography>
          To do so select all the images showing the correct/wrong nutriscore
          value (nutriscore {nutriscoreGrade.toUpperCase()}), and click on the
          bottom buttons to say if you selected a set correct or wrong ones.
        </Typography>
      </Box>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ padding: 5, textAlign: "center" }}
      >
        <TextField value={nutriscoreGrade} onChange={updateSearchedGrad} select>
          <MenuItem value="a">Nutriscore A</MenuItem>
          <MenuItem value="b">Nutriscore B</MenuItem>
          <MenuItem value="c">Nutriscore C</MenuItem>
          <MenuItem value="d">Nutriscore D</MenuItem>
          <MenuItem value="e">Nutriscore E</MenuItem>
        </TextField>
        <Typography sx={{ mx: 3 }}>
          Still {remainingQuestionNb} to annotate
        </Typography>
        <Box sx={{ mx: 2, width: 500, maxWidth: 500, textAlign: "left" }}>
          <Typography gutterBottom>Image sizes</Typography>
          <Slider
            aria-label="Image size"
            value={imageSize}
            onChangeCommitted={(event, newValue) => setImageSize(newValue)}
            valueLabelDisplay="auto"
            step={50}
            marks
            min={50}
            max={500}
            sx={{ maxWidth: 500 }}
          />
        </Box>

        <FormControlLabel
          onChange={(event) => setZoomOnLogo(event.target.checked)}
          control={<Checkbox checked={zoomOnLogo} />}
          label="zoom on logo"
          labelPlacement="end"
        />
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
      >
        {buffer.map((question) => (
          <Card
            sx={{ width: imageSize, height: imageSize }}
            key={question.insight_id}
          >
            <CardActionArea
              sx={{ width: imageSize, height: imageSize, position: "relative" }}
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
            Wrong
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
            Correct (Nutriscore {nutriscoreGrade.toUpperCase()})
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
