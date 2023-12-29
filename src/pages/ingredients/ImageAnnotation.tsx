import * as React from "react";
import Button from "@mui/material/Button";
import useRobotoffPrediction, { DataType } from "./useRobotoffPrediction";
import { Box, Stack, TextField } from "@mui/material";
import off from "../../off";

type ImageAnnotationProps = {
  fetchDataUrl: string;
  code: string;
};

type AnnotationProps = {
  code: string;
  data: null | DataType;
  error: null | string;
  isLoading: boolean;
};

const splitText = (d: DataType) => {
  const rep: { isIngredient: boolean; text: string }[] = [];
  let index = 0;
  Object.values(d.detections)
    .map(({ start, end }) => ({ start, end }))
    .sort((a, b) => a.start - b.start)
    .forEach(({ start, end }) => {
      if (start > index) {
        rep.push({ isIngredient: false, text: d.fullText.slice(index, start) });
      }
      rep.push({ isIngredient: true, text: d.fullText.slice(start, end) });
      index = end;
    });
  if (index < d.fullText.length) {
    rep.push({
      isIngredient: false,
      text: d.fullText.slice(index, d.fullText.length),
    });
  }
  return rep;
};
function Annotation({ code, data, isLoading, error }: AnnotationProps) {
  const [showOCR, setShowOCR] = React.useState(false);
  const [editedState, setEditedState] = React.useState<
    null | DataType["detections"]
  >(null);

  React.useEffect(() => {
    setEditedState(data && data.detections);
  }, [data]);

  if (editedState === null) {
    return null;
  }
  if (isLoading) {
    return <p>loading ...</p>;
  }
  if (error !== null) {
    return (
      <>
        <p>An error occured X{"("}</p>
        <p>{error}</p>
      </>
    );
  }
  if (Object.keys(editedState).length === 0) {
    return <p>No ingredients found</p>;
  }

  return (
    <React.Fragment>
      {Object.entries(editedState).map(
        ([lang, { start, end, score, text }], index) => (
          <Stack direction="column" key={index}>
            <Stack direction="row">
              <TextField
                multiline
                fullWidth
                label={`${lang} (${(score * 100).toFixed(1)}%)`}
                minRows={3}
                onChange={(event) => {
                  setEditedState((prev) => ({
                    ...prev,
                    [lang]: {
                      ...prev[lang],
                      text: event.target.value,
                    },
                  }));
                }}
                value={text}
                sx={{ mt: 2 }}
              />
            </Stack>
            <Stack direction="row">
              <Button
                onClick={() => {
                  setEditedState((prev) => ({
                    ...prev,
                    [lang]: {
                      ...prev[lang],
                      text: data.detections[lang].text,
                    },
                  }));
                }}
                disabled={editedState[lang].text === data.detections[lang].text}
                variant="contained"
                fullWidth
              >
                Revert
              </Button>
              <Button
                onClick={() => {
                  off.setIngedrient({ code, lang, text });
                }}
                variant="contained"
                color="success"
                fullWidth
              >
                Send
              </Button>
            </Stack>
          </Stack>
        ),
      )}
      {showOCR && (
        <p>
          {splitText(data).map(({ isIngredient, text }) =>
            isIngredient ? (
              <b>
                <br />
                {text}
              </b>
            ) : (
              text
            ),
          )}
        </p>
      )}

      <Button
        sx={{ my: 5 }}
        variant="outlined"
        onClick={() => {
          setShowOCR((p) => !p);
        }}
      >
        {showOCR ? "Hidde OCR" : "Show OCR"}
      </Button>
    </React.Fragment>
  );
}

export default function ImageAnnotation({
  fetchDataUrl,
  code,
}: ImageAnnotationProps) {
  const [data, getData, isLoading, error] = useRobotoffPrediction(fetchDataUrl);

  return (
    <Box sx={{ px: 1, width: "50%" }}>
      <Annotation data={data} isLoading={isLoading} error={error} code={code} />
      <Button
        fullWidth
        disabled={isLoading || error !== null || data !== null}
        onClick={getData}
        variant="outlined"
      >
        Get prediction
      </Button>
    </Box>
  );
}
