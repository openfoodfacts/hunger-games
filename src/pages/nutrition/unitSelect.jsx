import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

export default function SelectUnit({ options, value }) {
  const [age, setAge] = React.useState();

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
  };

  return (
    <div>
      <FormControl sx={{ m: 1, minWidth: 80, margin: "0" }}>
        {options && (
          <Select
            labelId="demo-simple-select-autowidth-label"
            id="demo-simple-select-autowidth"
            value={options}
            //onChange={handleChange}
            autoWidth
            label=""
          >
            <MenuItem value={options}>{options}</MenuItem>
            {/*<MenuItem value={options}>=</MenuItem>*/}
            {/*<MenuItem value={options}>{'<'}</MenuItem>*/}
          </Select>
        )}
      </FormControl>
    </div>
  );
}
