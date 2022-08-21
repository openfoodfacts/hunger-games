import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Box } from "@mui/material";
// import AdditionalNutriments from "./additionalNutritions";
import { useTranslation } from "react-i18next";

import TableRowComp from "./tableRow";

export default function NutritionTable({
  nutriments,
  setNutriments,
  additionalNutriments,
  deleteItem,
  onchangeHandler,
}) {
  const { t } = useTranslation();

  const rows = nutriments.map((nutriment) => (
    <TableRowComp
      nutriment={nutriment}
      onchangeHandler={onchangeHandler}
      deleteItem={deleteItem}
      key={nutriment.off_nutriment_id}
    />
  ));
  // const options = additionalNutriments.map((item) => ({
  //   label: t(`nutrition.nutriments.${item.label}`),
  //   id: item.label,
  // }));

  return (
    <Box>
      <TableContainer
        sx={{
          margin: 0,
          maxWidth: "1000px",
          borderRadius: "2%",
          backgroundColor: "#fdf5e6",
        }}
      >
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontSize: "large",
                  fontWeight: "bold",
                }}
              >
                {t("nutrition.table.value")}
              </TableCell>
              <TableCell colSpan={4} />
            </TableRow>
          </TableHead>
          <TableBody>{rows}</TableBody>
        </Table>
      </TableContainer>
      {/* <AdditionalNutriments options={options} setNutriments={setNutriments} /> */}
    </Box>
  );
}
