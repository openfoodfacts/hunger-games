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
import { useQuery } from "@tanstack/react-query";

const fetchData = (insightId?: string) => async () => {
  if (!insightId) {
    return null;
  }
  const response = await robotoff.insightDetail(insightId);

  if (!response || typeof response !== "object" || !("data" in response)) {
    return null;
  }

  const data = response.data as Record<string, unknown>;
  let bounding_box = data?.bounding_box as
    | [number, number, number, number]
    | undefined;
  const source_image =
    typeof data?.source_image === "string" ? data.source_image : undefined;
  const logo_id =
    typeof (data?.data && (data.data as Record<string, unknown>).logo_id) ===
    "string"
      ? (data.data as Record<string, unknown>).logo_id
      : undefined;

  if (source_image && logo_id && !bounding_box) {
    const logoData = await robotoff.getLogosImages([logo_id]);
    const logosArr =
      logoData?.data &&
      Array.isArray(
        (
          logoData.data as {
            logos: Array<{ bounding_box?: [number, number, number, number] }>;
          }
        ).logos,
      )
        ? (
            logoData.data as {
              logos: Array<{ bounding_box?: [number, number, number, number] }>;
            }
          ).logos
        : [];
    bounding_box = logosArr[0]?.bounding_box;
  }

  return { source_image, bounding_box, data };
};

const getCroppedLogoUrl = (
  debugResponse?: null | {
    source_image?: string;
    bounding_box?: [number, number, number, number];
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

interface DebugQuestionProps {
  insightId: string;
}

const DebugQuestion = (props: DebugQuestionProps) => {
  const { insightId } = props;

  const { data, status } = useQuery({
    queryKey: ["insight-details", insightId],
    queryFn: fetchData(insightId),
  });

  const [resumeIsOpen, setResumeIsOpen] = React.useState(false);
  const [jsonDetailIsOpen, setJsonDetailIsOpen] = React.useState(false);

  const croppedUrl = getCroppedLogoUrl(data);
  return (
    <>
      <Divider sx={{ mt: 2 }} />
      <Box sx={{ px: 2, my: 2 }}>
        <Accordion
          variant="outlined"
          onChange={(_, isOpen) => setResumeIsOpen(isOpen)}
          expanded={resumeIsOpen}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>resume</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {status === "pending" && <LinearProgress />}
            {status === "error" && <Typography>An error occurred</Typography>}
            {status === "success" && (
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
                      <TableCell>{data?.data?.id}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell component="th" scope="row">
                        generator model
                      </TableCell>
                      <TableCell>{data?.data?.predictor}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell component="th" scope="row">
                        timestamp
                      </TableCell>
                      <TableCell>
                        {new Date(data?.data?.timestamp).toLocaleString()}
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
          onChange={(_, isOpen) => setJsonDetailIsOpen(isOpen)}
          expanded={jsonDetailIsOpen}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>raw JSON</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {status === "pending" && <LinearProgress />}
            {status === "error" && <Typography>An error occurred</Typography>}
            {status === "success" && (
              <Typography variant="caption" component="pre">
                {JSON.stringify(data?.data ?? data, null, 2)}
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </>
  );
};

export default DebugQuestion;
