import * as React from "react";
import {
  getIsDevMode,
  getShowDatabase,
  getShowNutriscore,
} from "../localeStorageManager";

const DevModeContext = React.createContext({
  devMode: getIsDevMode(),
  setDevMode: () => {},
  showDatabase: getShowDatabase(),
  setShowDatabase: () => {},
  showNutriscore: getShowNutriscore(),
  setShowNutriscore: () => {},
});

export default DevModeContext;
