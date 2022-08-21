import * as React from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function SelectUnit({ options, value, onchangeHandler }) {
  return (
    <div>
      <FormControl sx={{ m: 1, minWidth: 80, margin: "0" }}>
        {options && (
          <Select
            labelId="demo-simple-select-autowidth-label"
            id="demo-simple-select-autowidth"
            value={options}
            onChange={onchangeHandler}
            name={value}
          >
            <MenuItem value={options}>{options}</MenuItem>
          </Select>
        )}
      </FormControl>
    </div>
  );
}
