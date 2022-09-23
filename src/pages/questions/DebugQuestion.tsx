import * as React from "react";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinearProgress from "@mui/material/LinearProgress";

import robotoff from "../../robotoff";
import off from "../../off";

import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";

const fetchData = async (insightId) => {
  const responce = await robotoff.insightDetail(insightId);
  console.log(responce);
  return responce;
};

const getCroppedLogoUrl = (debugData) => {
  if (!debugData?.source_image || !debugData?.data?.bounding_box) {
    return null;
  }

  const sourceImage = off.getImageUrl(debugData?.source_image);
  return robotoff.getCroppedImageUrl(
    sourceImage,
    debugData?.data?.bounding_box
  );
};
const DebugQuestion = (props) => {
  const { insightId } = props;
  const [isLoading, setIsLoading] = React.useState(true);
  const [debugData, setDebugData] = React.useState<any>({});
  const [mageUrl, setImageUrl] = React.useState<any>(null);

  React.useEffect(() => {
    setIsLoading(true);
    let isValid = true;
    fetchData(insightId)
      .then(({ data }) => {
        if (!isValid) {
          return;
        }
        setIsLoading(false);
        setDebugData(data);
      })
      .catch((e) => {
        if (!isValid) {
          return;
        }
        setIsLoading(false);
        setDebugData(e);
      });
    return () => {
      isValid = false;
    };
  }, [insightId]);

  const croppedUrl = getCroppedLogoUrl(debugData);
  return (
    <>
      <Divider sx={{ mt: 2 }} />
      <Box sx={{ px: 2, my: 2 }}>
        <Accordion variant="outlined">
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>resume</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {isLoading ? (
              <LinearProgress />
            ) : (
              <div>
                <Table size="small">
                  <TableBody
                    sx={{
                      " td, th": { border: "none" },
                      th: { verticalAlign: "top", pr: 0 },
                    }}
                  >
                    <TableRow>
                      <TableCell component="th" scope="row">
                        insight id
                      </TableCell>
                      <TableCell>{debugData?.id}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell component="th" scope="row">
                        generator model
                      </TableCell>
                      <TableCell>{debugData?.predictor}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell component="th" scope="row">
                        timestamp
                      </TableCell>
                      <TableCell>
                        {new Date(debugData?.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                {croppedUrl && (
                  <img alt="lroUsed for prediction" src={croppedUrl} />
                )}
              </div>
            )}
          </AccordionDetails>
        </Accordion>
        <Accordion variant="outlined">
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>raw JSON</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {isLoading ? (
              <LinearProgress />
            ) : (
              <Typography variant="caption" component="pre">
                {JSON.stringify(debugData, null, 2)}
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </>
  );
};

export default DebugQuestion;
