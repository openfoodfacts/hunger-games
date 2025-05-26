import * as React from "react";
import { Typography } from "@mui/material";

interface DiffPrintProps {
  text: string;
  mask: string;
  /**
   * Map mask character to style
   */
  mapping: Record<string, React.CSSProperties | undefined>;
}
export function DiffPrint(props: DiffPrintProps) {
  const { text, mask, mapping } = props;

  return (
    <Typography>
      {text.split("").map((char, index) => (
        <span key={`${text}-${index}`} style={mapping[mask[index]]}>
          {char}
        </span>
      ))}
    </Typography>
  );
}
