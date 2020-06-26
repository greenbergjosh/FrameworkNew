import { Card, Divider, Typography } from "antd"
import React from "react"
import { Helmet } from "react-helmet"
import { ComponentDefinition, FormInterfaceComponentProps, UserInterface } from "@opg/interface-builder"
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
            {
              key: "tab3",
              label: "Progress Test",
              component: "tab",
              components: [
                {
                  hideLabel: false,
                  label: "Progress",
                  valueKey: "currentValue",
                  calculatePercent: true,
                  maxValueKey: "maxValue",
                  forceStatus: "useAPI",
                  statusKey: "status",
                  statuses: {
                    exception: "exception",
                    success: "success",
                    active: "active",
                    normal: "normal",
                  },
                  type: "line",
                  smallLine: false,
                  hideInfo: false,
                  hidden: false,
                  component: "progress",
                },
                {
                  hideLabel: false,
                  label: "Columns",
                  valueKey: "columns",
                  hideTitle: false,
                  components: [],
                  gutter: 8,
                  hidden: false,
                  component: "column",
                  columns: [
                    {
                      hideTitle: true,
                      components: [
                        {
                          hideLabel: false,
                          label: "Current Value",
                          valueKey: "currentValue",
                          hidden: false,
                          component: "number-input",
                        },
                      ],
                    },
                    {
                      hideTitle: true,
                      components: [
                        {
                          hideLabel: false,
                          label: "Max Value",
                          valueKey: "maxValue",
                          hidden: false,
                          component: "number-input",
                        },
                      ],
                    },
                    {
                      hideTitle: true,
                      components: [
                        {
                          hideLabel: false,
                          label: "Status",
                          valueKey: "status",
                          placeholder: null,
                          multiple: false,
                          defaultValue: "normal",
                          dataHandlerType: "local",
                          data: {
                            values: [
                              {
                                label: "Normal",
                                value: "normal",
                              },
                              {
                                label: "Active",
                                value: "active",
                              },
                              {
                                label: "Success",
                                value: "success",
                              },
                              {
                                label: "Exception",
                                value: "exception",
                              },
                            ],
                          },
                          allowCreateNew: false,
                          createNewLabel: "Create New...",
                          hidden: false,
                          component: "select",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          key: "post-tabs-divider",
          component: "divider",
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
