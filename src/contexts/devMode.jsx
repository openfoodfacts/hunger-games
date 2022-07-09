import * as React from "react";
import { getIsDevMode } from "../localeStorageManager";

const DevModeContext = React.createContext({
  devMode: getIsDevMode(),
  setDevMode: () => {},
});

export default DevModeContext;
