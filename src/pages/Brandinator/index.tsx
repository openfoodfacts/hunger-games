import * as React from "react";

import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import data from "./data";

//  Unused becaus it's using log scale
// const MIN_VAL = 18;
// const MAX_VAL = 16231;

const getValue = (v: number) => Math.round(10 ** v);

export default function BrandinatorPage() {
  const [filter, setFilter] = React.useState<[number, number]>([1.2, 4.3]);

  const handleFilterChage = (
    event: Event,
    newValue: number | [number, number]
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    setFilter(newValue);
  };

  const [increasingOrder, setIncreasingOrder] = React.useState(false);

  const sortedData = increasingOrder ? [...data].reverse() : data;
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" sx={{ gap: 5, width: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <Typography>Sort by products annotated</Typography>
          <Button onClick={() => setIncreasingOrder((prev) => !prev)}>
            {increasingOrder ? "increase" : "decrease"}
          </Button>
        </div>
        <div style={{ flexGrow: 1 }}>
          <Typography>Filter brands per nb of products</Typography>
          <Slider
            min={1.2}
            max={4.3}
            value={filter}
            onChange={handleFilterChage}
            valueLabelDisplay="auto"
            disableSwap
            step={0.1}
            scale={getValue}
          />
        </div>
      </Stack>
      <ol style={{ listStyleType: "none" }}>
        {sortedData
          .filter(
            ({ value }) =>
              value >= getValue(filter[0]) && value <= getValue(filter[1])
          )
          .map(({ label, value }) => (
            <li key={label}>
              <a
                href={`https://hunger.openfoodfacts.org/logos/deep-search?type=brand&value=${label}`}
              >
                {label} ({value} products)
              </a>
            </li>
          ))}
      </ol>
    </Box>
  );
}
