import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { getLang } from "../../localeStorageManager";
import axios from "axios";

// Otherwise fallback on english
const AVAILABLE_OPTIONS = ["fr", "de", "es"];

const cleanName = (name) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^0-9a-z]/gi, " ");

const LabelFilter = (props) => {
  const { onChange, value, insightType, ...other } = props;
  const [options, setOptions] = React.useState([]);
  const [innerValue, setInnerValue] = React.useState(null);
  const lang = getLang();

  React.useEffect(() => {
    setInnerValue((prev) => {
      if (prev === value || prev?.key === value) {
        return prev;
      }
      const solution = options.find((option) => option.key === value);

      if (solution) {
        return solution;
      }
      return value;
    });
  }, [value, options]);

  React.useEffect(() => setOptions([]), [insightType]);

  return (
    <Autocomplete
      freeSolo
      onChange={(_, newValue) => {
        setInnerValue(newValue);
        onChange(newValue?.key ?? newValue);
      }}
      onInputChange={(e, inputValue) => {
        console.log(inputValue);
        if (inputValue.length < 4) {
          axios
            .get(
              `http://localhost:3000/data/${
                AVAILABLE_OPTIONS.includes(lang) ? lang : "en"
              }/${insightType}/${inputValue
                .toLowerCase()
                .replace(/[^0-9a-z]/gi, "-")}.json`
            )
            .then(({ data }) => {
              setOptions((prevOptions) => {
                const existingKeys = prevOptions.map((x) => x.key);
                return [
                  ...prevOptions,
                  ...data
                    .filter(({ key }) => !existingKeys.includes(key))
                    .map((option) => ({
                      ...option,
                      cleanName: cleanName(option.name),
                    })),
                ];
              });
            })
            .catch(() => {});
        }
      }}
      value={innerValue}
      options={options}
      getOptionLabel={(option) => option?.name ?? option}
      renderInput={(params) => <TextField {...params} {...other} />}
      filterOptions={(options, state) => {
        return options.filter((option) =>
          option?.cleanName.includes(cleanName(state.inputValue))
        );
      }}
    />
  );
};

export default LabelFilter;
