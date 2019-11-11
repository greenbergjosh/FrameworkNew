import { Typography } from "antd"
import { stringify } from "flatted/esm"
import Base from "formiojs/components/base/Base"
import { LRUMap } from "lru_map"
import React from "react"
import ReactDOM from "react-dom"

export interface ValueHolder {
  value: any
}

interface Stateful<T extends ValueHolder> {
  state: T
}

type FormIOComponent = any
type FormIOOptions = any
type FormIOData = any
type FormIOSchemaItem = any

const elementCache = new LRUMap(200)

export default abstract class ReactFormBase<T extends ValueHolder> extends Base
  implements Stateful<T> {
  private _state!: T
  private initialState!: T

  static schema(...extend: FormIOSchemaItem[]) {
    return Base.schema(...extend)
  }

  protected constructor(component: FormIOComponent, options: FormIOOptions, data: FormIOData) {
    super(component, options, data)
  }

  build() {
    const { component, options, data } = this
    const key = btoa(stringify({ component, options, data }))

    console.log("ReactFormBase.build", {
      label: component.label,
      id: component.id,
      key,
      oldKey: this._lastBuildKey,
    })
    if (key === this._lastBuildKey) return
    this._lastBuildKey = key

    // console.log("ReactFormBase.build: Existing Element", component.id, this.element)
    // if (!this.element && document.getElementById(component.id)) {
    //   this.element = document.getElementById(component.id)
    // }
    // console.log("ReactFormBase.build: Found DOM Element", component.id, this.element)

    // if (!this.element && elementCache.has(component.id)) {
    //   this.element = elementCache.get(component.id)
    //   console.log("ReactFormBase.build: Found Cached Element", component.id, this.element)
    //   this.element.removeAttribute("hidden")
    //   this.element.style.visibility = "auto"
    //   this.element.style.position = "auto"
    // }

    if (this.element && !this.renderContainer) {
      this.renderContainer = this.element.getElementsByClassName("react-form-base-container")[0]
    }

    if (!this.element || !this.renderContainer) {
      if (!this.element) {
        this.element = this.ce("div", {
          id: component.id,
          class: "react-form-base-outer-container",
        })
        this.createLabel(this.element)
      }

      if (!this.renderContainer) {
        this.renderContainer = this.ce("div", {
          class: "react-form-base-container form-group has-feedback formio-component",
        })
      }
      this.element.appendChild(this.renderContainer)

      elementCache.set(component.id, this.element)

      setTimeout(this.buildReactComponent, 100)
    } else {
      console.log(
        "ReactFormBase.build: Partial rebuild as element framing already exists",
        this.element
      )
      this.element.getElementsByClassName("control-label")[0].innerText = component.label
      setTimeout(this.buildReactComponent, 100)
    }
  }

  abstract render(): JSX.Element | JSX.Element[]

  buildReactComponent = () => {
    if (this.renderContainer) {
      const buildComponent = this.render || this.renderMissingComponent
      const renderedComponent = buildComponent.call(this)

      const wrappedComponent = (
        <DumbStateComponent state={this.state}>{renderedComponent}</DumbStateComponent>
      )
      console.debug("ReactFormBase.buildReactComponent", this.component.label)
      ReactDOM.render(wrappedComponent, this.renderContainer)
    } else {
      console.debug(
        "ReactFormBase.buildReactComponent",
        "Skipped rendering because this.renderContainer was not ready"
      )
    }
  }

  static renderMissingComponent(): JSX.Element {
    return <Typography.Text type="danger">No Component Render Defined</Typography.Text>
  }

  elementInfo() {
    const info = super.elementInfo()
    info.changeEvent = "input"
    return info
  }

  abstract get emptyValue(): T["value"]

  getValue(): T["value"] {
    // console.log("ReactFormBase.getValue", this._state)
    return this.state.value
  }

  get hasSetValue() {
    return this.haAny
  }

  setValue(value: T["value"]) {
    this.setState({ value } as Partial<T>)
  }

  deleteValue() {
    this.setValue(this.emptyValue)
  }

  get defaultSchema() {
    return ReactFormBase.schema()
  }

  get state(): T {
    return this._state
  }

  set state(state: T) {
    const isChanged = this._state !== state
    if (!this.initialState) {
      this.initialState = state
    }
    this._state = state
    // console.log("ReactFormBase._state", this._state, this.component, { isChanged })

    if (isChanged) {
      this.buildReactComponent()
      super.setValue(state)
    }
  }

  setState(state: Partial<T>) {
    // If this is called for the initial state, it should be a whole state
    if (!this.state) {
      this.state = state as T
    }
    // If this is called after there's an initial state, it can be a partial state
    else if (JSON.stringify(this.state) !== JSON.stringify(state)) {
      console.debug("ReactFormBase.setState", { currentState: this.state, nextState: state })
      this.state = { ...this.state, ...state }
    }
  }
}

const DumbStateComponent = ({ state, children }: { state: any; children: any }) => {
  const foo = React.useEffect(() => {
    console.debug("DumbStateComponent.onMount", state)
    return () => {
      console.debug("DumbStateComponent.onUnmount", state)
    }
  }, [])

  return <>{children}</>
}
