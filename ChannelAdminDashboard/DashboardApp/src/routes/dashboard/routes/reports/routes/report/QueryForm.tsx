import React from "react"
import debounce from "lodash.debounce"
import { QueryConfig } from "../../../../../../data/Report"
import { Form } from "react-formio"
import { JSONRecord } from "../../../../../../data/JSON"
import { useRematch } from "../../../../../../hooks"
import { generateLayoutFromParameters } from "./generators"
import { useTaskRemoteData } from "../../../../../../hooks/use-task-remote-data"
import { Task } from "fp-ts/lib/Task"
import * as array from "fp-ts/lib/Array"
import { success } from "@devexperts/remote-data-ts"
import { Query } from "@syncfusion/ej2-data"
import { groupBy } from "fp-ts/lib/NonEmptyArray2v"

interface Props {
  layout: QueryConfig["layout"]
  parameters: QueryConfig["parameters"]
  parameterValues: JSONRecord
  onSubmit: (parameterValues: JSONRecord) => void
}

// TODO: Improve this type
interface UncleanParameterValues {
  data: JSONRecord
  metadata: JSONRecord
}

const generateFormFromLayout = (layout: QueryConfig["layout"]) => ({
  display: "form",
  components: layout.concat({
    type: "button",
    label: "Filter",
    // key: "submit",
    disableOnInvalid: true,
    theme: "primary",
    input: true,
    tableView: true,
  }),
})

// const handleSubmit = debounce((uncleanParameterValues: UncleanParameterValues, ...args: any[]) => {
//   console.log("QueryForm.Form.onSubmit", uncleanParameterValues, args)
//   const { submit, ...cleanParameterValues } = uncleanParameterValues.data
//   onSubmit(cleanParameterValues)
// })

export const QueryForm = ({ layout, parameters, parameterValues, onSubmit }: Props) => {
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

  const foo = React.useEffect(() => {
    console.log("QueryForm.onMount")
    return () => console.log("QueryForm.onUnmount")
  }, [])

  const handleSubmit = React.useCallback(
    debounce((uncleanParameterValues: UncleanParameterValues) => {
      console.log("QueryForm.Form.onSubmit", uncleanParameterValues)
      const { submit, ...cleanParameterValues } = uncleanParameterValues.data
      onSubmit(cleanParameterValues)
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
        onSubmit={handleSubmit}
        submission={parameterValues}
      />
    )
  }

  return null
}

function recursiveIndexBy(
  items: JSONRecord[],
  keyFn: (item: JSONRecord) => string,
  recursiveKeys: string[],
  result: JSONRecord = {}
) {}
