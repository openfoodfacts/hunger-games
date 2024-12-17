import * as React from "react";
import { UNITS } from "./config";
import { isValidUnit } from "./utils";

interface NutrimentCellProps {
  nutrimentId: string;
  nutrimentKey: string;
  tabIndex: number;
  value?: string;
  unit?: string;
  productValue?: number;
  productUnit?: string;
  displayOFFValue: boolean;
  setValues: (object) => void;
}

/**
 * Returns the string value of the input without any space.
 */
function clean(input: undefined | string | null | number): string {
  if (input == undefined) {
    return "";
  }
  return `${input}`.replaceAll(" ", "");
}
function getLegendColor(product, prediction) {
  const cleanProduct = clean(product);
  const cleanPrediction = clean(prediction);

  if (cleanProduct === cleanPrediction) {
    return "green";
  }

  if (cleanProduct === "" || cleanPrediction === "") {
    return "orange";
  }

  if (cleanProduct !== cleanPrediction) {
    return "red";
  }
  return undefined;
}

export const NutrimentCell = (props: NutrimentCellProps) => {
  const {
    nutrimentId,
    nutrimentKey,
    tabIndex,
    value,
    unit,
    setValues,
    productValue,
    productUnit,
    displayOFFValue,
  } = props;

  return (
    <td
      data-label-id={nutrimentId}
      style={{
        width: "fit-content",
        paddingRight: 20,
      }}
      onFocus={() => {
        const element = document.querySelector(
          `tr[data-label-id=${nutrimentId}]`,
        );
        element.classList.add("focused");
      }}
      onBlur={() => {
        const element = document.querySelector(
          `tr[data-label-id=${nutrimentId}]`,
        );
        element.classList.remove("focused");
      }}
    >
      <div style={{ display: "inline-table" }}>
        <input
          style={{ marginRight: 4, maxWidth: 80 }}
          value={value ?? ""}
          tabIndex={tabIndex}
          onChange={(event) =>
            setValues((p) => ({
              ...p,
              [nutrimentKey]: {
                ...p[nutrimentKey],
                value: event.target.value,
              },
            }))
          }
        />
        <br />
        {displayOFFValue && (
          <legend
            style={{
              fontSize: 13,
              textAlign: "end",
            }}
          >
            <span
              style={{
                color: getLegendColor(productValue, value),
              }}
            >
              {productValue}
            </span>
            <span
              style={{
                color: getLegendColor(productUnit, unit),
              }}
            >
              {productUnit}
            </span>
          </legend>
        )}
      </div>
      {isValidUnit(unit) ? (
        <select
          style={{ width: 55 }}
          value={unit || ""}
          tabIndex={tabIndex}
          onChange={(event) => {
            setValues((p) => ({
              ...p,
              [nutrimentKey]: {
                ...p[nutrimentKey],
                unit: event.target.value,
              },
            }));
          }}
        >
          {UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      ) : (
        <span style={{ display: "inline-block", width: 55 }}>{unit}</span>
      )}
      <button
        tabIndex={-1}
        onClick={() => {
          setValues((p) => ({
            ...p,
            [nutrimentKey]: {
              ...p[nutrimentKey],
              unit: null,
              value: null,
            },
          }));
        }}
      >
        X
      </button>
    </td>
  );
};
