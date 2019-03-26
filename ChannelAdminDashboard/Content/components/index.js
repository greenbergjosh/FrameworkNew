import React from 'react';
import ReactDOM from 'react-dom';

import ReactDOMServer from 'react-dom/server';

import AppRoot from './AppRoot.js'
import { ServerStyleSheet } from 'styled-components';
import { JssProvider, SheetsRegistry } from 'react-jss';
import Helmet from 'react-helmet';

global.self = global;
global.React = React;
global.ReactDOM = ReactDOM;
global.ReactDOMServer = ReactDOMServer;

global.Styled = { ServerStyleSheet };
global.ReactJss = { JssProvider, SheetsRegistry };
global.Helmet = Helmet;

global.RootComponent = AppRoot;