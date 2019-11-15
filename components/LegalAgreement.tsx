import { Flex } from "@ant-design/react-native"
import React, { FunctionComponent } from "react"
import { Text } from "react-native"
import { styles, combineStyles } from "constants"

export const LegalAgreement: FunctionComponent<{}> = () => {
  return (
    <Flex justify="start">
      <Text style={styles.SmallCopy}>
        You agree to the GetGot <Text style={styles.LinkText}>Terms of Service</Text> and{" "}
        <Text style={styles.LinkText}>Privacy Policy</Text>, and{" "}
        <Text style={styles.LinkText}>Cookie Policy</Text>. Others will be able to find you by email or
        phone number when provided. <Text style={styles.LinkText}>Privacy Options</Text>.
      </Text>
    </Flex>
  )
}
