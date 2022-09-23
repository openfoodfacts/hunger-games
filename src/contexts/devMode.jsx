import * as React from "react";
import {
  getIsDevMode,
  getVisiblePages,
  getPageCustomization,
} from "../localeStorageManager";

const DevModeContext = React.createContext({
  devMode: getIsDevMode(),
  visiblePages: getVisiblePages(),
  pageCustomization: getPageCustomization(),
});

export default DevModeContext;
