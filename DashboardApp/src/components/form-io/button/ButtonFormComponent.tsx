import { Button, Icon } from "antd"
import { flattenComponents } from "formiojs/utils/formUtils"
import React, { SyntheticEvent } from "react"
import ReactFormBase from "../ReactFormBase"
import editForm from "./button.form"

interface ButtonOptions {}

export default class ButtonFormComponent extends ReactFormBase<ButtonOptions> {
  static schema(...extend: any[]) {
    return ReactFormBase.schema(
      {
        type: "button",
        label: "Submit",
        key: "submit",
        size: "md",
        leftIcon: "",
        rightIcon: "",
        block: false,
        action: "submit",
        persistent: false,
        disableOnInvalid: false,
        theme: "default",
        dataGridLabel: true,
      },
      ...extend
    )
  }

  static builderInfo = {
    title: "Button",
    group: "basic",
    icon: "fa fa-stop",
    documentation: "http://help.form.io/userguide/#button",
    weight: 110,
    schema: ButtonFormComponent.schema(),
  }

  static editForm = editForm

  elementInfo() {
    const info = super.elementInfo()
    info.type = "button"
    info.attr.type = ["submit", "saveState"].includes(this.component.action) ? "submit" : "button"
    this.component.theme = this.component.theme || "default"
    info.attr.class = `btn btn-${this.component.theme}`
    if (this.component.size) {
      info.attr.class += ` btn-${this.component.size}`
    }
    if (this.component.block) {
      info.attr.class += " btn-block"
    }
    if (this.component.customClass) {
      info.attr.class += ` ${this.component.customClass}`
    }
    return info
  }

  set disabled(disabled: boolean) {
    // Do not allow a component to be disabled if it should be always...
    if ((!disabled && this.shouldDisable) || (disabled && !this.shouldDisable)) {
      return
    }
    super.disabled = disabled
  }

  // No label needed for buttons.
  createLabel() {}

  // ???
  // createInput(container) {
  //   this.buttonElement = super.createInput(container);
  //   return this.buttonElement;
  // }

  onChange = (value: ButtonOptions, isValid: boolean) => {
    this.done = false
    if (isValid && this.hasError) {
      this.hasError = false
    }
  }

  onError = () => {
    this.done = true
    this.success = false
  }

  constructor(component: any, options: any, data: any) {
    super(component, options, data)
  }

  render(): JSX.Element {
    if (this.viewOnly || this.options.hideButtons) {
      this.component.hidden = true
    }

    this.dataValue = false
    this.hasError = false

    if (this.component.action === "submit") {
      this.on(
        "submitButton",
        () => {
          this.loading = true
          this.disabled = true
        },
        true
      )
      this.on(
        "submitDone",
        () => {
          this.loading = false
          this.disabled = false
          this.done = true
          this.success = true
        },
        true
      )
    }

    if (this.component.action === "url") {
      this.on(
        "requestButton",
        () => {
          this.loading = true
          this.disabled = true
        },
        true
      )
      this.on(
        "requestDone",
        () => {
          this.loading = false
          this.disabled = false
        },
        true
      )
    }

    this.on(
      "change",
      (value: ButtonOptions & { isValid: boolean }) => {
        this.loading = false
        this.disabled = this.options.readOnly || (this.component.disableOnInvalid && !value.isValid)
        if (this.component.action === "submit") {
          this.onChange(value, value.isValid)
        }
      },
      true
    )

    this.on(
      "error",
      () => {
        this.loading = false
        if (this.component.action === "submit") {
          this.onError()
        }
      },
      true
    )

    const handleClick = (event: SyntheticEvent) => {
      this.dataValue = true
      if (this.component.action !== "submit" && this.component.showValidations) {
        this.emit("checkValidity", this.data)
      }
      switch (this.component.action) {
        case "saveState":
        case "submit":
          event.preventDefault()
          event.stopPropagation()
          this.emit("submitButton", {
            state: this.component.state || "submitted",
          })
          break
        case "event":
          this.emit(this.interpolate(this.component.event), this.data)
          this.events.emit(this.interpolate(this.component.event), this.data)
          this.emit("customEvent", {
            type: this.interpolate(this.component.event),
            component: this.component,
            data: this.data,
            event: event,
          })
          break
        case "custom": {
          // Get the FormioForm at the root of this component's tree
          const form = this.getRoot()
          // Get the form's flattened schema components
          const flattened = flattenComponents(form.component.components, true)
          // Create object containing the corresponding HTML element components
          const components = Object.entries(flattened || {}).reduce(
            (acc, [key, component]) => {
              const element = form.getComponent(key)
              if (element) {
                acc[key] = element
              }

              return acc
            },
            {} as { [key: string]: any }
          )

          this.evaluate(this.component.custom, {
            form,
            flattened,
            components,
          })
          break
        }
        case "reset":
          this.emit("resetForm")
          break
        case "delete":
          this.emit("deleteSubmission")
          break
      }
    }

    const buttonElement = (
      <Button
        disabled={this.shouldDisable}
        htmlType={this.component.action === "submit" ? "submit" : "button"}
        onClick={handleClick}>
        {this.component.leftIcon && <Icon type={this.component.leftIcon} />}
        {!this.labelIsHidden() && this.component.label}
        {this.component.rightIcon && <Icon type={this.component.rightIcon} />}
      </Button>
    )

    return buttonElement
  }

  destroy() {
    super.destroy()
    this.removeShortcut(this.buttonElement)
  }

  focus() {
    this.buttonElement.focus()
  }

  isEmpty(value: ButtonOptions) {
    // TODO
  }

  get emptyValue() {
    return false
  }

  getValue() {
    return this.dataValue
  }

  get clicked() {
    return this.dataValue
  }

  get defaultValue() {
    return false
  }

  set dataValue(value: ButtonOptions) {
    if (!this.component.input) {
      return
    }
    super.dataValue = value
  }

  get className() {
    let className = super.className
    className += " form-group"
    return className
  }

  buttonMessage(message: string) {
    return <span className="help-block">{message}</span>
  }

  get defaultSchema() {
    return ButtonFormComponent.schema()
  }
}
