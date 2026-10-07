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
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";

import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { useTheme } from "@mui/material/styles";
import Loader from "../pages/loader";
import { useTranslation } from "react-i18next";
import { Stack } from "@mui/material";

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
  const apiRef = React.useRef<ReactZoomPanPinchRef>(null);
  const [rotation, setRotation] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(false);
  const [resolutionState, setResolutionState] = React.useState<{
    source: string;
    showFullResolution: boolean;
    status: "none" | "loading" | "available";
  }>({ source: src, showFullResolution: false, status: "none" });
  const currentResolutionState =
    resolutionState.source === src
      ? resolutionState
      : { source: src, showFullResolution: false, status: "none" as const };
  const { showFullResolution, status: fullResolutionStatus } =
    currentResolutionState;
  const { t } = useTranslation();

  const theme = useTheme();

  return (
    <>
      <div {...other} style={{ ...other.style, position: "relative" }}>
        {zoomIn ? (
          <TransformWrapper centerOnInit>
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
                containerType: "size",
              }}
              contentStyle={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={src}
                alt=""
                {...imageProps}
                style={{
                  ...imageProps?.style,
                  ...(Math.abs(rotation) % 2 === 1
                    ? { maxWidth: "100cqh", maxHeight: "100cqw" }
                    : {}),
                  transform: `rotate(${rotation * 90}deg)`,
                  transformOrigin: "center",
                  transition: "transform 150ms ease",
                }}
              />
            </TransformComponent>
          </TransformWrapper>
        ) : (
          <img src={src} alt="" {...imageProps} />
        )}
        {zoomIn && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              position: "absolute",
              right: 5,
              bottom: 5,
            }}
          >
            <IconButton
              aria-label={t("image_viewer.rotate_left", "Rotate left")}
              onClick={() => setRotation((prev) => prev - 1)}
              sx={(theme) => ({
                color: "white",
                backgroundColor: alpha(theme.palette.secondary.main, 0.5),
              })}
            >
              <RotateLeftIcon />
            </IconButton>
            <IconButton
              aria-label={t("image_viewer.rotate_right", "Rotate right")}
              onClick={() => setRotation((prev) => prev + 1)}
              sx={(theme) => ({
                color: "white",
                backgroundColor: alpha(theme.palette.secondary.main, 0.5),
              })}
            >
              <RotateRightIcon />
            </IconButton>
          </Stack>
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
            left: 5,
          })}
        >
          <OpenInFullIcon />
        </IconButton>
      </div>
      <Dialog
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setResolutionState({
            source: src,
            showFullResolution: false,
            status: "none",
          });
        }}
        fullScreen
      >
        <Stack
          direction="row"
          sx={{
            justifyContent: "flex-end",
            p: 1,
          }}
        >
          <IconButton
            onClick={() => {
              setIsOpen(false);
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />
        <DialogContent
          sx={{
            p: { xs: 1, md: 2 },
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box>
            <TransformWrapper limitToBounds={false} ref={apiRef}>
              <TransformComponent>
                <img
                  src={showFullResolution && srcFull ? srcFull : src}
                  alt=""
                  style={{
                    maxHeight: "calc(100vh - 160px )",
                    maxWidth: "100%",
                    transform: `rotate(${rotation * 90}deg)`,
                    transformOrigin: "center",
                  }}
                />
              </TransformComponent>
            </TransformWrapper>
            {fullResolutionStatus === "loading" && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  zIndex: 10,
                }}
              >
                <Loader />
              </Box>
            )}
          </Box>
          {srcFull && (
            <Button
              disabled={fullResolutionStatus === "loading"}
              variant="outlined"
              onClick={() => {
                if (!showFullResolution && srcFull) {
                  setResolutionState({
                    source: src,
                    showFullResolution: false,
                    status: "loading",
                  });
                  const img = new Image();
                  img.src = srcFull;
                  img.onload = () => {
                    setResolutionState({
                      source: src,
                      showFullResolution: true,
                      status: "available",
                    });
                  };
                } else {
                  setResolutionState({
                    ...currentResolutionState,
                    showFullResolution: false,
                  });
                }
              }}
              sx={{
                position: "absolute",
                bottom: 16,
                right: 16,
                zIndex: 10,
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                },
              }}
            >
              {t(
                showFullResolution
                  ? "image_viewer.compressed"
                  : "image_viewer.load_original",
              )}
            </Button>
          )}
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
              void apiRef.current?.resetTransform();
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
