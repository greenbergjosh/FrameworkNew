import { Select } from "antd"
import React from "react"
import { selectManageForm } from "./select-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentRenderMetaProps,
} from "../../base/BaseInterfaceComponent"

interface SelectOption {
  label: string
  value: string
}
export interface ISelectInterfaceComponentProps extends ComponentDefinitionNamedProps {
  allowClear: boolean
  component: "select"
  defaultValue?: string
  multiple?: boolean
  placeholder: string
  valueKey: string
  value: string

  dataHandlerType: "local" | "remote"
  data: {}
}

interface SelectInterfaceComponentPropsLocalData extends ISelectInterfaceComponentProps {
  dataHandlerType: "local"
  data: {
    values: SelectOption[]
  }
}

interface SelectInterfaceComponentPropsRemoteData extends ISelectInterfaceComponentProps {
  dataHandlerType: "remote"
  data: {
    source: {}
  }
}

export type SelectInterfaceComponentProps = (
  | SelectInterfaceComponentPropsLocalData
  | SelectInterfaceComponentPropsRemoteData) &
  ComponentRenderMetaProps

interface SelectInterfaceComponentState {
  loadError: string | null
  loadStatus: "none" | "loading" | "loaded" | "error"
  options: SelectOption[]
  value: string
}

export class SelectInterfaceComponent extends BaseInterfaceComponent<
  SelectInterfaceComponentProps,
  SelectInterfaceComponentState
> {
  static defaultProps = {
    allowClear: true,
    valueKey: "value",
    defaultValue: "",
    placeholder: "Choose one",
  }

  static getLayoutDefinition() {
    return {
      name: "select",
      title: "Select",
      icon: "bars",
      formControl: true,
      componentDefinition: {
        component: "select",
        label: "Select",
      },
    }
  }

  static manageForm = selectManageForm

  // static getDerivedStateFromProps(props: SelectInterfaceComponentProps, state: SelectInterfaceComponentState) {
  //   // Any time the current user changes,
  //   // Reset any parts of state that are tied to that user.
  //   // In this simple example, that's just the email.
  //   if (state.options.length && !state.loading && !state.loaded) {
  //     return {
  //       prevPropsUserID: props.userID,
  //       email: props.defaultEmail,
  //     }
  //   }
  //   return null
  // }

  constructor(props: SelectInterfaceComponentProps) {
    super(props)

    this.state = {
      loadError: null,
      loadStatus: "none",
      options: [],
      value: this.props.value || this.props.defaultValue || "",
    }
  }

  static getDerivedStateFromProps(
    props: SelectInterfaceComponentProps,
    state: SelectInterfaceComponentState
  ) {
    if (state.loadStatus === "none") {
      switch (props.dataHandlerType) {
        case "local": {
          return { options: props.data.values, loadStatus: "loaded" }
        }
        case "remote": {
          return { loadStatus: "loading" }
          // TODO: Use remote data layer provided by context
          // Invoke fetch
          // Parse and set options into state
        }
      }
    }
    return null
  }

  handleChange = (value: string) => {
    const { onDataChanged, valueKey } = this.props
    this.setState({ value })
    onDataChanged && onDataChanged({ [valueKey]: value })
  }

  resolveOptions = () => {}

  render(): JSX.Element {
    const { allowClear, multiple, placeholder } = this.props
    const { loadStatus, options, value } = this.state

    return (
      <Select
        allowClear={allowClear}
        defaultValue={value}
        loading={loadStatus === "loading"}
        mode={multiple ? "multiple" : "default"}
        onChange={this.handleChange}
        placeholder={placeholder}
        showSearch>
        {options.map((option) => (
          <Select.Option key={`${option.value}`} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    )
  }
}
