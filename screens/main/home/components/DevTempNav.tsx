import React from "react"
import { Button, Flex, WhiteSpace } from "@ant-design/react-native"
import { Text } from "react-native"
import { styles } from "constants"

interface DevTempNavProps {
  showStartCampaignDialog: () => void
  mode: string
  setMode: (mode: string) => void
}

/**
 * Temporary Navigation for Development
 * @param props
 * @constructor
 */
export default ({ mode, setMode, showStartCampaignDialog }: DevTempNavProps) => {
  return (
    <Flex direction="row" justify="center" style={{ padding: 5, backgroundColor: "lightblue" }}>
      <Text style={styles.Body}>Dev Nav: </Text>
      {mode === "homefeed" ? (
        <Button type="ghost" size="small" onPress={() => setMode("onboarding")}>
          Show On-Boarding
        </Button>
      ) : (
        <Button type="ghost" size="small" onPress={() => setMode("homefeed")}>
          Show Home Feed
        </Button>
      )}
      <Button type="ghost" size="small" onPress={() => showStartCampaignDialog()}>
        Show Start Campaign Dialog
      </Button>
    </Flex>
  )
}
