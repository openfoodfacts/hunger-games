import * as React from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { debounce } from "@mui/material/utils";
import searchTaxonomy, { TaxonomyItem, TaxonomyNames } from "../offSearch";
// import { getLang } from "../localeStorageManager";

type TaxonomyAutoSelectProps = Omit<TextFieldProps, "value" | "onChange"> & {
  /**
   * The taxonly to querry
   */
  taxonomy: TaxonomyNames;
  onChange: (itemId: string) => void;
  value: string;
  /**
   * The the id bellow the text field
   */
  showKey?: boolean;
};

const isOptionEqualToValue = (option: string | TaxonomyItem, value: string) =>
  (typeof option === "string" ? option : option.id) === value;

export default function TaxonomyAutoSelect(props: TaxonomyAutoSelectProps) {
  const { taxonomy, value, onChange, showKey, fullWidth, ...other } = props;
  const [inputValue, setInputValue] = React.useState("");
  const [selectedValue, setSelectedValue] = React.useState(null);
  const [options, setOptions] = React.useState<
    readonly (string | TaxonomyItem)[]
  >([]);

  const language = "en"; //getLang();

  const fetch = React.useMemo(
    () =>
      debounce(
        (
          request: { input: string },
          callback: (results?: readonly TaxonomyItem[]) => void,
        ) => {
          searchTaxonomy[taxonomy](request.input, language).then(({ data }) => {
            callback((data?.options as TaxonomyItem[]) ?? []);
          });
        },
        400,
      ),
    [language],
  );

  React.useEffect(() => {
    let active = true;

    if (inputValue === "") {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results?: readonly TaxonomyItem[]) => {
      if (active) {
        let newOptions: readonly (string | TaxonomyItem)[] = [];

        // if (value) {
        //   newOptions = [];
        // }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  const selectedOption = options.find((option) =>
    isOptionEqualToValue(option, value),
  );
  return (
    <Autocomplete
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.text
      }
      freeSolo
      filterOptions={(x) => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={
        selectedValue && selectedValue.id === value ? selectedValue : value
      }
      isOptionEqualToValue={isOptionEqualToValue}
      // noOptionsText="No locations"
      onChange={(event: any, newValue: TaxonomyItem | null | string) => {
        console.log({ newValue });
        if (typeof newValue === "object") {
          onChange(newValue.id);
          setSelectedValue(newValue);
          return;
        }
        onChange(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onBlur={() => {
        console.log("blur");
        console.log({
          inputValue,
          value,
          selectedOption,
        });
        if (
          inputValue === value ||
          (selectedValue && selectedValue.text === inputValue)
        ) {
          return;
        }
        onChange(inputValue);
      }}
      fullWidth={fullWidth}
      renderInput={(params) => (
        <TextField
          {...params}
          {...other}
          onKeyDown={(event) => {
            console.log(event.key);
            if (event.key === "Enter") {
              event.preventDefault();
            }
          }}
          helperText={
            showKey && value
              ? selectedValue && selectedValue.id === value
                ? selectedValue.id
                : `⚠️ unknown: "${value}"`
              : ""
          }
        />
      )}
    />
  );
}
