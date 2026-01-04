import * as React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

import axios from "axios";

import Row from "./Row";
import { useBuffer } from "./useBuffer";
import { useOptions } from "../../hooks/useOptions";
import { getLang } from "../../localeStorageManager";
import ZoomableImage from "../../components/ZoomableImage";
import { getImagesUrls } from "../questions/utils";
import offService from "../../off";
import { OFF_API_URL_V3 } from "../../const";
import { useTranslation } from "react-i18next";
import useUrlParams from "../../hooks/useUrlParams";
import Loader from "../loader";
import { useCountry } from "../../contexts/CountryProvider";
import { getCountryId } from "../../utils/getCountryId";
const formatData = (innerRows) => {
  const packagings = innerRows
    .map(({ material, number, recycling, shape }) => {
      const rep = {};

      if (number && !isNaN(Number.parseInt(number))) {
        rep["number_of_units"] = Number.parseInt(number);
      }
      if (shape) {
        rep[`shape`] = { id: shape };
      }
      if (material) {
        rep[`material`] = { id: material };
      }
      if (recycling) {
        rep[`recycling`] = { id: recycling };
      }

      if (Object.keys(rep).length > 0) {
        return rep;
      }
      return null;
    })
    .filter((x) => x !== null);

  if (packagings.length === 0) {
    return {};
  }
  return { product: { fields: "updated", packagings } };
};

const Page = () => {
  const [country] = useCountry();
  const countryId = React.useMemo(
    () => getCountryId(country) || "en:france",
    [country],
  );
  const { t } = useTranslation();
  const lang = getLang();
  const packagingMaterials = useOptions("packaging_materials", lang);
  const packagingShapes = useOptions("packaging_shapes", lang);
  const packagingRecycling = useOptions("packaging_recycling", lang);
  const [searchState] = useUrlParams(
    {
      creator: undefined,
      code: "",
    },
    {},
  );

  const [rows, setRows] = React.useState([]);
  const [innerRows, setInnerRows] = React.useState([]);

  const [data, next] = useBuffer({
    ...searchState,
    country: countryId,
  });

  const product = data?.[0] ?? null;
  React.useEffect(() => {
    if (product) {
      const newRows = product.packagings.map((item, index) => ({
        id: index,
        ...item,
      }));
      setRows(newRows);
      setInnerRows(newRows);
    }
  }, [product]);

  if (product === null) {
    return <p>Loading...</p>;
  }
  return (
    <React.Suspense fallback={<Loader />}>
      <Stack direction="row" spacing={1} sx={{ overflow: "auto" }}>
        {getImagesUrls(product.images, product.code).map((src) => (
          <ZoomableImage
            key={src}
            src={src}
            imageProps={{
              loading: "lazy",
              style: { maxWidth: 300, maxHeight: 300 },
            }}
          />
        ))}
      </Stack>

      <Box>
        <Stack
          spacing={1}
          alignItems={{
            xs: "flex-start",
            md: "flex-end",
          }}
          direction={{ xs: "column", md: "row" }}
        >
          <img src={product.image_packaging_url} alt="" />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 100 }}>Nb per unit</TableCell>

                  <TableCell>Shape</TableCell>

                  <TableCell>Material</TableCell>

                  <TableCell>Recycling</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <Row
                    key={row.id}
                    packagingMaterials={packagingMaterials}
                    packagingShapes={packagingShapes}
                    packagingRecycling={packagingRecycling}
                    updateRow={(toUpsert) => {
                      setInnerRows((prev) => {
                        return prev.map((r) => {
                          if (r.id !== row.id) {
                            return r;
                          }
                          return { ...r, ...toUpsert };
                        });
                      });
                    }}
                    {...row}
                  />
                ))}
              </TableBody>
            </Table>
            <Button
              onClick={() => {
                setRows((prev) => [
                  ...prev,
                  {
                    id: prev.length + 1,
                    material: null,
                    number: null,
                    recycling: null,
                    shape: null,
                  },
                ]);
                setInnerRows((prev) => [
                  ...prev,
                  {
                    id: prev.length + 1,
                    material: null,
                    number: null,
                    recycling: null,
                    shape: null,
                  },
                ]);
              }}
            >
              Add row
            </Button>
          </TableContainer>
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          sx={{ my: 2, justifyContent: "flex-end" }}
        >
          <Button
            sx={{ width: 150 }}
            onClick={() => next()}
            variant="contained"
          >
            Skip
          </Button>
          <Button
            sx={{ width: 150 }}
            onClick={() => {
              axios.patch(
                `${OFF_API_URL_V3}/product/${product.code}`,
                formatData(innerRows),
                { withCredentials: true },
              );
              next();
            }}
            variant="contained"
            color="success"
          >
            Validate
          </Button>
        </Stack>
      </Box>
      <Stack direction="row" spacing={2}>
        <Typography>{product?.product_name}</Typography>
        <Button
          size="small"
          component={Link}
          target="_blank"
          href={`${offService.getProductUrl(product.code)}#environment`}
          variant="outlined"
          startIcon={<VisibilityIcon />}
          sx={{ minWidth: 150 }}
        >
          {t("questions.view")}
        </Button>
        <Button
          size="small"
          component={Link}
          target="_blank"
          href={offService.getProductEditUrl(product.code)}
          variant="contained"
          startIcon={<EditIcon />}
          sx={{ ml: 2, minWidth: 150 }}
        >
          {t("questions.edit")}
        </Button>
      </Stack>
    </React.Suspense>
  );
};

export default Page;
