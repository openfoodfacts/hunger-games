import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Button, Modal } from "@mui/material";
import QuestionCard from "../../components/QuestionCard";
import { localFavorites } from "../../localeStorageManager";
import HomeCards from "./homeCards";
import { useTheme } from "@mui/material/styles";

const Home = () => {
  const theme = useTheme();
  const [savedQuestions] = React.useState(() => {
    return localFavorites.fetch().questions ?? [];
  });
  const size = Object.keys(savedQuestions).length;
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <>
      <Box sx={{ p: 2, alignItems: "center" }}>
        <Typography
          variant="h5"
          sx={{ margin: "20px auto", textAlign: "center" }}
        >
          What game would you like to play?
        </Typography>
        <HomeCards />
        {size > 0 && (
          <Typography
            variant="h5"
            sx={{ margin: "40px auto", textAlign: "center" }}
          >
            Saved Filters
          </Typography>
        )}
        <Stack spacing={4} flexWrap="wrap" direction="row">
          {savedQuestions.map((props) => (
            <Box sx={{ marginBottom: 5 }} key={props.title}>
              <QuestionCard showFilterResume editableTitle {...props} />
            </Box>
          ))}
        </Stack>
      </Box>
      <Box
        padding={{ xs: "20px", sm: "50px" }}
        sx={{
          backgroundColor: theme.palette.secondary.main,
        }}
      >
        <Stack
          spacing={4}
          flexWrap="wrap"
          direction={{ xs: "column", sm: "column", md: "row" }}
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              lineHeight: "1.75",
            }}
          >
            Want to make your contribution count? Create an account or sign in
            on Open Food Facts!
          </Typography>
          <Stack direction="row">
            <Button
              variant="contained"
              href="https://world.openfoodfacts.org/cgi/login.pl"
              sx={{
                backgroundColor: "white",
                color: "black",
                margin: "0 20px",
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              href="https://world.openfoodfacts.org/cgi/user.pl"
              sx={{
                backgroundColor: "white",
                color: "black",
              }}
            >
              Sign up
            </Button>
          </Stack>
        </Stack>
      </Box>
      <Box textAlign="center">
        <Button
          onClick={handleOpen}
          sx={{
            margin: "20px auto",
          }}
        >
          Learn why your contribution matters
        </Button>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-contribution-title"
        aria-describedby="modal-contribution-information"
      >
        <Box
          width={{ xs: "90%", sm: "50%" }}
          sx={{
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
          }}
        >
          <Typography
            id="modal-contribution-title"
            variant="h6"
            component="h2"
            fontWeight={700}
          >
            Your contribution matters
          </Typography>
          <Typography
            class="modal-contribution-information"
            sx={{ mt: 2 }}
            component="p"
          >
            Hunger Games is an effort to leverage the results of our OCR. When
            you use Hunger Games by Open Food Facts, you improve our entire
            database which helps the community make better food choices. We
            gathers your annotations and use them to make Open Food Facts more
            accurate and effecient.
          </Typography>
          <Typography
            class="modal-contribution-information"
            sx={{ mt: 2 }}
            component="p"
          >
            Thank you for helping us improve Open Food Facts so that more people
            can use it easily.
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default Home;
