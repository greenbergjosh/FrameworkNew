import { Collapse, Typography } from "antd"
import React from "react"

interface TemplateAppErrorBoundaryProps {}

export class TemplateAppErrorBoundary extends React.Component<TemplateAppErrorBoundaryProps> {
  state = { hasError: false, showError: false, errorMessage: null, errorStack: null }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorMessage: JSON.stringify(error) }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    reportTemplateCrash(error, errorInfo, window.location.search)
    this.setState({
      hasError: true,
      errorMessage: JSON.stringify(error),
      errorStack: errorInfo.componentStack,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ width: "90%", margin: "0 auto 10px", textAlign: "center" }}>
          <div className="error-item">
            <div className="polaroid">
              <img
                src="mess.jpg"
                style={{ width: "100%" }}
                onDoubleClick={() => this.setState({ showError: true })}
              />
              <div className="caption">
                <Typography.Title style={{ color: "#333" }}>Well, that's a mess.</Typography.Title>
              </div>
            </div>
          </div>

          {/* <img
            src="mess.jpg"
            style={{
              width: "100%",
              boxShadow: "25px 25px 50px 0 white inset, -25px -25px 50px 0 white inset",
            }}
            onDoubleClick={() => this.setState({ showError: true })}
          /> */}

          <Typography.Text style={{ color: "#666" }}>
            Try another one while we clean this up.
          </Typography.Text>
          <pre style={{ color: "#F04444" }}>Error Code: GG/WV-100</pre>
          {this.state.showError && (
            <Collapse activeKey={1}>
              <Collapse.Panel header={null} key={1}>
                {this.state.errorMessage}
                <hr />
                <pre>{this.state.errorStack}</pre>
              </Collapse.Panel>
            </Collapse>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

function reportTemplateCrash(error: Error, errorInfo: React.ErrorInfo, queryString: string) {
  //TODO Send this information somewhere useful
}
