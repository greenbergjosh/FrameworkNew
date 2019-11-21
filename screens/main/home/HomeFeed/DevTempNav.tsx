import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { Button, Flex, Toast } from "@ant-design/react-native"
import { styles } from "constants"

interface DevTempNavProps extends NavigationStackScreenProps {}

/**
 * Temporary Navigation for Development
 * @param props
 * @constructor
 */
export default (props: DevTempNavProps) => {
  const { navigate } = props.navigation

  return (
    <Flex direction="row" justify="around" style={styles.View}>
      <Button size="small" onPress={() => navigate("ExploreUserFeed", { name: "Loren" })}>
        Jump To User
      </Button>
      <Button size="small" onPress={() => navigate("ExploreCampaign", { name: "Loren" })}>
        Jump To Campaign
      </Button>
      <Button size="small" onPress={() => Toast.info("This is a Home screen toast")}>
        Show Home
      </Button>
    </Flex>
  )
}
