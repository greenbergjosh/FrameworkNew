/**
 * @class ExampleComponent
 */

import * as React from "react"

export type Props = { text: string }

export default class ExampleComponent extends React.Component<Props> {
  render() {
    const { text } = this.props

    return (
      <div
        style={{
          display: "inline-block",
          margin: "2em auto",
          border: "2px solid #000",
          fontSize: "2em",
        }}>
        Example Component: {text}
      </div>
    )
  }
}
