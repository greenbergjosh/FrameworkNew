import React from "react"

interface Props {
  size: number
}
export function HorizontalSpace({ size }: Props): JSX.Element {
  const style = React.useMemo(() => ({ height: `${size}px` }), [size])
  return <div style={style} />
}
