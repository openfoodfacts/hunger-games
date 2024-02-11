import * as React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import useRobotoffPrediction, { DataType } from "./useRobotoffPrediction";
import { IngredientAnotation } from "./IngeredientDisplay";

type ImageAnnotationProps = {
  fetchDataUrl: string;
  code: string;
  imageLang: string;
  offText: string;
};

type AnnotationProps = {
  code: string;
  data: null | DataType;
  error: null | string;
  isLoading: boolean;
  imageLang: string;
  offText: string;
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
function Annotation({
  code,
  data,
  error,
  imageLang,
  offText,
}: AnnotationProps) {
  const [showOCR, setShowOCR] = React.useState(false);
  const [editedState, setEditedState] = React.useState<
    null | DataType["detections"]
  >(null);
  const [offEditedState, setOffEditedState] = React.useState<
    DataType["detections"]
  >({ [imageLang]: { text: offText, start: 0, end: 0, score: 0 } });

  React.useEffect(() => {
    setEditedState(data && data.detections);
  }, [data]);

  const noIngredientFound =
    editedState !== null && Object.keys(editedState).length === 0;

  return (
    <React.Fragment>
      <IngredientAnotation
        lang={imageLang}
        score={'user'}
        code={code}
        setEditedState={setOffEditedState}
        text={offEditedState[imageLang].text}
        detectedText={offText}
      />
      {error !== null && <p>An arror occured</p>}
      {noIngredientFound && <p>No ingredients found</p>}
      {editedState === null
        ? null
        : Object.entries(editedState).map(
            ([lang, { start, end, score, text }]) => (
              <IngredientAnotation
                key={`${start}-${end}`}
                lang={lang}
                score={score}
                code={code}
                setEditedState={setEditedState}
                text={text}
                detectedText={data.detections[lang].text}
              />
            ),
          )}
      {showOCR && (
        <p>
          {splitText(data).map(({ isIngredient, text }, i) => (
            <React.Fragment key={`${text}-${i}`}>
              {isIngredient ? (
                <b>
                  <br />
                  {text}
                </b>
              ) : (
                text
              )}
            </React.Fragment>
          ))}
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
  imageLang,
  offText,
}: ImageAnnotationProps) {
  const [data, getData, isLoading, error] = useRobotoffPrediction(fetchDataUrl);

  return (
    <Box sx={{ px: 1, width: "50%" }}>
      <Annotation
        data={data}
        isLoading={isLoading}
        error={error}
        code={code}
        imageLang={imageLang}
        offText={offText}
      />
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
