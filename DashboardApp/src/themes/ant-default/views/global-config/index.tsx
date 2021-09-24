import { Card } from "antd"
import React from "react"
import { Helmet } from "react-helmet"
import { ComponentDefinition } from "@opg/interface-builder"
import { WithRouteProps } from "../../../../state/navigation"

interface Props {}

export function GlobalConfigAdmin({ children, location, navigate, path, uri }: WithRouteProps<Props>): JSX.Element {
  return (
    <Card bordered={false} size="small">
      <Helmet>
        <title>Manage Configurations | Channel Admin | OPG</title>
      </Helmet>

      {children}
    </Card>
  )
}

export default GlobalConfigAdmin

export const ROOT_CONFIG_COMPONENTS = [
  {
    key: "lang",
    valueKey: "lang",
    component: "select",
    label: "Language",
    dataHandlerType: "local",
    getRootUserInterfaceData: () => void 0,
    onChangeRootData: () => void 0,
    incomingEventHandlers: [],
    outgoingEventMap: {},
    data: {
      values: [
        { label: "JSON", value: "json" },
        { label: "C#", value: "csharp" },
      ],
    },
  },
  {
    key: "layout",
    label: "Root Layout Creator",
    valueKey: "layout",
    component: "user-interface",
    defaultDataValue: {},
    defaultValue: [],
    mode: "edit",
    visibilityConditions: {
      "===": [
        "json",
        {
          var: ["lang"],
        },
      ],
    },
  },
] as ComponentDefinition[]
