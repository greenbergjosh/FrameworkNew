import { GetCustomEditorWillMount } from "./types"

export let _registerMonacoEditorMount: GetCustomEditorWillMount

export const registerMonacoEditorMount = (getCustomEditorWillMount: GetCustomEditorWillMount): void => {
  _registerMonacoEditorMount = getCustomEditorWillMount
}
