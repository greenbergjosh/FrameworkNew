import { Text } from "react-native"
import { FontWeights, styles, Units } from "constants"
import React from "react"

export const P = ({ children }) => (
  <Text style={[styles.Body, { marginBottom: Units.margin }]}>{children}</Text>
)

export const STRONG = ({ children }) => (
  <Text style={[styles.Body, { fontWeight: FontWeights.bold }]}>{children}</Text>
)

export const SMALL = ({ children }) => (
  <Text style={styles.SmallCopy}>{children}</Text>
)

export const H1 = ({ children }) => <Text style={styles.H1}>{children}</Text>

export const H2 = ({ children }) => <Text style={styles.H2}>{children}</Text>

export const H3 = ({ children }) => <Text style={styles.H3}>{children}</Text>

export const H4 = ({ children }) => <Text style={styles.H4}>{children}</Text>

export const BR = () => <Text>{"\n"}</Text>

export const A = ({ children, onPress }) => (
  <Text style={styles.LinkText} onPress={onPress}>
    {children}
  </Text>
)
