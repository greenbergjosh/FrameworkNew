import {
  Button,
  Card,
  Divider,
  Typography
  } from "antd"
import React from "react"
import { Helmet } from "react-helmet"
import { ComponentDefinition } from "../../../../components/interface-builder/components/base/BaseInterfaceComponent"
import { FormInterfaceComponentProps } from "../../../../components/interface-builder/components/form/FormInterfaceComponent"
import { UserInterface } from "../../../../components/interface-builder/UserInterface"
import { WithRouteProps } from "../../../../state/navigation"

interface Props {}

export function UserInterfaceTest({ children, ...props }: WithRouteProps<Props>): JSX.Element {
  const [data, setData] = React.useState({})
  const [schema, setSchema] = React.useState<ComponentDefinition[]>([
    {
      component: "form",
      key: "outer",
      label: "Query Form",
      components: [
        {
          key: "tabs",
          defaultActiveKey: "tab1",
          label: "Some Tabs",
          component: "tabs",
          tabs: [
            {
              key: "tab1",
              label: "First Tab",
              component: "tab",
              components: [
                {
                  key: "pick1",
                  label: "Pick Something",
                  component: "select",
                },
                {
                  key: "write1",
                  label: "Write something",
                  component: "input",
                },
              ],
            },
            {
              key: "tab2",
              label: "Second Tab",
              component: "tab",
              components: [
                {
                  key: "write2",
                  label: "Write Something Else",
                  component: "input",
                },
                {
                  key: "pick2",
                  label: "Pick something Else",
                  component: "select",
                },
              ],
            },
          ],
        },
        {
          key: "daterange1",
          label: "Date Range",
          component: "date-range",
        },
        {
          key: "date1",
          component: "date",
          label: "Date 1",
          valueKey: "date",
          timeSettings: {
            includeTime: true,
            includeHour: true,
            includeMinute: true,
          },
        },
      ],
    } as FormInterfaceComponentProps,
  ])

  return (
    <div>
      <Helmet>
        <title>User Interface Test | Channel Admin | OPG</title>
      </Helmet>

      <Card>
        User Interface Test
        <UserInterface
          mode="edit"
          components={schema}
          data={data}
          onChangeData={(newData) => {
            console.log("New Data", newData)
            setData(newData)
          }}
          onChangeSchema={(newSchema) => {
            console.log("New Schema", newSchema)
            setSchema(newSchema)
          }}
        />
        <Divider />
        <Typography.Title>Rendered</Typography.Title>
        <UserInterface
          mode="display"
          components={schema}
          data={data}
          onChangeData={(newData) => {
            console.log("New Data", newData)
            setData(newData)
          }}
        />
        <Typography.Title underline>Data</Typography.Title>
        <pre>{JSON.stringify(data, null, 2)}</pre>
        <Typography.Title underline>Schema</Typography.Title>
        <pre>{JSON.stringify(schema, null, 2)}</pre>
        <Typography.Title>View Props</Typography.Title>
        <pre>{JSON.stringify(props, null, 2)}</pre>
      </Card>
      {children}
    </div>
  )
}

export default UserInterfaceTest
