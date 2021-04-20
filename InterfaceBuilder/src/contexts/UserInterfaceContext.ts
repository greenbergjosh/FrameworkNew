import React from "react"
import { UserInterfaceContextManager } from "../globalTypes"

export const UserInterfaceContext = React.createContext<UserInterfaceContextManager | null>(null)
