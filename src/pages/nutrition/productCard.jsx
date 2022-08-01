import * as React from 'react';
import Box from '@mui/material/Box';
import Zoom from "react-medium-image-zoom";
import Button from "@mui/material/Button";
import  Typography  from '@mui/material/Typography'

export default function ProductNutriments() {

  return (

    <Box flexGrow={1}
         flexShrink={1}
         display={'flex'}
         flexDirection={'column'}
         sx={{
           maxWidth: '380px'
         }}>
      <Typography variant="h5" component="h5" sx={{alignSelf: 'center'}}>
        PRODUCT.BRAND
      </Typography>
      <Typography variant="p" component="p" sx={{alignSelf: 'center'}}>
        PRODUCT DESCRIPTION IF NEEDED
      </Typography>
      <Zoom wrapStyle={{ height: "100%" }}>
        <img
          // TODO: use getFullSizeImage when the zoom is activated
          // src={getFullSizeImage(question.source_image_url)}
          src={"https://static.openfoodfacts.org/images/image-placeholder.png"}
          alt=""
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      </Zoom>
      <Box display={"flex"} flexDirection={"row"} Gap={'.5em'}>
        <Button
          color="secondary"
          variant="contained"
          size="large"
          sx={{ display: "flex", flexDirection: "column", flexGrow: 1, width: '47%'  }}
        >
          SKIP
        </Button>
        <Button
          color="success"
          variant="contained"
          size="large"
          sx={{ display: "flex", flexDirection: "column", flexGrow: 1, width: '47%' }}
        >
          VALIDATE
        </Button>
      </Box>
    </Box>)
}