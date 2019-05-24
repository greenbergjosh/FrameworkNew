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
  _context: { randomStuff: true },
  components: Object.values(flattenComponents(layout)).find(({ type }: any) =>
    ["button", "submit"].includes(type.toLowerCase())
  )
    ? layout
    : layout.concat(generatedSubmitButton),
})

export const QueryForm = React.memo(({ layout, parameters, parameterValues, onSubmit }: Props) => {
  const [fromStore, dispatch] = useRematch((s) => null)

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

  //: {[key: string]: string | boolean | number}
  if (realLayout) {
    const defaultParameters = parameters.reduce(
      (acc, parameter) => {
        if (parameter.defaultValue.isSome()) {
          acc[parameter.name] = parameter.defaultValue.toUndefined()
        }

        return acc
      },
      {} as any
    )

    return (
      <Form
        form={generateFormFromLayout(realLayout)}
        submission={{ data: { ...defaultParameters, ...parameterValues } }}
        onSubmit={handleSubmit}
        options={{ reactContext: { test: "Hello" } }}
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
