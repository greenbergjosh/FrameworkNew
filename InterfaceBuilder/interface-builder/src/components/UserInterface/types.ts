import { DraggedItemProps, DropHelperResult } from "../../components/DragAndDrop"

export interface UserInterfaceState extends DropHelperResult {
  clipboardComponent: null | DraggedItemProps
  error: null | string
  fullscreen: boolean
}
