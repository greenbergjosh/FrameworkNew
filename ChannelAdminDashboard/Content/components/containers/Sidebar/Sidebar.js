import React, { Component } from "react";
//import { connect } from "react-redux";
import clone from "clone";
import { Link } from "react-router-dom";
import { Layout } from "antd";
import options from "./options";
import Scrollbars from "../../components/utility/customScrollBar.js";
import Menu from "../../components/uielements/menu";
import IntlMessages from "../../components/utility/intlMessages";
import SidebarWrapper from "./sidebar.style";
//import appActions from "../../redux/app/actions";
import Logo from "../../components/utility/logo";

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Sider } = Layout;

//const {
//  toggleOpenDrawer,
//  changeOpenKeys,
//  changeCurrent,
//  toggleCollapsed
//} = appActions;
const stripTrailingSlash = str => {
  if (str && str.substr(-1) === "/") {
    return str.substr(0, str.length - 1);
  }
  return str;
};

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.onOpenChange = this.onOpenChange.bind(this);
  }
  handleClick(e) {
    this.props.changeCurrent([e.key]);
    if (this.props.app.view === "MobileView") {
      setTimeout(() => {
        this.props.toggleCollapsed();
        this.props.toggleOpenDrawer();
      }, 100);
    }
  }
  onOpenChange(newOpenKeys) {
    const { app, changeOpenKeys } = this.props;
    const latestOpenKey = newOpenKeys.find(
      key => !([].indexOf(key) > -1)
    );
    const latestCloseKey = [].find(
      key => !(newOpenKeys.indexOf(key) > -1)
    );
    let nextOpenKeys = [];
    if (latestOpenKey) {
      nextOpenKeys = this.getAncestorKeys(latestOpenKey).concat(latestOpenKey);
    }
    if (latestCloseKey) {
      nextOpenKeys = this.getAncestorKeys(latestCloseKey);
    }
    changeOpenKeys(nextOpenKeys);
  }
  getAncestorKeys = key => {
    const map = {
      sub3: ["sub2"]
    };
    return map[key] || [];
  };
  getMenuItem = ({ singleOption, submenuStyle, submenuColor }) => {
    const { key, label, leftIcon, children } = singleOption;
    const url = stripTrailingSlash(this.props.url);
    if (children) {
      return (
        <SubMenu
          key={key}
          title={
            <span className="isoMenuHolder" style={submenuColor}>
              <i className={leftIcon} />
              <span className="nav-text">
                <IntlMessages id={label} />
              </span>
            </span>
          }
        >
          {children.map(child => {
            const linkTo = child.withoutDashboard
              ? `/${child.key}`
              : `${url}/${child.key}`;
            return (
              <Menu.Item style={submenuStyle} key={child.key}>
                <a style={submenuColor} to={linkTo}>
                  <IntlMessages id={child.label} />
                </a>
              </Menu.Item>
            );
          })}
        </SubMenu>
      );
    }
    return (
      <Menu.Item key={key}>
        <a to={`${url}/${key}`}>
          <span className="isoMenuHolder" style={submenuColor}>
            <i className={leftIcon} />
            <span className="nav-text">
              <IntlMessages id={label} />
            </span>
          </span>
        </a>
      </Menu.Item>
    );
  };
  render() {
    const { app, toggleOpenDrawer, height } = this.props;
	const customizedTheme = this.props.customizedTheme || {}
    const collapsed = false;//clone(app.collapsed) && !clone(app.openDrawer);
    const openDrawer = true
    const mode = "inline";
    const onMouseEnter = event => {
      if (openDrawer === false) {
        toggleOpenDrawer();
      }
      return;
    };
    const onMouseLeave = () => {
      if (openDrawer === true) {
        toggleOpenDrawer();
      }
      return;
    };
    const styling = {
      backgroundColor: customizedTheme.backgroundColor
    };
    const submenuStyle = {
      backgroundColor: "rgba(0,0,0,0.3)",
      color: customizedTheme.textColor
    };
    const submenuColor = {
      color: customizedTheme.textColor
    };
    return (
      <SidebarWrapper>
        <Sider
          trigger={null}
          collapsible={true}
          collapsed={false}
          width={240}
          className="isomorphicSidebar"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          style={styling}
        >
          <Logo collapsed={false} />
          <Scrollbars style={{ height: height - 70 }}>
            <Menu
              onClick={this.handleClick}
              theme="dark"
              className="isoDashboardMenu"
              mode={mode}
              openKeys={[]}
              selectedKeys={''}
              onOpenChange={this.onOpenChange}
            >
              {options.map(singleOption =>
                this.getMenuItem({ submenuStyle, submenuColor, singleOption })
              )}
            </Menu>
          </Scrollbars>
        </Sider>
      </SidebarWrapper>
    );
  }
}

//export default connect(
//  state => ({
//    app: state.App,
//    customizedTheme: state.ThemeSwitcher.sidebarTheme,
//    height: state.App.height
//  }),
//  { toggleOpenDrawer, changeOpenKeys, changeCurrent, toggleCollapsed }
//)(Sidebar);

export default Sidebar
