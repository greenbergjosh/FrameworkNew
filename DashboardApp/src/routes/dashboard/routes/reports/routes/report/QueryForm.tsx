import React from "react"
import { QueryConfig } from "../../../../../../data/Report"
import { Form } from "react-formio"
import { constTrue } from "fp-ts/lib/function"
import { JSONRecord, JSONRecordCodec } from "../../../../../../data/JSON"
import { useRematch } from "../../../../../../hooks"
import { generators, generateLayoutFromParameters } from "./generators"

interface Props {
  layout: QueryConfig["layout"]
  parameters: QueryConfig["parameters"]
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

export const QueryForm = ({ parameters, layout, onSubmit }: Props) => {
  const [fromStore, dispatch] = useRematch((s) => null)
  const realLayout = layout.length
    ? layout
    : parameters.length
    ? generateLayoutFromParameters(parameters)
    : null

  if (realLayout) {
    return (
      <Form
        form={generateFormFromLayout(realLayout)}
        onSubmit={(uncleanParameterValues: UncleanParameterValues) => {
          const { submit, ...cleanParameterValues } = uncleanParameterValues.data
          onSubmit(cleanParameterValues)
        }}
      />
    )
  }

  return null
}
