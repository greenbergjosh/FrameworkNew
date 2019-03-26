import React, { Component } from 'react';
//import { connect } from 'react-redux';
import { Layout, LocaleProvider } from 'antd';
import { IntlProvider } from 'react-intl';
import { Debounce } from 'react-throttle';
import { ThemeProvider } from 'styled-components';

//import authAction from '../../redux/auth/actions';
//import appActions from '../../redux/app/actions';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import ThemeSwitcher from '../ThemeSwitcher';
//import AppRouter from './AppRouter';
import { siteConfig } from '../../settings';
import { AppLocale } from '../../components/dashApp';
import themes from '../../settings/themes';
import AppHolder from './commonStyle';
import './global.css';
import '@mdi/font/css/materialdesignicons.min.css'

const { Content, Footer } = Layout;
//const { logout } = authAction;
//const { toggleAll } = appActions;
export class App extends Component {
  render() {
    const url = this.props && this.props.match && this.props.match.url;
    const { children, locale, selectedTheme, height } = this.props;
    const currentAppLocale = AppLocale['en'];
    const appHeight = typeof window !== 'undefined' ? window.innerHeight : 1024;
    return (
      <LocaleProvider locale={currentAppLocale.antd}>
        <IntlProvider
          locale={currentAppLocale.locale}
          messages={currentAppLocale.messages}
        >
          <ThemeProvider theme={themes['themedefault']}>
            <AppHolder>
              <Layout style={{ height: appHeight }}>
                {/*<Debounce time="1000" handler="onResize">
                  <WindowResizeListener
                    onResize={windowSize =>
                      this.props.toggleAll(
                        windowSize.windowWidth,
                        windowSize.windowHeight
                      )
                    }
                  />
                </Debounce>*/}
                <Topbar url={url} />
                <Layout style={{ flexDirection: 'row', overflowX: 'hidden' }}>
                  <Sidebar url={url} />
                  <Layout
                    className="isoContentMainLayout"
                    style={{
                      height: height
                    }}
                  >
                    <Content
                      className="isomorphicContent"
                      style={{
                        padding: '70px 0 0',
                        flexShrink: '0',
                        background: '#f1f3f6',
                        position: 'relative'
                      }}
                    >
					  {children}
                      {/*<AppRouter url={url} />*/}
                    </Content>
                    <Footer
                      style={{
                        background: '#ffffff',
                        textAlign: 'center',
                        borderTop: '1px solid #ededed'
                      }}
                    >
                      {siteConfig.footerText}
                    </Footer>
                  </Layout>
                </Layout>
              </Layout>
            </AppHolder>
          </ThemeProvider>
        </IntlProvider>
      </LocaleProvider>
    );
  }
}

//export default connect(
//  state => ({
//    auth: state.Auth,
//    locale: state.LanguageSwitcher.language.locale,
//    selectedTheme: state.ThemeSwitcher.changeThemes.themeName,
//    height: state.App.height
//  }),
//  { logout, toggleAll }
//)(App);

export default App
