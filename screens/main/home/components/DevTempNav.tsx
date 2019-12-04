import React from "react"
import { Button, Flex, WhiteSpace } from "@ant-design/react-native"
import { Text } from "react-native"
import { styles } from "constants"

interface DevTempNavProps {
  onPress,
  mode: string
}

/**
 * Temporary Navigation for Development
 * @param props
 * @constructor
 */
export default ({ onPress, mode }: DevTempNavProps) => {
  return (
    <Flex direction="row" justify="center" style={{ padding: 5, backgroundColor: "lightblue" }}>
      <Text style={styles.Body}>Dev Nav: </Text>
      {mode === "homefeed" ? (
        <Button type="ghost" size="small" onPress={() => onPress("onboarding")}>
          Show On-Boarding
        </Button>
      ) : (
        <Button type="ghost" size="small" onPress={() => onPress("homefeed")}>
          Show Home Feed
        </Button>
      )}
    </Flex>
  )
}
