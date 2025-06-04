import * as React from "react";
import Loader from "../loader";
import { RobotoffIngredientSpellcheck } from "../../components/OffWebcomponents";

export default function IngredientSpellcheck() {
  return (
    <React.Suspense fallback={<Loader />}>
      <RobotoffIngredientSpellcheck />
    </React.Suspense>
  );
}
