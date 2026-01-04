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
  onChange: (itemId: string, ctx?: object) => void;
  value: string;
  /**
   * The the id bellow the text field
   */
  showKey?: boolean;
  lang?: string;
};

const isOptionEqualToValue = (
  option: string | TaxonomyItem,
  value: string | TaxonomyItem,
) => {
  const optObj = typeof option === "string" ? option : option.text;
  const valObj = typeof value === "string" ? value : value.text;
  return optObj === valObj;
};

export default function TaxonomyAutoSelect(props: TaxonomyAutoSelectProps) {
  const { taxonomy, value, onChange, showKey, fullWidth, lang, ...other } =
    props;
  const [inputValue, setInputValue] = React.useState("");
  const [selectedValue, setSelectedValue] = React.useState<TaxonomyItem | null>(
    null,
  );
  const [options, setOptions] = React.useState<
    readonly (string | TaxonomyItem)[]
  >([]);

  const language = lang ?? "en"; //getLang();

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
    [language, taxonomy],
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
        selectedValue && selectedValue.text === value ? selectedValue : value
      }
      isOptionEqualToValue={isOptionEqualToValue}
      // noOptionsText="No locations"
      onChange={(event, newValue) => {
        if (typeof newValue === "object") {
          if (newValue != null) {
            onChange(newValue.text, newValue);
            setSelectedValue(newValue);
          }
          return;
        }
        onChange(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onBlur={() => {
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
            if (event.key === "Enter") {
              event.preventDefault();
            }
          }}
          helperText={
            showKey && value
              ? selectedValue && selectedValue.text === value
                ? ""
                : `⚠️ unknown: "${value}"`
              : ""
          }
        />
      )}
    />
  );
}
