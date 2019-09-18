import React from "react"
import "./App.scss"
import { TemplateManager } from "./components/TemplateManager"
import { GetGotService } from "./services/getgot-service"

export const App = () => (
  <div className="template-app">
    <TemplateManager getgotService={GetGotService} />
  </div>
)
