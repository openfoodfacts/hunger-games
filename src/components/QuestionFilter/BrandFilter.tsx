import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useTranslation } from "react-i18next";
import brands from "../../assets/brands.json";

interface BrandFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function BrandFilter(props: BrandFilterProps) {
  const { value, onChange } = props;

  const { t } = useTranslation();
  return (
    <Autocomplete
      freeSolo
      value={value}
      onChange={(event, newValue: string | null) => onChange(newValue ?? "")}
      options={brands}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t("questions.filters.long_label.brand")}
          placeholder={t("questions.filters.placeholders.brand")}
          size="small"
        />
      )}
    />
  );
}
