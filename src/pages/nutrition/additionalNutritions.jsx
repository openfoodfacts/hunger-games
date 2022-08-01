import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export default function AdditionalNutriments({options, setNutriments, setAdditionalNutriments}) {

  const [inputValue, setInputValue] = React.useState('')

  return (
    <Autocomplete
      value={null}
      disablePortal
      id="nutrition-input"
      options={options}
      sx={{ width: 245, marginLeft: 2, marginTop: 2 }}
      onChange={(event) => {
        const nutrIndex = event.target.dataset.optionIndex
        if (nutrIndex) {
          setNutriments(prev => [...prev, options[nutrIndex]])
          setAdditionalNutriments(prev => prev.filter(elem => elem !== options[nutrIndex]))
          setInputValue("")
      }
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => <TextField {...params} label="Add nutriment" />}
    />
  );
}

