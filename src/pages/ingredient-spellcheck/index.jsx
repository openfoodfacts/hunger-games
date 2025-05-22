import * as React from "react";
import Loader from "../loader";
import { RobotoffIngredients } from "../../components/OffWebcomponents";

export default function IngredientSpellcheck() {
  return (
    <React.Suspense fallback={<Loader />}>
      <RobotoffIngredients />
    </React.Suspense>
  );
}
