import { Router, Link } from "@reach/router"
import React from "react"

export const Config = (props: any) => {
  return (
    <div style={{ backgroundColor: "orange", border: "solid 1px red", margin: 10, padding: 10 }}>
      <h5>Config</h5>
      <ul>
        <li>
          <Link to={`/app/admin/global-configs/fe36eb41-f62e-461a-8ddc-f6b804feb9da`}>Global Configs</Link>
        </li>
        <li>
          <Link to={`/app/admin/foo/bar/bah/global-configs/fe36eb41-f62e-461a-8ddc-f6b804feb9da`}>Foobarbah Global Configs</Link>
        </li>
        <li>
          <Link to={`/app/admin/foo/fe36eb41-f62e-461a-8ddc-f6b804feb9da`}>Foo</Link>
        </li>
      </ul>
      <div>path: {props.path}</div>
      <div>configId: {props.configId}</div>
      {props.children}
    </div>
  )
}

export const GlobalConfigs = (props: any) => {
  return (
    <div style={{ backgroundColor: "pink", border: "solid 1px red", margin: 10 }}>
      <h4>Global Configs</h4>
      <div>path: {props.path}</div>
      <Router>
        <Config path={`:configId`} />
      </Router>
    </div>
  )
}

export const Foo = (props: any) => {
  return (
    <div style={{ backgroundColor: "red", border: "solid 1px red", margin: 10 }}>
      <h4>Foo</h4>
      <div>path: {props.path}</div>
      <Router>
        <Config path={`:configId`} />
      </Router>
    </div>
  )
}

export const Admin = (props: any) => {
  return (
    <div style={{ backgroundColor: "lavender", border: "solid 1px red", margin: 10 }}>
      <h3>Admin</h3>
      <div>path: {props.path}</div>
      <Router>
        <GlobalConfigs path={`global-configs/*`} />
        <Foo path={`foo/*`} />
      </Router>
    </div>
  )
}

export function App(props: any) {
  return (
    <div style={{ backgroundColor: "lightblue", border: "solid 1px red", margin: 10 }}>
      <h3>App</h3>
      <ul>
        <li>
          <Link to={`/app/admin/global-configs/fe36eb41-f62e-461a-8ddc-f6b804feb9da`}>Global Configs</Link>
        </li>
        <li>
          <Link to={`/app/admin/foo/fe36eb41-f62e-461a-8ddc-f6b804feb9da`}>Foo</Link>
        </li>
      </ul>
      <div>path: {props.path}</div>
      <Router>
        <Admin path={`admin/*`} />
      </Router>
    </div>
  )
}

export const TestApp = (props: any) => {
  return (
    <div style={{ backgroundColor: "lightgreen", border: "solid 1px red", margin: 10 }}>
      <h2>Home</h2>
      <ul>
        <li>
          <Link to={`/app/admin/global-configs/fe36eb41-f62e-461a-8ddc-f6b804feb9da`}>Global Configs</Link>
        </li>
        <li>
          <Link to={`/app/admin/foo/fe36eb41-f62e-461a-8ddc-f6b804feb9da`}>Foo</Link>
        </li>
      </ul>
      <Router>
        <App path={`app/*`} />
      </Router>
    </div>
  )
}
