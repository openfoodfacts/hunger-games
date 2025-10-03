import * as React from "react";
import { useTextCorrection } from "./useTextCorrection";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { DiffPrint } from "./DiffPrint";
import { IngeredientDisplay, useIngredientParsing } from "./IngeredientDisplay";

interface TextCorrectionProps {
  original: string;
  correction: string;
  barcode?: string;
  nextItem: () => void;
}

export function TextCorrection(props: TextCorrectionProps) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [editedText, setEditedText] = React.useState(null);

  const {
    text,
    suggestion,
    suggestionChoices,
    nbSuggestions,
    suggestionIndex,
    actions,
  } = useTextCorrection(props.original, props.correction);
  const { isLoading, fetchIngredients, parsings } = useIngredientParsing();

  const hasSuggestion = suggestion != null;
  React.useEffect(() => {
    if (hasSuggestion) {
      // Make sure that each time we are using suggestion the only source of truth is the textCorrection hook.
      setEditedText(null);
    } else {
      fetchIngredients(text.before, "fr");
    }
  }, [hasSuggestion]);

  return (
    <Box>
      {suggestion ? (
        <Typography>
          {text.before}
          <span
            id="word-to-modify"
            ref={(item) => {
              setAnchorEl(item);
            }}
            style={{ fontWeight: "bold" }}
          >
            {text.section}
          </span>
          {text.after}
        </Typography>
      ) : (
        <>
          <IngeredientDisplay
            text={editedText ? editedText : text.before}
            onChange={(event) => {
              console.log(event.target.value);
              setEditedText(event.target.value);
            }}
            parsings={parsings}
          />
          <button
            onClick={() =>
              fetchIngredients(editedText ? editedText : text.before, "fr")
            }
          >
            fetch{isLoading ? " ..." : ""}
          </button>
        </>
      )}

      <Popper
        open={!!suggestion && !!anchorEl}
        anchorEl={anchorEl}
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
            <DiffPrint
              text={suggestion.current}
              mask={suggestion.currentMask}
              mapping={{
                D: { backgroundColor: "red" },
                M: { backgroundColor: "orange" },
              }}
            />
            <DiffPrint
              text={suggestion.proposed}
              mask={suggestion.proposedMask}
              mapping={{
                D: { backgroundColor: "green" },
                M: { backgroundColor: "orange" },
              }}
            />

            <Stack direction="row" sx={{ mt: 2 }}>
              <Button
                color="error"
                variant="outlined"
                onClick={actions.ignoreSuggestion}
              >
                No
              </Button>
              <Button
                color="success"
                variant="contained"
                onClick={actions.acceptSuggestion}
              >
                Yes
              </Button>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.1}
              sx={{ mt: 2 }}
            >
              <Button
                size="small"
                onClick={actions.revertLastSuggestion}
                disabled={suggestionIndex === 0}
              >
                prev
              </Button>
              {Array.from({ length: nbSuggestions }, (_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    border: `solid ${
                      suggestionIndex === i ? "blue 2px" : "black 1px"
                    }`,
                    backgroundColor:
                      suggestionChoices[i] === false
                        ? "red"
                        : suggestionChoices[i] === true
                          ? "green"
                          : "none",
                  }}
                />
              ))}
              <Button
                size="small"
                onClick={actions.ignoreAllRemainingSuggestions}
                disabled={suggestionIndex === nbSuggestions}
              >
                skip all
              </Button>
            </Stack>
          </Paper>
        )}
      </Popper>

      <button onClick={actions.resetSuggestions}>reset</button>
      <button
        onClick={() => {
          actions.resetSuggestions();
          props.nextItem();
        }}
      >
        next
      </button>
    </Box>
  );
}
