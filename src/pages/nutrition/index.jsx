import * as React from "react";
import NutritionTable from './table'
import ImageTable from './picture'
import { Box } from "@mui/material"
import { flexbox } from '@material-ui/system'

export default function Nutrition(){
  return(
    <Box display={'flex'} flexDirection={{ xs: "column", md: 'row' }} sx={{width: 1, height: 1, alignItems: 'center', justifyContent: 'center', border: "5px solid red"}}>
      <ImageTable/>
      <NutritionTable/>
    </Box>
  )
}