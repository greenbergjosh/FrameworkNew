import React from "react"
import { Button, Empty, Icon, Input, Menu, Skeleton, Typography } from "antd"
import { ClickParam } from "antd/lib/menu"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { Selectable, SelectableChildProps, SelectableProps } from "../../_shared/selectable"
import { menuManageForm } from "./menu-manage-form"
import styles from "./styles.scss"

/******************************
 * Interfaces, Types, Enums
 */

export interface SelectState {
  selectedKey?: string
  searchText?: string
}
export interface IMenuProps {
  resultLimit?: number
  searchPlaceholder?: string
}
export type MenuProps = SelectableProps & IMenuProps

/******************************
 * Component
 */

export class MenuInterfaceComponent extends BaseInterfaceComponent<MenuProps, SelectState> {
  constructor(props: MenuProps) {
    super(props)
    this.state = {}
  }

  static defaultProps = {
    allowClear: true,
    createNewLabel: "Create New...",
    defaultValue: [],
    multiple: false,
    searchPlaceholder: "Search...",
    valueKey: "value",
    valuePrefix: "",
    valueSuffix: "",
  }

  static manageForm = menuManageForm

  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "menu",
      title: "Menu",
      icon: "menu",
      componentDefinition: {
        component: "menu",
      },
    }
  }

  handleMenuClick = ({ key }: ClickParam) => {
    this.setState({ selectedKey: key })
    console.log("handleMenuClick!", key)
  }

  handleButtonClick = (e: React.MouseEvent) => {
    // this.setState({ selectedKey: key })
    console.log("handleButtonClick!", e)
  }

  handleInputChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchText: target.value })
    console.log("handleChange!", target.value)
  }

  /****************************************************************
   * Define this component's render for Selectable to call
   * so Selectable can pass in Selectable state and props.
   * Props must implement SelectableChildProps interface.
   */
  private renderMenu = ({
    disabled,
    getCleanValue,
    loadError,
    loadStatus,
    options,
  }: SelectableChildProps) => {
    const { searchPlaceholder } = this.props as IMenuProps
    const { selectedKey } = this.state

    //TODO: What to do with this?
    const getKeyFromValue = () => {
      const value = getCleanValue()
      return value && value.toString()
    }

    return (
      <>
        <Input
          className={styles.menuFilter}
          placeholder={searchPlaceholder}
          onChange={this.handleInputChange}
          allowClear={true}
        />
        <Typography.Text type="secondary" ellipsis={true}>
          Selected:&nbsp;{selectedKey}
          {selectedKey && (
            <Button
              type="link"
              shape="circle"
              size="small"
              icon="close-circle"
              onClick={this.handleButtonClick}
            />
          )}
        </Typography.Text>
        <Skeleton active loading={loadStatus === "loading"}>
          <Menu onClick={this.handleMenuClick}>
            {options.map((option, index) => (
              <Menu.Item key={`item${index}|${option.value}`} disabled={disabled}>
                {typeof option.icon !== "undefined" ? (
                  <Icon type={option.icon} className={styles.menuItemIcon} />
                ) : null}
                {option.label}
              </Menu.Item>
            ))}
          </Menu>
          {!loadError && (options && options.length > 0) ? null : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Skeleton>
      </>
    )
  }

  render(): JSX.Element {
    return (
      // Since props is a union of IMenuProps and SelectableProps, we cast as SelectableProps
      <Selectable {...this.props as SelectableProps}>{this.renderMenu}</Selectable>
    )
  }
}
