import * as React from "react";
import Button from "@mui/material/Button";
import useRobotoffPrediction, { DataType } from "./useRobotoffPrediction";
import { Box, Stack, TextField } from "@mui/material";

type ImageAnnotationProps = {
  fetchDataUrl: string;
};

type AnnotationProps = {
  data: null | DataType;
  error: null | string;
  isLoading: boolean;
};

function Annotation({ data, isLoading, error }: AnnotationProps) {
  const [editedState, setEditedState] = React.useState<null | DataType>(null);

  React.useEffect(() => {
    setEditedState(data);
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
      {Object.entries(editedState).map(([lang, text], index) => (
        <Stack direction="column" key={index}>
          <TextField
            multiline
            label={lang}
            minRows={3}
            onChange={(event) => {
              setEditedState((prev) => ({
                ...prev,
                [lang]: event.target.value,
              }));
            }}
            value={text}
            sx={{ mt: 2 }}
          />
          <Stack direction="row">
            <Button
              onClick={() => {
                setEditedState((prev) => ({
                  ...prev,
                  [lang]: data[lang],
                }));
              }}
              disabled={editedState[lang] === data[lang]}
              variant="contained"
              fullWidth
            >
              Revert
            </Button>
            <Button
              onClick={() => {
                console.log(
                  `send to server lang: ${lang} and ingredients: ${text}`
                );
              }}
              variant="contained"
              color="success"
              fullWidth
            >
              Send
            </Button>
          </Stack>
        </Stack>
      ))}
    </React.Fragment>
  );
}

export default function ImageAnnotation({
  fetchDataUrl,
}: ImageAnnotationProps) {
  const [data, getData, isLoading, error] = useRobotoffPrediction(fetchDataUrl);

  return (
    <Box sx={{ px: 1, width: "50%" }}>
      <Annotation data={data} isLoading={isLoading} error={error} />
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
