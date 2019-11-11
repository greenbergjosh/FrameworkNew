import {
  Button,
  Form,
  Icon,
  message,
  Upload
  } from "antd"
import { HttpRequestHeader, UploadChangeParam, UploadFile } from "antd/lib/upload/interface"
import { get, set, throttle } from "lodash/fp"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { uploadManageForm } from "./upload-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

export interface UploadInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "upload"
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  hideButtonLabel?: boolean
  uploadUrl: string
  accept: string
  acceptOther?: string
  buttonLabel: string
  headers: HttpRequestHeader
  editHeaders: boolean
}

interface UploadInterfaceComponentState {}

export class UploadInterfaceComponent extends BaseInterfaceComponent<
  UploadInterfaceComponentProps
> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "upload",
      title: "File Upload",
      icon: "upload",
      formControl: true,
      componentDefinition: {
        component: "upload",
        label: "Upload",
      },
    }
  }

  static manageForm = uploadManageForm

  constructor(props: UploadInterfaceComponentProps) {
    super(props)
  }

  handleChange = (info: UploadChangeParam<UploadFile>) => {
    const { status } = info.file
    if (status !== "uploading") {
      console.log(info.file, info.fileList)
    }
    if (status === "done") {
      const { onChangeData, userInterfaceData, valueKey } = this.props
      onChangeData && onChangeData(set(valueKey, info.file, userInterfaceData))
      message.success(`${info.file.name} file uploaded successfully.`)
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`)
    }
  }

  getHeaders = () => {
    const { editHeaders, headers } = this.props
    if (editHeaders && typeof headers !== "undefined") {
      return headers
    }
    return {
      authorization: "authorization-text",
    }
  }

  render(): JSX.Element {
    const {
      defaultValue,
      userInterfaceData,
      valueKey,
      label,
      hideButtonLabel,
      uploadUrl,
      accept,
      acceptOther,
      buttonLabel,
    } = this.props

    let acceptType = accept
    if (accept === "other") {
      if (typeof acceptOther !== "undefined") {
        acceptType = acceptOther
      } else {
        acceptType = "*"
      }
    }

    return (
      <Upload
        action={uploadUrl}
        accept={acceptType}
        headers={this.getHeaders()}
        onChange={this.handleChange}>
        <Button>
          <Icon type="upload" />
          {hideButtonLabel ? null : ` ${buttonLabel}`}
        </Button>
      </Upload>
    )
  }
}
