import * as React from "react";
import NutritionTable from "./table";
import ProductNutriments from "./productCard";
import { Box } from "@mui/material";
import { flexbox } from "@material-ui/system";

import {basicNutriments} from "./nutritionFields";

export default function Nutrition() {

  const [nutriments, setNutriments] = React.useState(basicNutriments)

  function onchangeHandler(e) {
    const {value, name} = e.target
    setNutriments(prevState => prevState.map(
      nutr => {
        return name === nutr.label? {...nutr, value} : nutr
      }
    ))
  }

  function deleteItem(nutr) {
    setNutriments(prev => prev.map(nutriment => nutriment === nutr ? ({...nutriment, display: false}) : nutriment ))
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
        nutriments={nutriments.filter(nutr => nutr.display)}
        setNutriments={setNutriments}
        additionalNutriments={nutriments.filter(nutr => !nutr.display)}
        onchangeHandler={onchangeHandler}
        deleteItem={deleteItem}
      />
    </Box>
  );
}