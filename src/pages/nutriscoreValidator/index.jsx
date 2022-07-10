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

const BUFFER_THRESHOLD = 30;
const PAGE_SIZE = 50;

export default function NutriscoreValidator() {
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
      <Box sx={{ padding: 5, textAlign: "center" }}>
        <TextField value={nutriscoreGrade} onChange={updateSearchedGrad} select>
          <MenuItem value="a">Nutriscore A</MenuItem>
          <MenuItem value="b">Nutriscore B</MenuItem>
          <MenuItem value="c">Nutriscore C</MenuItem>
          <MenuItem value="d">Nutriscore D</MenuItem>
          <MenuItem value="e">Nutriscore E</MenuItem>
        </TextField>
      </Box>
      <Divider sx={{ mb: 4 }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(410px, 1fr))",
          gridGap: 10,
        }}
      >
        {buffer.map((question) => (
          <Card sx={{ width: 400, height: 400 }} key={question.insight_id}>
            <CardActionArea
              sx={{ width: 400, height: 400, position: "relative" }}
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

      <Stack
        direction="row"
        justifyContent="end"
        sx={{ paddingX: 5, paddingY: 10 }}
      >
        <Button
          size="large"
          variant="contained"
          color="error"
          onClick={() => {
            selectedIds.forEach((insight_id) =>
              answerQuestion({ value: 0, insightId: insight_id })
            );
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
          }}
          fullWidth
        >
          Correct (Nutriscore {nutriscoreGrade.toUpperCase()})
        </Button>
      </Stack>
    </Box>
  );
}
