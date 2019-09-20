import React from "react"
import {
  modes,
  SelectInterfaceComponentProps,
  SelectInterfaceComponent as SharedSelectInterfaceComponent
} from "../_shared/select"
import { tagsManageForm } from "./tags-manage-form"
import { Select } from "antd"


export interface TagsInterfaceComponentProps {
  maxTagCount?: number | undefined
  maxTagTextLength?: number | undefined
  maxTagPlaceholder?: number | undefined
}

export class TagsInterfaceComponent extends SharedSelectInterfaceComponent {

  static manageForm = tagsManageForm

  constructor(props: SelectInterfaceComponentProps) {
    super(props, modes.tags)
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "tags",
      title: "Tags",
      icon: "tags",
      formControl: true,
      componentDefinition: {
        component: "tags",
        label: "Tags",
      },
    }
  }

  render(): JSX.Element {
    const {
      allowClear,
      allowCreateNew,
      createNewLabel,
      disabled,
      multiple,
      placeholder,
      // maxTagCount,
      // maxTagTextLength,
      // maxTagPlaceholder,
    } = this.props
    const { loadStatus, options } = this.state

    const value = this.getCleanValue()

    let mode = this.mode;
    if (mode !== modes.tags) {
      mode = multiple ? modes.multiple : modes.default
    }

    return (
      <Select
        key={value && value.toString()}
        allowClear={allowClear}
        defaultValue={value}
        disabled={disabled}
        filterOption={(input: any, option: any) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        loading={loadStatus === "loading"}
        mode={mode}
        onChange={this.handleChange}
        optionFilterProp="label"
        placeholder={placeholder}
        showSearch
        // maxTagCount={maxTagCount}
        // maxTagTextLength={maxTagTextLength}
        // maxTagPlaceholder={maxTagPlaceholder}
      >
        {options.map((option) => (
          <Select.Option key={`${option.value}`} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
        {allowCreateNew && (
          <Select.Option key={`create_new_entry`} value={"create_new"}>
            {createNewLabel}
          </Select.Option>
        )}
      </Select>
    )
  }
}
