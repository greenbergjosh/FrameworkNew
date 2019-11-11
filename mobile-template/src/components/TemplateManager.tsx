import {
  Divider,
  Form,
  Icon,
  Input,
  Popover
  } from "antd"
import classNames from "classnames"
import React from "react"
import ReactDOM from "react-dom"
import ReactPlayer from "react-player"
import validURL from "valid-url"
import { GetGotService } from "../services/getgot-service"
const DEFAULT_TEMPLATE = require("../mock-data/default.template.html")

interface TemplateManagerProps {
  getgotService: typeof GetGotService
}

export const TemplateManager = ({ getgotService }: TemplateManagerProps) => {
  const [template, setTemplate] = React.useState(DEFAULT_TEMPLATE)
  React.useEffect(() => {
    // @ts-ignore We're going to forcibly set this onto the window
    window.setTemplate = setTemplate
  }, [setTemplate])
  const [dataState, setDataState] = React.useState({} as {
    [key: string]: string
  })
  const wrapperRef = React.useRef() as React.RefObject<HTMLDivElement>

  const onClickHTMLPhotoElement = React.useCallback((e: Event) => {
    let element = e.target as HTMLElement

    while (element.parentElement && !element.getAttribute("data-value-key")) {
      element = element.parentElement
    }
    const dataValueKey = element.getAttribute("data-value-key")

    console.log("Click Photo Spot", dataValueKey, element)
    getgotService && getgotService.selectPhoto(dataValueKey)
  }, [])

  const onClickPhotoSpot = React.useCallback((dataValueKey) => {
    console.log("Click Photo Spot", dataValueKey)
    getgotService && getgotService.selectPhoto(dataValueKey)
  }, [])

  const onClickHTMLTextElement = React.useCallback(
    (e: Event) => {
      let element = e.target as HTMLElement

      while (element.parentElement && !element.getAttribute("data-value-key")) {
        element = element.parentElement
      }
      const dataValueKey = element.getAttribute("data-value-key")

      console.log("Click Text Spot", dataValueKey, element)
      getgotService && getgotService.editText(dataValueKey)
    },
    [getgotService]
  )

  const loadedPhoto = React.useCallback(
    (photoBase64: string, key: string = "photo") => {
      console.debug("Callback: loadedPhoto", { photoBase64, key })
      setDataState({ ...dataState, [key]: photoBase64 })
    },
    [dataState]
  )

  const editedText = React.useCallback(
    (text: string, key: string = "message") => {
      console.debug("Callback: editedText", { text, key })
      console.debug("Spreading existing dataState", dataState, "and adding", { [key]: text })
      setDataState({ ...dataState, [key]: text })
    },
    [dataState]
  )

  React.useEffect(() => {
    window.loadedPhoto = loadedPhoto
    window.editedText = editedText
  }, [loadedPhoto, editedText])

  React.useEffect(() => {
    if (wrapperRef && wrapperRef.current) {
      const photoElements = wrapperRef.current.getElementsByClassName("add-photo")
      console.log("Photo Spots", photoElements)
      Array.from(photoElements).forEach((element: Element) => {
        console.log("Photo Spot", element)

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
                <img className="loaded-image" src={`data:image/png;base64, ${elementValue}`} />
              )}
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
                      onSelectVideo={(url) =>
                        elementValueKey && setDataState({ ...dataState, [elementValueKey]: url })
                      }
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
            </>,
            loadedImageWrapper
          )
        } else {
          // Else if there is no loaded image for this spot
          const iconDiv = document.createElement("div")
          iconDiv.className = "add-photo-icon"
          element.appendChild(iconDiv)
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
                    onSelectVideo={(url) =>
                      elementValueKey && setDataState({ ...dataState, [elementValueKey]: url })
                    }
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
        }
      })
    }

    return () => {
      if (wrapperRef && wrapperRef.current) {
        const photoElements = wrapperRef.current.getElementsByClassName("add-photo")
        console.debug("Photo Spots (Remove)", photoElements)
        Array.from(photoElements).forEach((element: Element) => {
          element.removeEventListener("click", onClickHTMLPhotoElement)
        })
      }
    }
  }, [wrapperRef, dataState, template])

  React.useEffect(() => {
    if (wrapperRef && wrapperRef.current) {
      const textElements = wrapperRef.current.getElementsByClassName("add-text")
      console.debug("Text Spots", textElements)
      Array.from(textElements).forEach((element: Element) => {
        const elementValueKey = element.getAttribute("data-value-key")
        const elementValue = elementValueKey && dataState[elementValueKey]
        console.debug("Text Spot", element, "Value: ", elementValue)

        element.addEventListener("click", onClickHTMLTextElement)
        const addMessageDiv = document.createElement("div")
        addMessageDiv.className = classNames("add-text-inner", { "-blank": !elementValue })
        element.appendChild(addMessageDiv)
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
      })
    }

    return () => {
      if (wrapperRef && wrapperRef.current) {
        const textElements = wrapperRef.current.getElementsByClassName("add-text")
        console.log("Text Spots (Remove)", textElements)
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
    <div ref={wrapperRef}>
      <div dangerouslySetInnerHTML={{ __html: template }} />
    </div>
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
