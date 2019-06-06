import baseEditForm from "../base.form"
import SelectEditData from "./select.form.data"

export default function(...extend) {
  return baseEditForm(
    [
      {
        key: "data",
        components: SelectEditData,
      },
    ],
    ...extend
  )
}
