import { Divider, Icon } from "antd"
import React, { SyntheticEvent } from "react"
import ReactDOM from "react-dom"
const DEFAULT_TEMPLATE = require("../mock-data/default.template.html")

interface TemplateManagerProps {
  getgotInterface: typeof window.GetGotInterface
}

export const TemplateManager = ({ getgotInterface }: TemplateManagerProps) => {
  const [template, setTemplate] = React.useState(DEFAULT_TEMPLATE)
  const [dataState, setDataState] = React.useState({} as { [key: string]: string })
  const wrapperRef = React.useRef() as React.RefObject<HTMLDivElement>

  // const onClickPhotoElement = React.useCallback((event: SyntheticEvent<HTMLElement>) => {
  //   console.log(
  //     "Click Photo Spot",
  //     event.currentTarget.getAttribute("data-value-key"),
  //     event.target
  //   )
  //   window.GetGotInterface && window.GetGotInterface.selectPhoto()
  // }, [])

  const onClickPhotoElement = React.useCallback((e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    let element = e.target as HTMLElement

    while (element.parentElement && !element.getAttribute("data-value-key")) {
      element = element.parentElement
    }

    console.log("Click Photo Spot", element.getAttribute("data-value-key"), element)
    window.GetGotInterface && window.GetGotInterface.selectPhoto()
  }, [])

  const onClickHTMLPhotoElement = React.useCallback((e: Event) => {
    let element = e.target as HTMLElement

    while (element.parentElement && !element.getAttribute("data-value-key")) {
      element = element.parentElement
    }

    console.log("Click Photo Spot", element.getAttribute("data-value-key"), element)
    window.GetGotInterface && window.GetGotInterface.selectPhoto()
  }, [])

  const onClickHTMLTextElement = React.useCallback((e: Event) => {
    let element = e.target as HTMLElement

    while (element.parentElement && !element.getAttribute("data-value-key")) {
      element = element.parentElement
    }

    console.log("Click Text Spot", element.getAttribute("data-value-key"), element)
    window.GetGotInterface && window.GetGotInterface.test()
  }, [])

  const loadedPhoto = React.useCallback((photoBase64: string) => {
    alert(photoBase64)
    setDataState({ ...dataState, photo: photoBase64 })
  }, [])

  React.useEffect(() => {
    window.loadedPhoto = loadedPhoto
  }, [loadedPhoto])

  React.useEffect(() => {
    if (wrapperRef && wrapperRef.current) {
      const photoElements = wrapperRef.current.getElementsByClassName("add-photo")
      console.log("Photo Spots", photoElements)
      Array.from(photoElements).forEach((element: Element) => {
        console.log("Photo Spot", element)

        element.addEventListener("click", onClickHTMLPhotoElement)

        const elementValueKey = element.getAttribute("data-value-key")
        const elementValue = elementValueKey && dataState[elementValueKey]

        if (elementValue) {
          // Remove the parent style
          if (element.parentElement && element.parentElement.className.indexOf("-filled") < 0) {
            element.parentElement.className += " -filled"
          }

          // Clean out the add button and any existing images
          const photoIcons = element.getElementsByClassName("add-photo-icon")
          const loadedImages = element.getElementsByClassName("loaded-image")
          Array.from(photoIcons)
            .concat(Array.from(loadedImages))
            .forEach((removeableElement: Element) => {
              removeableElement.parentElement &&
                removeableElement.parentElement.removeChild(removeableElement)
            })

          // Add in the newly loaded image
          const loadedImage = document.createElement("img")
          loadedImage.className = "loaded-image"
          loadedImage.src = `data:image/png;base64, ${elementValue}`
          element.appendChild(loadedImage)
        } else {
          const iconDiv = document.createElement("div")
          iconDiv.className = "add-photo-icon"
          element.appendChild(iconDiv)
          ReactDOM.render(
            <>
              <Icon type="camera" theme="filled" /> <br /> <span>Add Photo</span>
            </>,
            iconDiv
          )
        }
      })
    }

    return () => {
      if (wrapperRef && wrapperRef.current) {
        const photoElements = wrapperRef.current.getElementsByClassName("add-photo")
        console.log("Photo Spots (Remove)", photoElements)
        Array.from(photoElements).forEach((element: Element) => {
          element.removeEventListener("click", onClickHTMLPhotoElement)
        })
      }
    }
  }, [wrapperRef, dataState])

  React.useEffect(() => {
    if (wrapperRef && wrapperRef.current) {
      const textElements = wrapperRef.current.getElementsByClassName("add-text")
      console.log("Text Spots", textElements)
      Array.from(textElements).forEach((element: Element) => {
        console.log("Text Spot", element)

        element.addEventListener("click", onClickHTMLTextElement)
        const addMessageDiv = document.createElement("div")
        addMessageDiv.className = "add-text"
        element.appendChild(addMessageDiv)
        ReactDOM.render(
          <>
            <span>Add Message</span>
          </>,
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
        })
      }
    }
  }, [wrapperRef])

  return (
    <div ref={wrapperRef}>
      <div dangerouslySetInnerHTML={{ __html: template }} />

      <Divider />
      <div className="add-photo-icon" onClick={onClickPhotoElement} data-value-key="feedPhoto">
        <Icon type="camera" theme="filled" /> <span>Add a separate feed photo</span>
      </div>
      <p className="disclaimer">
        This image will appear in others' photo feeds. If you don't want to provide one, we'll
        automatically select one from above.
      </p>
    </div>
  )
}
