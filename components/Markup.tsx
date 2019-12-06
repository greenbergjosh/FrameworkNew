import { Text } from "react-native"
import { FontWeights, styles, Units } from "constants"
import React from "react"

interface MarkdownProps {
  children
  style?
}

interface LinkableMarkdownProps extends MarkdownProps {
  onPress?: () => void
}

export const P = ({ children, style }: MarkdownProps) => (
  <Text style={[styles.Body, { marginBottom: Units.margin }, style]}>{children}</Text>
)

export const STRONG = ({ children, style }: MarkdownProps) => (
  <Text style={[styles.Body, { fontWeight: FontWeights.bold }, style]}>{children}</Text>
)

export const SMALL = ({ children, style }: MarkdownProps) => (
  <Text style={[styles.SmallCopy, style]}>{children}</Text>
)

export const H1 = ({ children, style }: MarkdownProps) => (
  <Text style={[styles.H1, style]}>{children}</Text>
)

export const H2 = ({ children, style }: MarkdownProps) => (
  <Text style={[styles.H2, style]}>{children}</Text>
)

export const H3 = ({ children, style }: MarkdownProps) => (
  <Text style={[styles.H3, style]}>{children}</Text>
)

export const H4 = ({ children, style }: MarkdownProps) => (
  <Text style={[styles.H4, style]}>{children}</Text>
)

export const BR = () => <Text>{"\n"}</Text>

export const A = ({ children, onPress, style }: LinkableMarkdownProps) => (
  <Text style={[styles.LinkText, style]} onPress={onPress}>
    {children}
  </Text>
)
