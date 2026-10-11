import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import ZoomableImage from "../../components/ZoomableImage";
import offService from "../../off";
import { getImagesUrls } from "../questions/utils";
import type { ProductDescription } from "./types";

type ProductImagePanelProps = {
  product: ProductDescription;
  ocrText: string;
  isLoadingOcr: boolean;
  onKeywordClick?: (keyword: string) => void;
};

export default function ProductImagePanel({
  product,
  ocrText,
  isLoadingOcr,
  onKeywordClick,
}: ProductImagePanelProps) {
  const images = React.useMemo(() => {
    const list: Array<{ url: string; urlFull: string; label: string }> = [];

    // If dedicated packaging image is available, put it first!
    if (product.image_packaging_url) {
      list.push({
        url: product.image_packaging_url,
        urlFull: product.image_packaging_url,
        label: "Packaging Photo",
      });
    }

    // Add other product images
    if (product.images) {
      const urls = getImagesUrls(product.images, product.code);
      urls.forEach((u, i) => {
        // avoid duplicate if same url
        if (
          !list.some(
            (item) =>
              item.url === u.imageUrl || item.urlFull === u.imageUrlFull,
          )
        ) {
          list.push({
            url: u.imageUrl,
            urlFull: u.imageUrlFull,
            label: `Image ${i + 1}`,
          });
        }
      });
    }

    return list;
  }, [product]);

  const [activeTab, setActiveTab] = React.useState(0);

  // If active tab is out of range, reset
  React.useEffect(() => {
    if (activeTab >= images.length) {
      setActiveTab(0);
    }
  }, [images.length, activeTab]);

  const currentImage = images[activeTab] ?? null;

  return (
    <Box
      sx={{
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Product metadata header */}
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack spacing={0.5}>
          <Typography
            variant="h6"
            fontWeight={700}
            noWrap
            title={product.product_name || "Unknown Product"}
          >
            {product.product_name || "Untitled Product"}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography variant="body2" color="text.secondary">
              Barcode: <strong>{product.code}</strong>
            </Typography>
            {product.quantity && (
              <Chip
                size="small"
                label={`Quantity: ${product.quantity}`}
                color="secondary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            )}
            {product.unique_scans_n !== undefined &&
              product.unique_scans_n > 0 && (
                <Chip
                  size="small"
                  label={`Scans: ${product.unique_scans_n}`}
                  variant="outlined"
                />
              )}
          </Stack>
        </Stack>
      </Box>

      {/* Image tabs if multiple */}
      {images.length > 1 && (
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "action.hover",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_e, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            size="small"
            sx={{ minHeight: 40 }}
          >
            {images.map((img, idx) => (
              <Tab
                key={img.url}
                label={img.label}
                sx={{
                  minHeight: 40,
                  py: 0.5,
                  fontSize: "0.8rem",
                  textTransform: "none",
                }}
              />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Main Zoomable Image Viewer */}
      <Box
        sx={{
          flex: 1,
          minHeight: 340,
          maxHeight: 520,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.100",
          p: 1.5,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {currentImage ? (
          <ZoomableImage
            key={currentImage.urlFull}
            src={currentImage.url}
            srcFull={currentImage.urlFull}
            imageProps={{
              loading: "eager",
              style: {
                maxHeight: 480,
                maxWidth: "100%",
                objectFit: "contain",
                borderRadius: 8,
              },
            }}
          />
        ) : (
          <Typography color="text.secondary">
            No product image available
          </Typography>
        )}
      </Box>

      {/* OCR Text Inspector Accordion */}
      <Accordion
        defaultExpanded={false}
        disableGutters
        sx={{ "&:before": { display: "none" } }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            minHeight: 44,
            bgcolor: "action.hover",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ width: "100%", pr: 1 }}
          >
            <FindInPageIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" fontWeight={700}>
              Google Cloud OCR Inspection
            </Typography>
            {isLoadingOcr ? (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            ) : ocrText ? (
              <Chip
                size="small"
                label="Text Extracted"
                color="success"
                sx={{ height: 20, fontSize: "0.7rem" }}
              />
            ) : (
              <Chip
                size="small"
                label="No OCR text"
                variant="outlined"
                sx={{ height: 20, fontSize: "0.7rem" }}
              />
            )}
          </Stack>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            maxHeight: 200,
            overflowY: "auto",
            p: 1.5,
            bgcolor: "background.default",
          }}
        >
          {isLoadingOcr ? (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="center"
              sx={{ py: 2 }}
            >
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Analyzing image texts...
              </Typography>
            </Stack>
          ) : ocrText ? (
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                Words found on packaging images. Click any word to use it:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {ocrText
                  .split(/\s+/)
                  .filter((w) => w.length > 2)
                  .slice(0, 80)
                  .map((word, i) => (
                    <Tooltip key={`${word}-${i}`} title="Click to use word">
                      <Chip
                        size="small"
                        label={word}
                        onClick={() => onKeywordClick?.(word)}
                        sx={{
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          "&:hover": {
                            bgcolor: "primary.light",
                            color: "primary.contrastText",
                          },
                        }}
                      />
                    </Tooltip>
                  ))}
              </Box>
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  p: 1,
                  bgcolor: "grey.200",
                  borderRadius: 1,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: 100,
                  overflowY: "auto",
                }}
              >
                {ocrText}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No OCR text returned for this product.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* External OFF Links */}
      <Box
        sx={{
          p: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack direction="row" spacing={1} justifyContent="space-between">
          <Button
            size="small"
            component={Link}
            target="_blank"
            href={`${offService.getProductUrl(product.code)}#environment`}
            variant="outlined"
            startIcon={<VisibilityIcon />}
            sx={{ textTransform: "none", fontSize: "0.8rem" }}
          >
            View on OFF
          </Button>
          <Button
            size="small"
            component={Link}
            target="_blank"
            href={offService.getProductEditUrl(product.code)}
            variant="outlined"
            startIcon={<EditIcon />}
            sx={{ textTransform: "none", fontSize: "0.8rem" }}
          >
            Edit in OFF
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
