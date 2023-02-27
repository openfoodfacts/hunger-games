import * as React from "react";

import QuestionFilter from "../../components/QuestionFilter";

import QuestionDisplay from "./QuestionDisplay";
import ProductInformation from "./ProductInformation";
import UserData from "./UserData";
import { useProductData } from "./utils";

import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";

import store, {
  fetchQuestions,
  nbOfQuestionsInBufferSelector,
  currentQuestionSelector,
  nextImagesSelector,
} from "./store";
import { Provider, useDispatch, useSelector } from "react-redux";

function QuestionsConsumer() {
  const dispatch = useDispatch();

  const remainingQuestionNb = useSelector(nbOfQuestionsInBufferSelector);
  const nextImages = useSelector(nextImagesSelector);

  React.useEffect(() => {
    if (remainingQuestionNb < 5) {
      dispatch(fetchQuestions());
    }
  }, [dispatch, remainingQuestionNb]);

  const question = useSelector(currentQuestionSelector);

  const productData = useProductData(question?.barcode);

  return (
    <Grid container spacing={2} p={2}>
      <Grid item xs={12} md={5}>
        <Stack
          direction="column"
          sx={{
            height: { xs: "calc(100vh - 76px)", md: "calc(100vh - 110px)" },
          }}
        >
          <QuestionFilter />
          <Divider sx={{ margin: "1rem" }} />
          <QuestionDisplay question={question} productData={productData} />
        </Stack>
      </Grid>
      <Grid item xs={12} md={5}>
        <ProductInformation question={question} productData={productData} />
      </Grid>
      <Grid item xs={12} md={2}>
        <UserData />
      </Grid>

      {/* pre-fetch images of the next question */}
      {nextImages.map((source_image_url) => (
        <link rel="prefetch" key={source_image_url} href={source_image_url} />
      ))}
    </Grid>
  );
}

export default function Questions() {
  return (
    <Provider store={store}>
      <QuestionsConsumer />
    </Provider>
  );
}
