import { flattenComponents } from "formiojs/utils/formUtils"
import debounce from "lodash.debounce"
import React from "react"
import { Form } from "react-formio"
import { JSONRecord } from "../../../../../../data/JSON"
import { QueryConfig } from "../../../../../../data/Report"
import { useRematch } from "../../../../../../hooks"
import { generateLayoutFromParameters } from "./generators"

interface Props {
  layout: QueryConfig["layout"]
  parameters: QueryConfig["parameters"]
  parameterValues: JSONRecord
  onSubmit: (parameterValues: JSONRecord, formState: FormState) => void
}

// TODO: Improve this type
export interface FormState {
  data: JSONRecord
  metadata: {
    browserName: string
    offset: number
    onLine: boolean
    pathName: string
    referrer: string
    timezone: string
    userAgent: string
  }
}

const generatedSubmitButton = {
  type: "button",
  label: "Generate Report",
  // key: "submit",
  disableOnInvalid: true,
  theme: "primary",
  input: true,
  tableView: true,
}

const generateFormFromLayout = (layout: QueryConfig["layout"]) => ({
  display: "form",
  components: Object.values(flattenComponents(layout)).find(({ type }: any) =>
    ["button", "submit"].includes(type.toLowerCase())
  )
    ? layout
    : layout.concat(generatedSubmitButton),
})

// const handleSubmit = debounce((uncleanParameterValues: FormIOState, ...args: any[]) => {
//   console.log("QueryForm.Form.onSubmit", uncleanParameterValues, args)
//   const { submit, ...cleanParameterValues } = uncleanParameterValues.data
//   onSubmit(cleanParameterValues)
// })

export const QueryForm = React.memo(({ layout, parameters, parameterValues, onSubmit }: Props) => {
  const [fromStore, dispatch] = useRematch((s) => null)

  // const TaskRemoteQueryDependencies = useTaskRemoteData(
  //   (parameters: QueryConfig["parameters"], layout: QueryConfig["layout"]) =>
  //     new Task(() => {
  //       // Step 1) Traverse parameters. Find any remote datasource requests
  //       const needRemoteData = parameters.filter(
  //         (parameter) => parameter.type === "select" && parameter.options.dataLocation === "remote"
  //       )
  //       // Step 2) If needed, generate a layout from the parameters
  //       const realLayout = layout.length
  //         ? layout
  //         : parameters.length
  //         ? generateLayoutFromParameters(parameters)
  //         : []

  //       // Step 3) If there were remote data sources, then traverse the layout
  //       // if (needRemoteData.length && realLayout.length) {
  //       //   const recursiveKeys = ["components", "columns"]
  //       //   const realLayout
  //       //   // 3a) Find match up of layoutItem.key === parameterItem.name
  //       //   needRemoteData.forEach((neededItem) => {
  //       //     array.lookup()
  //       //   })
  //       //   // 3b) Inject loaded data into layoutItem
  //       // }

  //       return realLayout
  //     }),
  //   parameters,
  //   layout
  // )

  // const foo = React.useEffect(() => {
  //   console.log("QueryForm.onMount")
  //   return () => console.log("QueryForm.onUnmount")
  // }, [])

  const handleSubmit = React.useCallback(
    debounce((formState: FormState) => {
      // console.log("QueryForm.Form.onSubmit", formState)
      const { submit, ...cleanParameterValues } = formState.data
      onSubmit(cleanParameterValues, formState)
    }, 50),
    [onSubmit]
  )

  const realLayout = layout.length
    ? layout
    : parameters.length
    ? generateLayoutFromParameters(parameters)
    : null

  if (realLayout) {
    // return (
    //   <TaskRemoteQueryDependencies.Fold>
    //     {{
    //       Initial: () => <p>initial</p>,
    //       Pending: (prev) => <p>initial</p>,
    //       Failure: (err) => <p>err: {err.message}</p>,
    //       Success: (val) => <p>{val}</p>,
    //     }}
    //   </TaskRemoteQueryDependencies.Fold>
    // )
    return (
      <Form
        form={generateFormFromLayout(realLayout)}
        submission={{ data: parameterValues }}
        onSubmit={handleSubmit}
      />
    )
  }

  return null
})

function recursiveIndexBy(
  items: JSONRecord[],
  keyFn: (item: JSONRecord) => string,
  recursiveKeys: string[],
  result: JSONRecord = {}
) {}
