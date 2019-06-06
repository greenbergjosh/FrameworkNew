import { Typography } from "antd"
import Base from "formiojs/components/base/Base"
import React from "react"
import ReactDOM from "react-dom"

interface Stateful<T> {
  state: T
}

type FormIOComponent = any
type FormIOOptions = any
type FormIOData = any
type FormIOSchemaItem = any

export default abstract class ReactFormBase<T> extends Base implements Stateful<T> {
  private _state!: T
  private initialState!: T

  static schema(...extend: FormIOSchemaItem[]) {
    return Base.schema(...extend)
  }

  protected constructor(component: FormIOComponent, options: FormIOOptions, data: FormIOData) {
    super(component, options, data)
  }

  build() {
    this.element = this.ce("div", { class: "react-form-base-outer-container" })
    this.createLabel(this.element)

    this.renderContainer = this.ce("div", { class: "react-form-base-container" })
    this.element.appendChild(this.renderContainer)

    setTimeout(this.buildReactComponent, 100)
  }

  abstract render(): JSX.Element | JSX.Element[]

  buildReactComponent = () => {
    if (this.renderContainer) {
      const buildComponent = this.render || this.renderMissingComponent
      const renderedComponent = buildComponent.call(this)

      const wrappedComponent = (
        <DumbStateComponent state={this.state}>{renderedComponent}</DumbStateComponent>
      )
      ReactDOM.render(wrappedComponent, this.renderContainer)
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

  abstract get emptyValue(): T

  getValue(): T {
    // console.log("ReactFormBase.getValue", this._state)
    return this.state
  }

  get hasSetValue() {
    return this.hasValue()
  }

  setValue(value: T) {
    this.setState(value)
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
    else {
      this.state = { ...this.state, ...state }
    }
  }
}

const DumbStateComponent = ({ state, children }: { state: any; children: any }) => {
  return <>{children}</>
}
