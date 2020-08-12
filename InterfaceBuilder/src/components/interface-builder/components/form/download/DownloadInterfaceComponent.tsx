import { Button, message, Tooltip } from "antd"
import { get } from "lodash/fp"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { buttonDisplayType, downloadManageForm, shapeType, sizeType } from "./download-manage-form"
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent"
import fileDownload from "js-file-download"

export interface DownloadInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "button"
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  paramsValueKey: string
  url: string
  httpMethod: "GET" | "POST"
  useFilenameFromServer: boolean
  filename: string
  buttonLabel: string
  icon: string
  hideButtonLabel: boolean
  shape: shapeType
  size: sizeType
  displayType: buttonDisplayType
  block: boolean
  ghost: boolean
}

interface DownloadInterfaceComponentState {
  isDownloading: boolean
}

export class DownloadInterfaceComponent extends BaseInterfaceComponent<
  DownloadInterfaceComponentProps,
  DownloadInterfaceComponentState
> {
  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "download",
      title: "Download",
      icon: "download",
      formControl: true,
      componentDefinition: {
        component: "download",
      },
    }
  }

  static manageForm = downloadManageForm

  constructor(props: DownloadInterfaceComponentProps) {
    super(props)

    this.state = {
      isDownloading: false,
    }
  }

  handleClick = ({ target }: React.MouseEvent<HTMLInputElement>) => {
    const {
      onChangeData,
      userInterfaceData,
      paramsValueKey,
      url,
      httpMethod,
      useFilenameFromServer,
      filename,
    } = this.props
    const params = get(paramsValueKey, userInterfaceData) || {}
    const config = {
      method: httpMethod,
      body: httpMethod !== "GET" && Object.keys(params).length > 0 ? JSON.stringify(params) : {},
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
      defaultValue,
      userInterfaceData,
      paramsValueKey,
      buttonLabel,
      icon,
      hideButtonLabel,
      shape,
      size,
      displayType,
      block,
      ghost,
    } = this.props
    const isCircle = shape === "circle" || shape === "circle-outline"
    const buttonShape = displayType !== "link" ? shape : undefined
    const rawValue = get(paramsValueKey, userInterfaceData)
    const value = typeof rawValue !== "undefined" ? rawValue : defaultValue

    return (
      <Tooltip title={hideButtonLabel || isCircle ? buttonLabel : null}>
        <Button
          onClick={this.handleClick}
          loading={this.state.isDownloading}
          value={value}
          icon={icon}
          shape={buttonShape}
          size={size}
          type={displayType}
          block={block}
          ghost={ghost}>
          {!hideButtonLabel && !isCircle ? buttonLabel : null}
        </Button>
      </Tooltip>
    )
  }
}

/***********************************
 * Private Functions
 */

async function postData(url = "", params = {}, configOverrides = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *client
    body: "", // body data type must match "Content-Type" header
    ...configOverrides,
  })
  const data = await response.blob()
  return {
    headers: response.headers,
    data,
  }
}

function getFilename(useFilenameFromServer: boolean, response: { headers: Headers; data: Blob }, filename: string) {
  const filenameFixed = useFilenameFromServer ? getFilenameFromHeaders(response.headers, filename) : filename
  return filenameFixed
}

function getFilenameFromHeaders(headers: Headers, defaultFilename: string) {
  let filename = ""
  const disposition = headers.get("content-disposition")
  if (disposition && disposition.indexOf("attachment") !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    const matches = filenameRegex.exec(disposition)
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, "")
    }
  }
  const fixedDefaultFilename = defaultFilename && defaultFilename.length > 0 ? defaultFilename : "download"
  return filename && filename.length > 0 && filename.indexOf(".") > -1 ? filename : fixedDefaultFilename
}
