import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { getLang } from "../../localeStorageManager";
import axios from "axios";
import { URL_ORIGINE } from "../../const";

// Otherwise fallback on english
const AVAILABLE_OPTIONS = ["fr", "de", "es"];

const cleanName = (name) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^0-9a-z]/gi, " ");

const LabelFilter = (props) => {
  const { showKey, onChange, value, insightType, fullWidth, ...other } = props;
  const [options, setOptions] = React.useState([]);
  const [innerValue, setInnerValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState("");
  const fetchedKeysRef = React.useRef({});

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

  React.useEffect(() => {
    setOptions([]);
    fetchedKeysRef.current = {};
  }, [insightType]);

  React.useEffect(() => {
    const keyToFetch = inputValue.toLowerCase().replace(/[^0-9a-z]/gi, "-");

    [
      keyToFetch.slice(0, 1),
      keyToFetch.slice(0, 2),
      keyToFetch.slice(0, 3),
    ].forEach((key) => {
      if (key.length > 0 && !fetchedKeysRef.current[key]) {
        fetchedKeysRef.current[key] = true;
        axios
          .get(
            `${URL_ORIGINE}/data/${
              AVAILABLE_OPTIONS.includes(lang) ? lang : "en"
            }/${insightType}/${key}.json`
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
    });
  }, [inputValue, insightType, lang]);

  return (
    <Autocomplete
      fullWidth={fullWidth}
      freeSolo
      onChange={(_, newValue) => {
        setInnerValue(newValue);
        onChange(newValue?.key ?? newValue);
      }}
      onInputChange={(e, newInputValue, reason) => {
        setInputValue(newInputValue);
      }}
      onBlur={() => {
        const isSelectedValue =
          typeof inputValue === "string"
            ? innerValue !== inputValue
            : innerValue.cleanName === cleanName(inputValue);

        if (!isSelectedValue) {
          setInnerValue(inputValue);
          onChange(inputValue);
        }
      }}
      inputValue={inputValue}
      value={innerValue}
      options={options}
      getOptionLabel={(option) => option?.name ?? option}
      renderInput={(params) => (
        <TextField
          {...params}
          {...other}
          helperText={showKey && innerValue?.key}
        />
      )}
      filterOptions={(options, state) => {
        return options.filter((option) =>
          option?.cleanName.includes(cleanName(state.inputValue))
        );
      }}
    />
  );
};

export default LabelFilter;
