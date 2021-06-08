import classNames from "classnames"
import React from "react"
import styles from "./styles.scss"
import tinycolor from "tinycolor2"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { colorPickerManageForm } from "./color-picker-manage-form"
import { LayoutDefinition } from "../../../globalTypes"
import { Input, Popover } from "antd"
import { isEmpty, isEqual } from "lodash/fp"
import { RgbaColor, RgbaColorPicker } from "react-colorful"
import { Undraggable } from "components/DragAndDrop/Undraggable"
import { ColorPickerInterfaceComponentProps, ColorPickerInterfaceComponentState } from "plugins/ant/color-picker/types"

const _rgbWhite = "rgb(255, 255, 255)"

export class ColorPickerInterfaceComponent extends BaseInterfaceComponent<
  ColorPickerInterfaceComponentProps,
  ColorPickerInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: _rgbWhite,
    placeholder: "Enter a Color",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Form",
      name: "color-picker",
      title: "Color",
      icon: "bg-colors",
      formControl: true,
      componentDefinition: {
        component: "color-picker",
        label: "Color",
      },
    }
  }

  static manageForm = colorPickerManageForm

  constructor(props: ColorPickerInterfaceComponentProps) {
    super(props)

    this.state = {
      visible: false,
      colorSpace: "rgba",
      colorString: _rgbWhite,
      rgbaColor: { r: 255, g: 255, b: 255, a: 1 },
    }
  }

  componentDidMount(): void {
    const value = this.getValue(this.props.valueKey) as string
    const colorString = getColorStringFromString(value, this.props.defaultValue)
    const colorSpace = colorString.startsWith("#") ? "hex" : "rgba"
    const rgbaColor = tinycolor(colorString).toRgb()
    this.setState({ colorString, rgbaColor, colorSpace })
  }

  shouldComponentUpdate(nextProps: Readonly<ColorPickerInterfaceComponentProps>): boolean {
    const prevValue = this.getValue(this.props.valueKey)
    const nextValue = this.getValue(nextProps.valueKey, nextProps.userInterfaceData, nextProps.getRootUserInterfaceData)
    return isEqual(prevValue, nextValue)
  }

  componentDidUpdate(): void {
    const nextValue = this.getValue(this.props.valueKey)
    const colorString = getColorStringFromString(nextValue, this.props.defaultValue)
    const colorSpace = colorString.startsWith("#") ? "hex" : "rgba"
    const rgbaColor = tinycolor(colorString).toRgb()
    this.setState({ colorString, rgbaColor, colorSpace })
  }

  /* *******************************************
   *
   * EVENT HANDLERS
   */

  /**
   * Public method for external clients to trigger a reset
   * @public
   */
  public reset(): void {
    this.setValue([this.props.valueKey, this.props.defaultValue || ""])
  }

  handleInputChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    const colorString = getColorStringFromString(value, _rgbWhite)
    const colorSpace = colorString.startsWith("#") ? "hex" : "rgba"
    const rgbaColor = tinycolor(colorString).toRgb()
    this.setState({ colorString, rgbaColor, colorSpace })
    this.setValue([this.props.valueKey, colorString])
  }

  handlePickerChange = (rgbaColor: RgbaColor): void => {
    const colorString = getColorStringFromColor(rgbaColor, this.state.colorSpace)
    console.log("ColorPicker", { rgbaColor, colorString })
    this.setState({ colorString, rgbaColor })
    this.setValue([this.props.valueKey, colorString])
  }

  hide = () => {
    this.setState({
      visible: false,
    })
  }

  handleVisibleChange = (visible: boolean) => {
    this.setState({ visible })
  }

  render(): JSX.Element {
    const { size, placeholder } = this.props

    return (
      <div className={styles.wrapper}>
        <Undraggable>
          <Popover
            content={
              <>
                <RgbaColorPicker color={this.state.rgbaColor} onChange={this.handlePickerChange} />
                <a onClick={this.hide}>Close</a>
              </>
            }
            title="Pick a color"
            trigger="click"
            visible={this.state.visible}
            onVisibleChange={this.handleVisibleChange}>
            <div
              className={classNames(styles.swatch, this.props.size === "small" ? styles.small : undefined)}
              style={{ backgroundColor: this.state.colorString }}
            />
          </Popover>
          <Input
            onChange={this.handleInputChange}
            value={this.state.colorString}
            className={styles.colorPicker}
            size={size}
            placeholder={placeholder}
          />
        </Undraggable>
      </div>
    )
  }
}

/* *******************************************
 *
 * HELPER FUNCTIONS
 */

/**
 * Ensures user input is correctly formatted
 * @param colorString
 * @param defaultValue
 */
function getColorStringFromString(colorString: string, defaultValue?: string): string {
  const c = !isEmpty(colorString) ? colorString : defaultValue || _rgbWhite
  if (c.startsWith("#")) {
    return tinycolor(c).toHexString()
  }
  return c.startsWith("rgb") ? c : tinycolor(c).toRgbString()
}

/**
 *
 * @param rgbaColor
 * @param colorSpace
 */
function getColorStringFromColor(rgbaColor: RgbaColor, colorSpace: "hex" | "rgba") {
  const isSolidColor = rgbaColor.a === 1
  if (colorSpace === "hex" && isSolidColor) {
    return tinycolor(rgbaColor).toHexString()
  }
  return tinycolor(rgbaColor).toRgbString()
}
