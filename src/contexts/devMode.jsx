import * as React from "react";
import { getIsDevMode, getVisiblePages } from "../localeStorageManager";

const DevModeContext = React.createContext({
  devMode: getIsDevMode(),
  visiblePages: getVisiblePages(),
});

export default DevModeContext;
