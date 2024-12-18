import * as React from "react";
import { useRobotoffPredictions } from "./useRobotoffPredictions";

import { Box, Button, Paper, Popper, Typography } from "@mui/material";
import Stack from "@mui/material/Stack";
import { ErrorBoundary } from "../taxonomyWalk/Error";
import { getDiff } from "./getDiff";
import ShowImage from "./ShowImage";

export default function Nutrition() {
  const anchorEl = React.useRef(null);

  const { isLoading, insight, nextItem, count, product } =
    useRobotoffPredictions();

  const { original, correction } = insight?.data ?? {};

  const [diff, suggestions] = React.useMemo(() => {
    if (original === undefined || correction === undefined) {
      return [undefined, undefined, undefined];
    }
    return getDiff(original, correction);
  }, [original, correction]);

  const [suggestionIndex, setSuggestionIndex] = React.useState(0);
  // The diff between the original and the corrected one.
  const [indexDiff, setIndexDiff] = React.useState(0);

  const [correctedText, setCorrectedText] = React.useState("");

  React.useEffect(() => {
    if (original === undefined) {
      return;
    }

    setCorrectedText(original);
    setIndexDiff(0);
    setSuggestionIndex(0);
  }, [original]);

  const suggestion = suggestions?.[suggestionIndex];

  const text1 = suggestion
    ? correctedText.slice(0, suggestion.from + indexDiff)
    : correctedText;
  const toModify = suggestion
    ? correctedText.slice(
        suggestion.from + indexDiff,
        suggestion.to + indexDiff,
      )
    : "";
  const text2 = suggestion
    ? correctedText.slice(suggestion.to + indexDiff)
    : "";

  if (!insight) {
    return <p></p>;
  }

  return (
    <React.Suspense>
      <ErrorBoundary>
        <Box sx={{ display: "flex" }}>
          <Box sx={{ width: "50%" }}>
            <ShowImage barcode={insight.barcode} images={product?.images} />
          </Box>
          <Box sx={{ width: "50%", p: 2 }}>
            <Typography>
              {text1}
              <span
                id="word-to-modify"
                ref={anchorEl}
                style={{ fontWeight: "bold" }}
              >
                {toModify}
              </span>
              {text2}
            </Typography>

            <Popper
              open={!!suggestion && !!anchorEl}
              anchorEl={anchorEl.current}
              placement="bottom-start"
              sx={{ my: 0.5 }}
            >
              {suggestion && (
                <Paper
                  sx={{
                    py: 0.5,
                    px: 2,
                    bgcolor: "background.paper",
                    pre: {
                      margin: 0,
                      padding: 0,
                    },
                  }}
                >
                  <pre>{suggestion.current}</pre>
                  <pre>{suggestion.proposed}</pre>
                  <Stack direction="row">
                    <Button
                      color="error"
                      variant="outlined"
                      onClick={() => {
                        setSuggestionIndex((p) => p + 1);
                      }}
                    >
                      No
                    </Button>
                    <Button
                      color="success"
                      variant="contained"
                      onClick={() => {
                        setSuggestionIndex((p) => p + 1);
                        setCorrectedText(
                          `${text1}${suggestion.proposed}${text2}`,
                        );
                        setIndexDiff(
                          (p) =>
                            p +
                            suggestion.proposed.length -
                            suggestion.current.length,
                        );
                      }}
                    >
                      Yes
                    </Button>
                  </Stack>
                </Paper>
              )}
            </Popper>

            {suggestionIndex >= suggestions.length ? (
              <p>Plus de suggestions</p>
            ) : (
              <p>
                Suggestion: {suggestionIndex + 1}/{suggestions.length}
              </p>
            )}
            <button
              onClick={() => {
                setCorrectedText(original);
                setIndexDiff(0);
                setSuggestionIndex(0);
              }}
            >
              reset
            </button>
            <button
              onClick={() => {
                nextItem();
              }}
            >
              next
            </button>
          </Box>
        </Box>
      </ErrorBoundary>
    </React.Suspense>
  );
}
