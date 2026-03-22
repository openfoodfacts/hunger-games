import * as React from "react";
import {
  getIsDevMode,
  getVisiblePages,
  getPageCustomization,
} from "../localeStorageManager";

type DevModeContextType = {
  devMode: boolean;
  setDevMode: React.Dispatch<React.SetStateAction<boolean>>;
  visiblePages: Record<string, boolean>;
  setVisiblePages: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  pageCustomization: Record<string, any>;
  setPageCustomization: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >;
};

const DevModeContext = React.createContext<DevModeContextType>({
  devMode: getIsDevMode(),
  setDevMode: () => {
    throw new Error("setDevMode function not implemented");
  },
  visiblePages: getVisiblePages(),
  setVisiblePages: () => {
    throw new Error("setVisiblePages function not implemented");
  },
  pageCustomization: getPageCustomization(),
  setPageCustomization: () => {
    throw new Error("setPageCustomization function not implemented");
  },
});

export default DevModeContext;
