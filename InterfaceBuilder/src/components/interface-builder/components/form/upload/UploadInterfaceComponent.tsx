import React from "react"
import { message, Spin } from "antd"
import { getOr, set } from "lodash/fp"
import { UserInterfaceProps } from "../../../UserInterface"
import { uploadManageForm } from "./upload-manage-form"
import {
  FailureEventArgs,
  PauseResumeEventArgs,
  RemovingEventArgs,
  SuccessEventArgs,
  UploaderComponent,
  UploadingEventArgs,
} from "@syncfusion/ej2-react-inputs"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"
import "./upload.module.scss"

/******************************
 * Interfaces, Types, Enums
 */

export interface UploadInterfaceComponentProps extends ComponentDefinitionNamedProps {
  /* IB Props */
  component: "upload"
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  userInterfaceSchema?: any
  valueKey: string

  /* Upload Props */
  accept: string //image/*
  acceptOther?: string
  allowMultiple: boolean
  autoUpload: boolean
  chunkSize: number
  maxFileSize: string
  removeUrl: string
  retryAfterDelay: number
  retryCount: number
  uploadUrl: string
  headers: { values: [{ paramName: string; apiKey: string }] }
  showFileList: boolean
  standaloneButton: boolean
  standaloneButtonLabel: string
  dndButtonLabel: string
}

interface UploadInterfaceComponentState {
  isUploading: boolean
}

function getAcceptType(accept: string, acceptOther: string | undefined) {
  let acceptType = accept
  if (accept === "other") {
    if (typeof acceptOther !== "undefined") {
      acceptType = acceptOther
    } else {
      acceptType = ""
    }
  }
  return acceptType
}

/******************************
 * Component
 */

export class UploadInterfaceComponent extends BaseInterfaceComponent<
  UploadInterfaceComponentProps,
  UploadInterfaceComponentState
> {
  public uploadObj: UploaderComponent | undefined
  private isInteraction: boolean
  private browseButtonLabel: string

  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "upload",
      title: "Upload",
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
    this.isInteraction = false
    this.browseButtonLabel = this.props.standaloneButton
      ? this.props.standaloneButtonLabel
      : this.props.dndButtonLabel

    this.state = {
      isUploading: false,
    }
  }

  componentDidUpdate(
    prevProps: Readonly<UploadInterfaceComponentProps>,
    prevState: Readonly<{}>
  ): void {
    if (
      this.props.standaloneButton !== prevProps.standaloneButton ||
      this.props.dndButtonLabel !== prevProps.dndButtonLabel ||
      this.props.standaloneButtonLabel !== prevProps.standaloneButtonLabel
    ) {
      this.browseButtonLabel = this.props.standaloneButton
        ? this.props.standaloneButtonLabel
        : this.props.dndButtonLabel
    }
  }

  /******************************
   * Event Handlers
   */

  /**
   * Not sure what this is doing, copied from Syncfusion example
   * @param args
   */
  onRemoveFile = (args?: RemovingEventArgs | undefined): void => {
    if (args) {
      args.postRawFile = false
    }
  }

  /**
   * Update flag variable value for automatic pause and resume
   * @param args
   */
  onPausing = (args?: PauseResumeEventArgs): void => {
    const hasEvent = !!args && args.event !== null
    this.isInteraction = hasEvent && !navigator.onLine
    this.setState({ isUploading: false })
  }

  /**
   * Update flag variable value for automatic pause and resume
   * @param args
   */
  onResuming = (args?: PauseResumeEventArgs): void => {
    const hasEvent = !!args && args.event !== null
    this.isInteraction = hasEvent && !navigator.onLine
    this.setState({ isUploading: true })
  }

  /**
   * Triggers when the AJAX request fails on uploading or removing files.
   * Prevent triggering chunk-upload failure event
   * and to pause uploading on network failure
   * @param args
   */
  onChunkFailure = (args: any): void => {
    console.warn(
      "ResumableUpload",
      "onChunkFailure!",
      "args",
      args,
      "this.uploadObj.filesData[0].statusCode",
      this.uploadObj?.filesData[0].statusCode
    )

    const isNetworkResumed = () => {
      // Note: statusCode - Returns the current state of the file
      // such as Failed, Canceled, Selected, Uploaded, or Uploading.
      const hasCode4 = this.uploadObj?.filesData[0]?.statusCode === "4"
      return navigator.onLine && hasCode4
    }

    const isNetworkOffline = () => {
      // Note: statusCode - Returns the current state of the file
      // such as Failed, Canceled, Selected, Uploaded, or Uploading.
      const hasCode3 = this.uploadObj?.filesData[0]?.statusCode === "3"
      return !this.isInteraction && hasCode3
    }

    const getCallback = () => {
      return () => {
        if (isNetworkResumed()) {
          this.uploadObj?.resume(this.uploadObj.filesData)
          // Clear Interval after when network is available.
          clearSetInterval()
          message.info("Network restored. Resuming upload.")
        } else if (isNetworkOffline()) {
          this.uploadObj?.pause(this.uploadObj.filesData)
          message.warn("Network has gone offline. Upload will resume when you reconnect.")
        }
      }
    }

    args.cancel = !this.isInteraction
    // Check network availability every 500 milliseconds
    let clearTimeInterval = setInterval(getCallback(), 500)

    const clearSetInterval = () => {
      clearInterval(clearTimeInterval)
    }
  }

  /**
   * Pause upload and notify user
   * @param args
   */
  onFailure = (args?: {}) => {
    const failureEventArgs = args as FailureEventArgs
    this.uploadObj?.pause(this.uploadObj.filesData)
    this.setState({ isUploading: false })

    console.warn("Upload", "onFailure!", "args", failureEventArgs, "this.uploadObj", this.uploadObj)
    message.warn(
      "Something is wrong with the network. Upload will resume when the network is restored."
    )
  }

  /**
   * Save data and notify user. Fires on upload success or remove success.
   * @param args
   */
  onSuccess = (args?: any) => {
    const successEventArgs = args as SuccessEventArgs
    const { onChangeData, userInterfaceData, valueKey } = this.props
    this.setState({ isUploading: false })

    if (successEventArgs?.operation === "upload") {
      // File was uploaded
      onChangeData &&
        onChangeData(set(valueKey, this.uploadObj && this.uploadObj.filesData, userInterfaceData))
      message.success("Upload completed")
    } else if (successEventArgs?.operation === "remove") {
      // File was removed
      onChangeData && onChangeData(set(valueKey, null, userInterfaceData))
      message.success("Upload deleted from the server")
    }
  }

  /**
   * Add custom request headers to upload
   * @param args
   */
  onUploading = (args?: UploadingEventArgs) => {
    const { onChangeData, userInterfaceData, valueKey, headers } = this.props
    this.setState({ isUploading: true })

    // Exit if no headers to add
    if (headers.values.length < 1) {
      return
    }
    // Add custom request headers
    const currentRequest = args && args.currentRequest
    headers.values.map((header) => {
      const value = getOr(null, header.apiKey, userInterfaceData) as string
      currentRequest?.setRequestHeader(header.paramName, value)
    })
  }

  /**
   * Configure appearance
   */
  onCreated = (): void => {
    if (this.props.standaloneButton && this.uploadObj) {
      this.uploadObj.dropArea = ""
    }
  }

  render(): JSX.Element {
    const {
      /* IB Props */
      defaultValue,
      userInterfaceData,
      valueKey,
      label,

      /* Upload Props */
      accept,
      acceptOther,
      allowMultiple,
      autoUpload,
      chunkSize,
      maxFileSize,
      removeUrl,
      retryAfterDelay,
      retryCount,
      uploadUrl,
      showFileList,
      standaloneButton,
      dndButtonLabel,
      standaloneButtonLabel,
    } = this.props

    const acceptType = getAcceptType(accept, acceptOther)

    return (
      <div className={standaloneButton ? "hideDropArea" : ""}>
        <span>{acceptType && `Accepts ${acceptType} files only.`}</span>
        <Spin spinning={this.state.isUploading && !showFileList}>
          <UploaderComponent
            id="chunkUpload"
            type="file"
            ref={(scope) => {
              if (scope) {
                this.uploadObj = scope
              }
            }}
            /*
             * Upload Props */
            allowedExtensions={acceptType}
            asyncSettings={{
              saveUrl: uploadUrl,
              removeUrl,
              chunkSize,
              retryCount,
              retryAfterDelay,
            }}
            autoUpload={autoUpload}
            multiple={allowMultiple}
            maxFileSize={parseInt(maxFileSize)}
            /*
             * Appearance */
            showFileList={showFileList}
            buttons={{
              browse: standaloneButton ? standaloneButtonLabel : dndButtonLabel,
            }}
            /*
             * Events */
            removing={this.onRemoveFile}
            pausing={this.onPausing}
            resuming={this.onResuming}
            chunkFailure={this.onChunkFailure}
            failure={this.onFailure}
            success={this.onSuccess}
            uploading={this.onUploading}
            created={this.onCreated}
          />
        </Spin>
      </div>
    )
  }
}
