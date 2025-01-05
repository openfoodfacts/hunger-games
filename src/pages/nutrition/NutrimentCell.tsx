import * as React from "react";
import { UNITS } from "./config";
import { FORCED_UNITS, isValidUnit } from "./utils";

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

function getRatio(unit: 'g' | 'mg' | 'µg' | string) {
  switch (unit) {
    case 'g':
      return 1;
    case 'mg':
      return 0.001;
    case 'µg':
      return 0.000001;
    default:
      return 1
  }
}

/**
 * Returns the string value of the input without any space.
 */
function clean(input: undefined | string | null | number): string {
  if (input == undefined) {
    return "";
  }
  return `${input}`.replaceAll(" ", "").toLowerCase();
}

function getLegendColor(productValue, value, productUnit, unit) {
  const cleanProductValue = clean(productValue);
  const cleanProductUnit = clean(productUnit);
  const cleanValue = clean(value);
  const cleanUnit = clean(unit);

  if (cleanProductValue ===
    cleanValue &&
    cleanProductUnit ===
    cleanUnit) {
    return "green";
  }

  if (cleanProductValue === "" || cleanProductUnit === "" ||
    cleanValue === "" ||
    cleanUnit === "") {
    return "orange";
  }

  const ratioProduct = getRatio(cleanProductUnit);
  const ratioInput = getRatio(cleanUnit);
  const numberProduct = Number.parseFloat(cleanProductValue.match(/(\.|,|\d)+/)[0])
  const numberInput = Number.parseFloat(cleanValue.match(/(\.|,|\d)+/)[0])


  if (ratioProduct * numberProduct === ratioInput * numberInput) {
    return 'green'
  }
  return 'red'
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

  const forcedUnit = FORCED_UNITS[nutrimentId]
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
                color: getLegendColor(productValue, value, productUnit, unit),
              }}
            >
              {productValue}
              {productUnit}
            </span>
          </legend>
        )}
      </div>
      {forcedUnit === undefined && isValidUnit(unit, nutrimentId) ? (
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
        <span style={{ display: "inline-block", width: 55 }}>{forcedUnit ?? unit}</span>
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
