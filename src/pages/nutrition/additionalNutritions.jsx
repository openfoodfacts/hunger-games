import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const options = [
  "Option 1",
  "Option 2",
  "Option 3",
  "Option 4",
  "Option 5",
  "Option 6",
  "Option 7",
  "Option 8"
];

export default function ControllableStates() {
  const [data, setData] = React.useState([]);
  const [inputValue, setInputValue] = React.useState("");

  return (
    <div>
      <ol>
        {data.map((obj) => (
          <li key={obj.label}>{obj.label}</li>
        ))}
      </ol>
      <br />
      <Autocomplete
        value={null}
        onChange={(event, newValue) => {
          if (newValue !== "" && data.every((obj) => obj.label !== newValue)) {
            // if it's a new one
            setData((previouseData) => [...previouseData, { label: newValue }]);
          }
          // Reset the input content on selection
          setInputValue("");
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        options={options}
        sx={{ width: 300 }}
        renderInput={(params) => (
          <TextField {...params} label="Add nutriment" />
        )}
      />
    </div>
  );
}
