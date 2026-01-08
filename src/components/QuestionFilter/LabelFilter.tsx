import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { getLang } from "../../localeStorageManager";
import { SearchApi } from "@openfoodfacts/openfoodfacts-nodejs";

import { useQuery } from "@tanstack/react-query";

const offClient = new SearchApi(window.fetch);

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

  const [innerValue, setInnerValue] = React.useState<
    string | TaxonomyOption | null
  >(null);
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

  React.useEffect(() => {
    setInnerValue((prev) => {
      if (typeof prev === "object" && prev?.id === value) {
        return prev;
      }
      const solution = options?.find((option) => option.id === value);

      if (solution) {
        return solution;
      }
      return value;
    });
  }, [value, options]);

  return (
    <Autocomplete
      fullWidth={fullWidth}
      freeSolo
      onChange={(_, newValue) => {
        setInnerValue(newValue);
        onChange(typeof newValue === "object" ? newValue?.id : newValue);
      }}
      onInputChange={(e, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onBlur={() => {
        const isSelectedValue =
          typeof innerValue === "string"
            ? innerValue === inputValue
            : innerValue?.text === inputValue;
        if (!isSelectedValue) {
          setInnerValue(inputValue);
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
                `⚠️ unknown: "${innerValue}"`))
          }
        />
      )}
    />
  );
};

export default LabelFilter;
