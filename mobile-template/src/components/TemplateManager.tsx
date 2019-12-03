import {
  Divider,
  Form,
  Icon,
  Input,
  Popover
  } from "antd"
import classNames from "classnames"
import qs from "query-string"
import React from "react"
import ReactDOM from "react-dom"
import ReactPlayer from "react-player"
import validURL from "valid-url"
import { GetGotService } from "../services/getgot-service"
const DEFAULT_TEMPLATE = require("../mock-data/default.template.html")

interface QueryParameters {
  debugMode?: string
  editable?: string
  templateId?: string
  randomSeed?: string
}

interface TemplateManagerProps {
  getgotService: typeof GetGotService
}

export const TemplateManager = ({ getgotService }: TemplateManagerProps) => {
  const queryParameters = (qs.parse(window.location.search) || {}) as QueryParameters
  const debugMode = queryParameters.debugMode === "true"
  const editable = queryParameters.editable !== "false"

  const [template, setTemplate] = React.useState(DEFAULT_TEMPLATE)

  const [dataState, setDataState] = React.useState({} as {
    [key: string]: string
  })
  const wrapperRef = React.useRef() as React.RefObject<HTMLDivElement>

  const onClickPhotoSpot = React.useCallback((dataValueKey) => {
    getgotService && getgotService.selectPhoto(dataValueKey)
  }, [])

  const onClickHTMLTextElement = React.useCallback(
    (e: Event) => {
      let element = e.target as HTMLElement

      while (element.parentElement && !element.getAttribute("data-value-key")) {
        element = element.parentElement
      }
      const dataValueKey = element.getAttribute("data-value-key")

      getgotService && getgotService.editText(dataValueKey)
    },
    [getgotService]
  )

  const loadedPhoto = React.useCallback(
    (photoBase64: string, key: string = "photo") => {
      setDataState({ ...dataState, [key]: photoBase64 })
    },
    [dataState]
  )

  const editedText = React.useCallback(
    (text: string, key: string = "message") => {
      setDataState({ ...dataState, [key]: text })
    },
    [dataState]
  )

  const setTokenValues = React.useCallback(
    (tokenValues: { [key: string]: string }) => {
      setDataState({ ...dataState, ...tokenValues })
    },
    [dataState]
  )

  React.useEffect(() => {
    window.editedText = editedText
    window.loadedPhoto = loadedPhoto
    window.setTemplate = setTemplate
    window.setTokenValues = setTokenValues
  }, [editedText, loadedPhoto, setTemplate, setTokenValues])

  React.useEffect(() => {
    if (wrapperRef && wrapperRef.current) {
      const photoElements = wrapperRef.current.getElementsByClassName("add-photo")
      Array.from(photoElements).forEach((element: Element) => {
        // Clean out the add button and any existing images
        const photoIcons = element.getElementsByClassName("add-photo-icon")
        const loadedImages = element.getElementsByClassName("loaded-image-wrapper")
        Array.from(photoIcons)
          .concat(Array.from(loadedImages))
          .forEach((removeableElement: Element) => {
            removeableElement.parentElement &&
              removeableElement.parentElement.removeChild(removeableElement)
          })

        const elementValueKey = element.getAttribute("data-value-key")
        const elementValue = elementValueKey && dataState[elementValueKey]

        // If there's a picture for this spot
        if (elementValue) {
          // Add the style to the container
          if (element.className.indexOf("-filled") < 0) {
            element.className += " -filled"
          }

          const loadedImageWrapper = document.createElement("div")
          loadedImageWrapper.className = "loaded-image-wrapper"
          element.appendChild(loadedImageWrapper)

          ReactDOM.render(
            <>
              {// If it's a URI, it's a video
              validURL.isWebUri(elementValue) ? (
                <ReactPlayer url={elementValue} light controls />
              ) : (
                <img className="loaded-image" src={fixDataImageEncoding(elementValue)} />
              )}
              {editable && (
                <Popover
                  content={
                    <div className="loaded-video">
                      <a
                        className="leftLink"
                        onClick={() => {
                          onClickPhotoSpot(elementValueKey)
                        }}>
                        Different Photo
                      </a>
                      <SelectVideoPopover
                        url={elementValue}
                        linkText="Different Video"
                        onSelectVideo={(url) => {
                          if (elementValueKey) {
                            setDataState({ ...dataState, [elementValueKey]: url })
                          }

                          getgotService.selectVideo(elementValueKey || "video", url)
                        }}
                      />
                      <a
                        className="rightLink ant-btn-danger ant-btn-background-ghost"
                        onClick={() => {
                          elementValueKey && setDataState({ ...dataState, [elementValueKey]: "" })
                        }}>
                        Remove
                      </a>
                    </div>
                  }
                  title="Replace Photo or Video, or Clear Selection"
                  trigger="click">
                  <a className="change-link">Change or Remove</a>
                </Popover>
              )}
            </>,
            loadedImageWrapper
          )
        } else {
          // Else if there is no loaded image for this spot
          const iconDiv = document.createElement("div")
          iconDiv.className = "add-photo-icon -blank"
          element.appendChild(iconDiv)
          if (editable) {
            ReactDOM.render(
              <Popover
                content={
                  <>
                    <a
                      className="leftLink"
                      onClick={() => {
                        onClickPhotoSpot(elementValueKey)
                      }}>
                      Select or Take Photo
                    </a>
                    <SelectVideoPopover
                      url={elementValue}
                      onSelectVideo={(url) => {
                        if (elementValueKey) {
                          setDataState({ ...dataState, [elementValueKey]: url })
                        }
                        getgotService.selectVideo(elementValueKey || "video", url)
                      }}
                    />
                  </>
                }
                title="Choose a Photo or Link a Video"
                trigger="click">
                <div className="add-photo-icon-inner">
                  <Icon type="camera" theme="filled" /> <span>Add Photo or Video</span>
                </div>
              </Popover>,
              iconDiv
            )
          } else {
            iconDiv.className += " -unfilled"
          }
        }
      })
    }
  }, [wrapperRef, dataState, template])

  React.useEffect(() => {
    if (wrapperRef && wrapperRef.current) {
      const textElements = wrapperRef.current.getElementsByClassName("add-text")
      Array.from(textElements).forEach((element: Element) => {
        const elementValueKey = element.getAttribute("data-value-key")
        const elementValue = elementValueKey && dataState[elementValueKey]

        const addMessageDiv = document.createElement("div")
        addMessageDiv.className = classNames("add-text-inner", { "-blank": !elementValue })
        element.appendChild(addMessageDiv)
        if (editable) {
          element.addEventListener("click", onClickHTMLTextElement)
          ReactDOM.render(
            <span>
              {elementValue ? (
                <>
                  <Icon type="edit" /> {elementValue}
                </>
              ) : (
                "Add Message"
              )}
            </span>,
            addMessageDiv
          )
        } else {
          addMessageDiv.className += " -unfilled"
        }
      })
    }

    return () => {
      if (wrapperRef && wrapperRef.current) {
        const textElements = wrapperRef.current.getElementsByClassName("add-text")
        Array.from(textElements).forEach((element: Element) => {
          element.removeEventListener("click", onClickHTMLTextElement)

          const textInnerElements = element.getElementsByClassName("add-text-inner")
          Array.from(textInnerElements).forEach((innerElement: Element) => {
            element.removeChild(innerElement)
          })
        })
      }
    }
  }, [wrapperRef, dataState, template])

  return (
    <>
      <div ref={wrapperRef}>
        <div dangerouslySetInnerHTML={{ __html: template }} />
      </div>
      {debugMode && (
        <pre>
          Raw Query Parameters:
          {JSON.stringify(queryParameters, null, 2)}
          {`
          
          `}
          Data State:
          {JSON.stringify(
            dataState,
            (k, v) => {
              if (typeof v === "string" && v.length > 1000) {
                return v.substr(0, 1000) + "...(value truncated to 1000 characters"
              }

              return v
            },
            2
          )}
        </pre>
      )}
    </>
  )
}

interface SelectVideoPopoverProps {
  linkText?: string
  url: string | null
  onSelectVideo: (url: string) => void
}

const SelectVideoPopover = ({
  linkText = "Select Video",
  url,
  onSelectVideo,
}: SelectVideoPopoverProps) => {
  const [popoverVisible, setPopoverVisible] = React.useState(false)
  const [videoURL, setVideoURL] = React.useState(url || "")

  const urlIsValid = validURL.isWebUri(videoURL)
  const validateStatus = videoURL && urlIsValid ? "success" : videoURL && !urlIsValid ? "error" : ""
  return (
    <Popover
      content={
        <>
          <Form.Item
            label="URL"
            validateStatus={validateStatus}
            help={validateStatus === "error" && "That doesn't appear to be a valid URL"}
            hasFeedback={!!validateStatus}>
            <Input
              onChange={(event) => {
                setVideoURL(event.target.value)
              }}
              onPressEnter={(event) => {
                setVideoURL((event.target as EventTarget & HTMLInputElement).value)
              }}
              placeholder="Enter or Paste a Video URL"
            />
          </Form.Item>

          <Divider />
          <div className="popup-player-wrapper">
            <ReactPlayer
              className="popup-react-player"
              url={videoURL}
              light
              controls
              width="100%"
              height="100%"
            />
          </div>
          <Divider />
          <div className="footer-options">
            <h4>Use this video?</h4>
            <div>
              <a
                className="leftLink ant-btn-danger ant-btn-background-ghost"
                onClick={() => setPopoverVisible(false)}>
                Cancel and do not use this video.
              </a>
              <a
                className={classNames("rightLink ant-btn-primary ant-btn-background-ghost", {
                  disabled: !videoURL,
                })}
                onClick={() => {
                  if (videoURL) {
                    onSelectVideo(videoURL)
                    setPopoverVisible(false)
                  }
                }}>
                Yes, use this video!
              </a>
            </div>
          </div>
        </>
      }
      title="Enter a video URL"
      trigger="click"
      visible={popoverVisible}
      onVisibleChange={setPopoverVisible}>
      <a className="rightLink">{linkText}</a>
    </Popover>
  )
}

// If something has damaged the encoding, we can try to fix it
const fixDataImageEncoding = (base64Image: string) =>
  base64Image.startsWith("data:image")
    ? base64Image
    : base64Image[0] === "i"
    ? `data:image/png;base64,${base64Image}`
    : base64Image[0] === "R"
    ? `data:image/gif;base64,${base64Image}`
    : base64Image[0] === "/"
    ? `data:image/jpg;base64,${base64Image}`
    : base64Image
