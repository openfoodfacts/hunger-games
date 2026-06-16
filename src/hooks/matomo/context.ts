import { createContext } from "react";
import type { MatomoInstance } from "./types";

export const MatomoContext = createContext<MatomoInstance | null>(null);
