import { SelectableOption } from "./Selectable.interfaces"
import { SelectableProps, LoadStatusType } from "./Selectable.types"

export interface SelectableChildProps {
  // allowClear: boolean
  allowCreateNew?: boolean
  createNewLabel: string
  disabled?: boolean
  // placeholder: string

  getCleanValue: () => string | string[] | undefined
  loadError: string | null
  loadStatus: LoadStatusType
  options: SelectableOption[]
}

// export type SelectableChildProps = ISelectableChildProps & SelectableProps
