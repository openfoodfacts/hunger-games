import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export default function AdditionalNutriments({options, setNutriments, setAdditionalNutriments}) {
  return (
    <Autocomplete
      disablePortal
      id="combo-box-demo"
      options={options}
      sx={{ width: 300 }}
      onChange={(event) => {
        const nutrIndex = event.target.dataset.optionIndex
        if (nutrIndex) {
          setNutriments(prev => [...prev, options[nutrIndex]])
          setAdditionalNutriments(prev => prev.filter(elem => elem !== options[nutrIndex]))
          console.log(options)
      }

      }}
      renderInput={(params) => <TextField {...params} label="Nutrition" />}
    />
  );
}

// Top 100 films as rated by IMDb users. http://www.imdb.com/chart/top
