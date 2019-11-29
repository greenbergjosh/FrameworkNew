import React from "react"
import { Button, Flex, WhiteSpace } from "@ant-design/react-native"
import { Text } from "react-native"
import { styles } from "constants"

interface DevTempNavProps {
  onPress
}

/**
 * Temporary Navigation for Development
 * @param props
 * @constructor
 */
export default ({ onPress }: DevTempNavProps) => {
  return (
    <Flex direction="row" justify="center" style={{ padding: 5, backgroundColor: "lightgrey" }}>
      <Text style={styles.Body}>Dev Nav:   </Text>
      <Button type="ghost" size="small" onPress={() => onPress("onboarding")}>
        Show On-Boarding
      </Button>
      <Text>    </Text>
      <Button type="ghost" size="small" onPress={() => onPress("homefeed")}>
        Show Home Feed
      </Button>
    </Flex>
  )
}
