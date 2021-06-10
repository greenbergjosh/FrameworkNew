import { JSONRecord } from "globalTypes/JSONTypes"

export type JSONEditorProps = {
  data: JSONRecord | JSONRecord[] | undefined
  /*
   * Disable ban on use of "object" because
   * that is the type "react-json-view" emits.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  onChange: (data: object) => void
  height?: number | string
  collapsed?: boolean
  displayDataTypes?: boolean
}
