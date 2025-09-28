import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { alpha } from "@mui/material/styles";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

type ZoomableImageProps = {
  src: string;
  srcFull?: string;
  zoomIn?: boolean;
  imageProps?: React.ImgHTMLAttributes<HTMLImageElement>;
} & React.HTMLAttributes<HTMLDivElement>;

const ZoomableImage = ({
  src,
  srcFull,
  zoomIn,
  imageProps,
  ...other
}: ZoomableImageProps) => {
  const apiRef = React.useRef(null);
  const [rotation, setRotation] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <>
      <div {...other} style={{ ...other.style, position: "relative" }}>
        {zoomIn ? (
          <TransformWrapper>
            <TransformComponent>
              <img src={src} alt="" {...imageProps} />
            </TransformComponent>
          </TransformWrapper>
        ) : (
          <img src={src} alt="" {...imageProps} />
        )}
        <IconButton
          onClick={() => {
            setIsOpen(true);
          }}
          sx={(theme) => ({
            position: "absolute",
            color: "white",
            backgroundColor: alpha(theme.palette.secondary.main, 0.5),
            bottom: 5,
            right: 5,
          })}
        >
          <OpenInFullIcon />
        </IconButton>
      </div>
      <Dialog
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        maxWidth="xl"
        fullScreen={fullScreen}
      >
        <Box
          sx={{
            p: 1,
            display: "flex",
            flexDirection: "row-reverse",
          }}
        >
          <IconButton onClick={() => setIsOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <DialogContent
          sx={{
            p: { xs: 1, md: 2 },
          }}
        >
          <TransformWrapper limitToBounds={false} ref={apiRef}>
            <TransformComponent>
              <img
                src={srcFull ?? src}
                alt=""
                style={{
                  maxHeight: "calc(100vh - 160px )",
                  maxWidth: "min(100%, 1400px)",
                  transform: `rotate(${rotation * 90}deg)`,
                  transformOrigin: "center",
                }}
              />
            </TransformComponent>
          </TransformWrapper>
        </DialogContent>
        <DialogActions>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setRotation((prev) => prev - 1);
            }}
            startIcon={<RotateLeftIcon />}
          >
            left
          </Button>
          <Button
            fullWidth
            onClick={() => {
              setRotation(0);
              apiRef.current?.resetTransform();
            }}
          >
            Reset
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setRotation((prev) => prev + 1);
            }}
            endIcon={<RotateRightIcon />}
          >
            right
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ZoomableImage;
