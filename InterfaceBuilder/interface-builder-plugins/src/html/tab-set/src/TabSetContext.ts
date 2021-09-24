import React from "react"
import { ITabSetContext } from "./types"

export const TabSetContext = React.createContext<ITabSetContext>({
  activeTabKey: undefined,
  setActiveTabKey: () => void 0,
  availableTabs: [],
  addAvailableTab: () => void 0,
  isUserInteracting: false,
  setUserInteracting: () => void 0,
})
