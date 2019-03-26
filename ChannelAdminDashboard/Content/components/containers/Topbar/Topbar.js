import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Layout} from 'antd'
//import appActions from "../../redux/app/actions";
import TopbarNotification from './topbarNotification'
//import TopbarMessage from "./topbarMessage";
import TopbarSearch from './topbarSearch'
import TopbarUser from './topbarUser'
//import TopbarAddtoCart from "./topbarAddtoCart";
import TopbarWrapper from './topbar.style'
import GoogleAuth from '../../components/auth/GoogleAuth'

const {Header} = Layout

//const { toggleCollapsed } = appActions;

class Topbar extends Component {
  render() {
    const {toggleCollapsed, url, locale} = this.props
    const customizedTheme = this.props.customizedTheme || {}
    const collapsed = false
    const styling = {
      background: customizedTheme.backgroundColor,
      position: 'fixed',
      width: '100%',
      height: 70,
    }
    return (
      <TopbarWrapper>
        <Header
          style={styling}
          className={
            'isomorphicTopbar'
          }
        >
          <div className="isoLeft">
            <button
              className={
                'triggerBtn menuOpen'
              }
              style={{color: customizedTheme.textColor}}
              onClick={toggleCollapsed}
            />
          </div>

          <ul className="isoRight">
            <li className="isoSearch">
              <TopbarSearch locale={locale}/>
            </li>

            <li
              onClick={() => this.setState({selectedItem: 'notification'})}
              className="isoNotify"
            >
              <TopbarNotification locale={locale}/>
            </li>

            {/*<li
              onClick={() => this.setState({ selectedItem: "message" })}
              className="isoMsg"
            >
              <TopbarMessage locale={locale} />
            </li>*/}
            {/*<li
              onClick={() => this.setState({ selectedItem: "addToCart" })}
              className="isoCart"
            >
              <TopbarAddtoCart url={url} locale={locale} />
            </li>*/}

            {/*<li*/}
            {/*onClick={() => this.setState({ selectedItem: "user" })}*/}
            {/*className="isoUser"*/}
            {/*>*/}
            {/*<TopbarUser locale={locale} />*/}
            {/*</li>*/}
            <li
              onClick={() => this.setState({selectedItem: 'user'})}
              className="isoUser"
            >
              <GoogleAuth/>
            </li>
          </ul>
        </Header>
      </TopbarWrapper>
    )
  }
}

//export default connect(
//  state => ({
//    ...state.App,
//    locale: state.LanguageSwitcher.language.locale,
//    customizedTheme: state.ThemeSwitcher.topbarTheme
//  }),
//  { toggleCollapsed }
//)(Topbar);

export default Topbar
