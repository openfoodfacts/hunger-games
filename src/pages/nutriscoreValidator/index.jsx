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

const BUFFER_THRESHOLD = 30;
const PAGE_SIZE = 50;

export default function NutriscoreValidator() {
  const [imageSize, setImageSize] = React.useState(300);

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

  const { buffer, answerQuestion } = useQuestionBuffer(
    filterState,
    PAGE_SIZE,
    BUFFER_THRESHOLD
  );

  return (
    <Box>
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
        <Box sx={{ mx: 2, width: 500, maxWidth: 500, textAlign: "left" }}>
          <Typography gutterBottom>Image sizes</Typography>
          <Slider
            aria-label="Temperature"
            defaultValue={imageSize}
            onChangeCommitted={(event, newValue) => setImageSize(newValue)}
            valueLabelDisplay="auto"
            step={50}
            marks
            min={50}
            max={500}
            sx={{ maxWidth: 500 }}
          />
        </Box>
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
              <CardMedia
                component="img"
                src={question.source_image_url}
                alt=""
                sx={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  margin: "auto",
                }}
                loading="lazy"
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
                answerQuestion({ value: 0, insightId: insight_id })
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
                answerQuestion({ value: 1, insightId: insight_id })
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
