import * as React from "react";
import NutritionTable from "./table";
import ProductNutriments from "./productCard";
import { Box } from "@mui/material";
import { flexbox } from "@material-ui/system";

import {basicNutriments, additionalNutrs} from "./nutritionFields";

export default function Nutrition() {

  const [nutriments, setNutriments] = React.useState(basicNutriments)

  const [additionalNutriments, setAdditionalNutriments] = React.useState(additionalNutrs)

  function onchangeHandler(e) {
    const {value, name} = e.target
    setNutriments(prevState => prevState.map(
      nutr => {
        return name === nutr.label? {...nutr, value} : nutr
      }
    ))
  }

  function deleteItem(nutrition) {
    setNutriments(prev => prev.filter(elem => elem !== nutrition))
    setAdditionalNutriments(prev => [...prev, nutrition])
  }

  return (
    <Box display={"flex"}
         flexDirection={{ xs: "column", md: "row" }}
         gap={2}
         sx={{
           width: 1,
           height: 1,
           alignItems: { xs: 'center', md:"flex-start" },
           justifyContent: "center",
           padding: 4
         }}>
      <ProductNutriments setNutriments={setNutriments}/>
      <NutritionTable
        nutriments={nutriments}
        setNutriments={setNutriments}
        additionalNutriments={additionalNutriments}
        setAdditionalNutriments={setAdditionalNutriments}
        onchangeHandler={onchangeHandler}
        deleteItem={deleteItem}
      />
    </Box>
  );
}