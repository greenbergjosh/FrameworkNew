import React from "react"
import "./App.scss"
import { TemplateAppErrorBoundary } from "./components/TemplateAppErrorBoundary"
import { TemplateManager } from "./components/TemplateManager"
import { GetGotService } from "./services/getgot-service"

export const App = () => (
  <div className="template-app">
    <TemplateAppErrorBoundary>
      <TemplateManager getgotService={GetGotService} />
    </TemplateAppErrorBoundary>
  </div>
)
