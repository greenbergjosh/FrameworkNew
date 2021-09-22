import fileDownload from "js-file-download"
import React from "react"
import { BaseInterfaceComponent, LayoutDefinition } from "@opg/interface-builder"
import { Button, message, Tooltip } from "antd"
import { convertParamKVPMapsToParams, getFilename, postData } from "./utils"
import { DownloadInterfaceComponentProps, DownloadInterfaceComponentState } from "./types"
import { downloadManageForm } from "./download-manage-form"
import layoutDefinition from "./layoutDefinition"

export default class DownloadInterfaceComponent extends BaseInterfaceComponent<
  DownloadInterfaceComponentProps,
  DownloadInterfaceComponentState
> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = downloadManageForm

  constructor(props: DownloadInterfaceComponentProps) {
    super(props)

    this.state = {
      isDownloading: false,
    }
  }

  handleClick = (/*e: React.MouseEvent<HTMLInputElement>*/) => {
    const { filename, httpMethod, paramKVPMaps, paramsValueKey, url, useFilenameFromServer } = this.props
    const params = convertParamKVPMapsToParams(paramKVPMaps, this.getValue.bind(this), paramsValueKey)
    const config: Partial<RequestInit> = {
      method: httpMethod,
    }

    // Exclude body for GET requests. "TypeError: Request with GET/HEAD method cannot have body."
    if (httpMethod !== "GET") {
      // NOTE: body data type must match "Content-Type" header
      config.body = Object.keys(params).length > 0 ? JSON.stringify(params) : null
    }

    /*
     * Fetch file data from the server
     * and then trigger a download on the client
     */
    this.setState({ isDownloading: true })
    postData(url, params, config)
      .then((response) => {
        // Success! We have file data. Now trigger browser to save it to a file.
        const filenameFixed = getFilename(useFilenameFromServer, response, filename)
        fileDownload(response.data, filenameFixed)
      })
      .catch(() => {
        message.error("There was an error downloading the file.")
      })
      .finally(() => this.setState({ isDownloading: false }))
  }

  render(): JSX.Element {
    const {
      block,
      buttonLabel,
      defaultValue,
      displayType,
      ghost,
      hideButtonLabel,
      icon,
      paramsValueKey,
      shape,
      size,
    } = this.props
    const isCircle = shape === "circle" || shape === "circle-outline"
    const buttonShape = displayType !== "link" ? shape : undefined
    const rawValue = this.getValue(paramsValueKey)
    const value = typeof rawValue !== "undefined" ? rawValue : defaultValue

    return (
      <Tooltip title={hideButtonLabel || isCircle ? buttonLabel : null}>
        <Button
          block={block}
          ghost={ghost}
          icon={icon}
          loading={this.state.isDownloading}
          onClick={this.handleClick}
          shape={buttonShape}
          size={size}
          type={displayType}
          value={value}>
          {!hideButtonLabel && !isCircle ? buttonLabel : null}
        </Button>
      </Tooltip>
    )
  }
}
