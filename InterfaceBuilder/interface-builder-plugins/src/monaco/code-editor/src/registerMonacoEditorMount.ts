import { GetCustomEditorWillMount } from "./types"

export let _getCustomEditorWillMount: GetCustomEditorWillMount | undefined

export const registerMonacoEditorMount = (getCustomEditorWillMount?: GetCustomEditorWillMount): void => {
  _getCustomEditorWillMount = getCustomEditorWillMount
}
