import React from 'react'
import {Provider} from 'react-redux'
import {ThemeProvider} from 'styled-components'
import {LocaleProvider} from 'antd'
import {IntlProvider} from 'react-intl'

import {store} from '../redux/store'
//import Boot from './redux/boot';

import {themeConfig} from '../settings'
import GlobalStyles from '../settings/globalStyles'
import themes from '../settings/themes'

import DashAppHolder from './dashAppStyle'

import App from '../containers/App/App.js'

import AppLocale from '../languageProvider'

const currentAppLocale = AppLocale['en']

//TODO This will come down from the server
import LBMEditor from '../containers/LBM'

const CurrentViewComponent = LBMEditor

const DashApp = (props) => (
  console.log('DashApp.js', 'props', props) ||
  <LocaleProvider locale={currentAppLocale.antd}>
    <IntlProvider
      locale={currentAppLocale.locale}
      messages={currentAppLocale.messages}
    >
      <ThemeProvider theme={themes[themeConfig.theme]}>
        <DashAppHolder>
          <Provider store={store}>
            <App>
              <CurrentViewComponent {...props.viewProps}/>
            </App>
          </Provider>
          <GlobalStyles/>
        </DashAppHolder>
      </ThemeProvider>
    </IntlProvider>
  </LocaleProvider>
)

export default DashApp
export {AppLocale}
