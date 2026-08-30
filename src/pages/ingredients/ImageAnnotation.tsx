import * as React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import useRobotoffPrediction, { DataType } from "./useRobotoffPrediction";
import { IngredientAnotation } from "./IngeredientDisplay";
import { useTranslation } from "react-i18next";

type ImageAnnotationProps = {
  fetchDataUrl: string;
  code: string;
  imageLang: string;
  offText: string;
};

type AnnotationProps = {
  code: string;
  data: DataType;
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
function Annotation({ code, data, imageLang, offText }: AnnotationProps) {
  const [showOCR, setShowOCR] = React.useState(false);
  const [editedState, setEditedState] = React.useState(data.detections);
  const [offEditedState, setOffEditedState] = React.useState<
    DataType["detections"]
  >({ [imageLang]: { text: offText, start: 0, end: 0, score: 0 } });

  const noIngredientFound = Object.keys(editedState).length === 0;
  const offEditedText = offEditedState[imageLang]?.text ?? "";

  return (
    <React.Fragment>
      <IngredientAnotation
        lang={imageLang}
        score={null}
        code={code}
        setEditedState={setOffEditedState}
        text={offEditedText}
        detectedText={offText}
      />
      {noIngredientFound && <p>No ingredients found</p>}
      {Object.entries(editedState).map(
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
        <p style={{ marginTop: 5 * 4 }}>
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
        variant="outlined"
        onClick={() => {
          setShowOCR((p) => !p);
        }}
      >
        {showOCR ? "Hide OCR" : "Show OCR"}
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
  const { t } = useTranslation();

  return (
    <Box sx={{ px: 1, width: "50%" }}>
      {error !== null && <p>An error occurred: {error}</p>}
      {data !== null && (
        <Annotation
          key={fetchDataUrl}
          data={data}
          code={code}
          imageLang={imageLang}
          offText={offText}
        />
      )}
      <Button
        fullWidth
        sx={{ mt: 5 }}
        disabled={isLoading || error !== null || data !== null}
        onClick={() => void getData()}
        variant="outlined"
      >
        {t("ingredients.getRobotoffPrediciton")}
      </Button>
    </Box>
  );
}
