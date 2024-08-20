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
  const response = await robotoff.insightDetail(insightId);

  if (!response) {
    return null;
  }

  let bounding_box = response.data?.bounding_box;
  const source_image = response.data?.source_image;
  const logo_id = response.data?.data?.logo_id;

  if (source_image && logo_id && !bounding_box) {
    const logoData = await robotoff.getLogosImages([logo_id]);
    bounding_box = logoData?.data?.logos?.[0]?.bounding_box;
  }

  return { source_image, bounding_box, data: response.data };
};

const getCroppedLogoUrl = (
  debugResponse: null | {
    source_image?: string;
    bounding_box?: number[];
  },
) => {
  if (!debugResponse) {
    return null;
  }
  const { bounding_box, source_image } = debugResponse;

  if (!source_image || !bounding_box) {
    return null;
  }

  const sourceImage = off.getImageUrl(source_image);
  return robotoff.getCroppedImageUrl(sourceImage, bounding_box);
};

const DebugQuestion = (props) => {
  const { insightId } = props;
  const [isLoading, setIsLoading] = React.useState(true);
  const [debugResponse, setDebugResponse] = React.useState<null | {
    source_image?: string;
    bounding_box?: number[];
    data?: any;
  }>({});
  const [openDetails, setOpenDetails] = React.useState<any>({
    resume: false,
    json_details: false,
  });

  const handleChange = (panelId) => (event, newState) => {
    setOpenDetails((prev) => ({ ...prev, [panelId]: newState }));
  };

  React.useEffect(() => {
    setIsLoading(true);
    let isValid = true;
    fetchData(insightId)
      .then((response) => {
        if (!isValid) {
          return;
        }
        setIsLoading(false);
        setDebugResponse(response);
      })
      .catch((e) => {
        if (!isValid) {
          return;
        }
        setIsLoading(false);
        setDebugResponse(e);
      });
    return () => {
      isValid = false;
    };
  }, [insightId]);

  const croppedUrl = getCroppedLogoUrl(debugResponse);
  return (
    <>
      <Divider sx={{ mt: 2 }} />
      <Box sx={{ px: 2, my: 2 }}>
        <Accordion
          variant="outlined"
          onChange={handleChange("resume")}
          expanded={openDetails["resume"]}
        >
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
                      <TableCell>{debugResponse?.data?.id}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell component="th" scope="row">
                        generator model
                      </TableCell>
                      <TableCell>{debugResponse?.data?.predictor}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell component="th" scope="row">
                        timestamp
                      </TableCell>
                      <TableCell>
                        {new Date(
                          debugResponse?.data?.timestamp,
                        ).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                {croppedUrl && (
                  <img
                    alt="lroUsed for prediction"
                    src={croppedUrl}
                    style={{ maxHeight: "150px" }}
                  />
                )}
              </div>
            )}
          </AccordionDetails>
        </Accordion>
        <Accordion
          variant="outlined"
          onChange={handleChange("json_details")}
          expanded={openDetails["json_details"]}
        >
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
                {JSON.stringify(debugResponse?.data ?? debugResponse, null, 2)}
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </>
  );
};

export default DebugQuestion;
