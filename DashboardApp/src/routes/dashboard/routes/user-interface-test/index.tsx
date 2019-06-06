import { Button, Card, Divider, Typography } from "antd"
import React from "react"
import { Helmet } from "react-helmet"
import { ComponentDefinition } from "../../../../components/interface-builder/components/BaseInterfaceComponent"
import { FormInterfaceComponentProps } from "../../../../components/interface-builder/components/FormInterfaceComponent"
import { UserInterface } from "../../../../components/interface-builder/UserInterface"
import { WithRouteProps } from "../../../../state/navigation"

// Components.setComponents({
//   button: ButtonFormComponent,
//   checkmatrix: CheckMatrix,
//   "code-editor": CodeEditorFormComponent,
//   date: DateFormComponent,
//   "date-range": DateRangeFormComponent,
//   select: SelectFormComponent,
// })

interface Props {}

export function UserInterfaceTest({ children, ...props }: WithRouteProps<Props>): JSX.Element {
  const [schema, setSchema] = React.useState<ComponentDefinition[]>([
    {
      component: "form",
      label: "Query Form",
      data: { sssdfsfd: "Sfsdfdfff" },
      components: [
        {
          label: "Date 1",
          component: "date-range",
        },
        {
          component: "form",
          label: "Query Form",
          data: { sssdfsfd: "Sfsdfdfff" },
          components: [
            {
              label: "Date 2",
              component: "date-range",
            },
            {
              label: "Date 3",
              component: "date-range",
            },
          ],
        },
        {
          label: "Date 4",
          component: "date-range",
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
          onChange={(newSchema) => {
            console.log("New Schema", newSchema)
            setSchema(newSchema)
          }}
        />
        <Divider />
        <Typography.Title>Rendered</Typography.Title>
        <Button onClick={() => setSchema({ ...schema })}>Refresh Render</Button>
        <UserInterface mode="display" components={schema} />
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
