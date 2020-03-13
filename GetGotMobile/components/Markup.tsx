import { Text } from "react-native"
import { FontWeights, styles, Units } from "styles"
import React from "react"

interface MarkdownProps {
  children
  style?
  numberOfLines?: number
  onPress?: () => void
}

const Base = (props: MarkdownProps) => {
  interface propsType {
    numberOfLines?: number
    ellipsizeMode?: "tail"
    onPress?: () => void
  }
  const newProps: propsType = { ...props }
  if (props.numberOfLines) {
    newProps.numberOfLines = props.numberOfLines
    newProps.ellipsizeMode = typeof props.numberOfLines === "number" ? "tail" : null
  }
  if (props.onPress) {
    newProps.onPress = props.onPress
  }
  return <Text {...newProps} />
}

export const P = (props: MarkdownProps) => (
  <Base {...props} style={[styles.Body, { marginBottom: Units.margin }, props.style]} />
)

export const STRONG = (props: MarkdownProps) => (
  <Base {...props} style={[styles.Body, { fontWeight: FontWeights.bold }, props.style]} />
)

export const SMALL = (props: MarkdownProps) => (
  <Base {...props} style={[styles.SmallCopy, props.style]} />
)

export const H1 = (props: MarkdownProps) => <Base {...props} style={[styles.H1, props.style]} />

export const H2 = (props: MarkdownProps) => <Base {...props} style={[styles.H2, props.style]} />

export const H3 = (props: MarkdownProps) => <Base {...props} style={[styles.H3, props.style]} />

export const H4 = (props: MarkdownProps) => <Base {...props} style={[styles.H4, props.style]} />

export const BR = () => <Text>{"\n"}</Text>

export const A = (props: MarkdownProps) => (
  <Base {...props} style={[styles.LinkText, props.style]} />
)
