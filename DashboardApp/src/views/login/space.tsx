import React from "react"

export function Horizontal({ height }: { height: string | number }): JSX.Element {
  const style = React.useMemo(() => ({ height }), [height])
  return <div style={style} />
}

export function Vertical({ width }: { width: string | number }): JSX.Element {
  const style = React.useMemo(() => ({ width }), [width])
  return <div style={style} />
}

export const Space = {
  Horizontal,
  Vertical,
}
