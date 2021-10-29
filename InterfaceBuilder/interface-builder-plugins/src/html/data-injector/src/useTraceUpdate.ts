import React from "react"

// eslint-disable-next-line no-unused-vars
export default function useTraceUpdate(componentName: string, props: React.ComponentProps<any>) {
  const prev = React.useRef(props)
  React.useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ps[k] = [prev.current[k], v]
      }
      return ps
    }, {})
    if (Object.keys(changedProps).length > 0) {
      console.log(componentName, "Changed props:", changedProps)
    }
    prev.current = props
  })
}

/*
 * INSTRUCTIONS
 *
 * Place this line in the component you want to trace.
 * useTraceUpdate("ComponentName", props)
 */
