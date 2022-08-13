import * as React from "react";
import NutritionTable from "./table";
import ProductNutriments from "./productCard";
import { Box } from "@mui/material";

import { basicNutriments } from "./nutritionFields";

export default function Nutrition() {
  const [nutriments, setNutriments] = React.useState(basicNutriments);

  function onchangeHandler(e) {
    const { value, name, id } = e.target;
    console.log(name);
    setNutriments((prevState) =>
      prevState.map((nutr) => {
        return id === nutr.label ? { ...nutr, [name]: value } : nutr;
      })
    );
  }

  function deleteItem(nutr) {
    setNutriments((prev) =>
      prev.map((nutriment) =>
        nutriment === nutr ? { ...nutriment, display: false } : nutriment
      )
    );
  }

  return (
    <Box
      display={"flex"}
      flexDirection={{ xs: "column", md: "row" }}
      gap={2}
      sx={{
        width: 1,
        height: 1,
        alignItems: { xs: "center", md: "flex-start" },
        justifyContent: "center",
        padding: 4,
        border: "5px solid green",
        minHeight: "89.4vh",
      }}
    >
      <ProductNutriments
        setNutriments={setNutriments}
        nutriments={nutriments}
      />
      <NutritionTable
        nutriments={nutriments.filter((nutr) => nutr.display)}
        setNutriments={setNutriments}
        additionalNutriments={nutriments.filter((nutr) => !nutr.display)}
        onchangeHandler={onchangeHandler}
        deleteItem={deleteItem}
      />
    </Box>
  );
}
