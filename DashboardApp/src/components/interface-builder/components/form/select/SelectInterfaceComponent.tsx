import React from "react"
import {
  modes,
  SelectInterfaceComponentProps,
  SelectInterfaceComponent as SharedSelectInterfaceComponent
} from "../_shared/select"
import { selectManageForm } from "./select-manage-form"


export class SelectInterfaceComponent extends SharedSelectInterfaceComponent {

  static manageForm = selectManageForm

  constructor(props: SelectInterfaceComponentProps) {
    super(props, modes.default)
  }
}
