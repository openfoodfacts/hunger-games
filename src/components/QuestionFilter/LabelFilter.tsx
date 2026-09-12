import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { getLang } from "../../localeStorageManager";
import { SearchApi } from "@openfoodfacts/openfoodfacts-nodejs";

import { useQuery } from "@tanstack/react-query";

const offClient = new SearchApi(window.fetch.bind(window));

type TaxonomyOption = {
  id: string;
  taxonomy_name: string;
  text: string;
};

interface LabelFilterProps {
  showKey?: boolean;
  onChange: (value: string) => void;
  value: string;
  insightType?: string;
  fullWidth?: boolean;
  label?: string;
  placeholder?: string;
  size?: "small" | "medium";
  [key: string]: unknown;
}

const LabelFilter = (props: LabelFilterProps) => {
  const { showKey, onChange, value, insightType, fullWidth, ...other } = props;

  const [selection, setSelection] = React.useState<{
    sourceValue: string;
    value: string | TaxonomyOption | null;
  }>({ sourceValue: value, value });
  const [inputValue, setInputValue] = React.useState("");

  const lang = getLang();

  const { data: options } = useQuery({
    queryKey: ["autocomplete", insightType, inputValue, lang],
    queryFn: async () => {
      if (inputValue.length < 2) {
        return [];
      }

      const response = (await offClient.autocomplete({
        q: inputValue,
        taxonomy_names: insightType,
        lang,
        size: 20,
      })) as {
        data?: {
          options?: TaxonomyOption[];
        };
      };

      return response?.data?.options ?? [];
    },
  });

  const innerValue =
    selection.sourceValue === value
      ? selection.value
      : (options?.find((option) => option.id === value) ?? value);

  return (
    <Autocomplete
      fullWidth={fullWidth}
      freeSolo
      onChange={(_, newValue) => {
        setSelection({ sourceValue: value, value: newValue });
        onChange(typeof newValue === "object" ? newValue?.id : newValue);
      }}
      onInputChange={(_event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onBlur={() => {
        const isSelectedValue =
          typeof innerValue === "string"
            ? innerValue === inputValue
            : innerValue?.text === inputValue;
        if (!isSelectedValue) {
          setSelection({ sourceValue: value, value: inputValue });
          onChange(inputValue);
        }
      }}
      inputValue={inputValue}
      value={innerValue}
      options={options ?? []}
      getOptionLabel={(option) =>
        typeof option === "object" ? option.text : option
      }
      renderInput={(params) => (
        <TextField
          {...params}
          {...other}
          helperText={
            showKey &&
            ((typeof innerValue === "object" && innerValue?.id) ||
              (innerValue !== "" &&
                innerValue !== null &&
                `⚠️ unknown: "${typeof innerValue === "string" ? innerValue : innerValue.text}"`))
          }
        />
      )}
    />
  );
};

export default LabelFilter;
