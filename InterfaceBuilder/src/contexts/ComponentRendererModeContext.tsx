import React from "react"
import { UserInterfaceProps } from "../globalTypes"

export const ComponentRendererModeContext = React.createContext<UserInterfaceProps["mode"]>("display")
