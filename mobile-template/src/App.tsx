import React from "react"
import "./App.scss"
import { TemplateManager } from "./components/TemplateManager"

export const App = () => (
  <div className="template-app">
    <TemplateManager getgotInterface={window.GetGotInterface} />
  </div>
)
