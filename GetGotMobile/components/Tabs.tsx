import React from "react"
import { H3 } from "components/Markup"
import { Colors, styles } from "styles"
import { NavigationState, Route, TabBar, TabView } from "react-native-tab-view"
import { Dimensions } from "react-native"
import { Badge } from "components/Badge"
import { Flex } from "@ant-design/react-native"

export interface TabProps extends React.PropsWithChildren<unknown> {
  title: string
  route: string
  badge?: number | string
}

export const Tab = ({ title, route, children, badge }: TabProps) => {
  return <>{children}</>
}

export interface TabsProps {
  stateRouteName: string
  children: React.ReactElement<TabProps>[]
  swipeEnabled?: boolean
}

/**
 * Finds the index of the Tab corresponding to the current react-navigation-tabs route
 * @param tabChildren
 * @param stateRouteName Value from props.navigation.state.routeName
 */
function getInitialIndex(tabChildren: React.ReactElement<TabProps>[], stateRouteName): number {
  const activeTabIndex = tabChildren.findIndex((tab) => tab.props.route === stateRouteName)
  return activeTabIndex || 0
}

/**
 * Converts a Tab array to react-native-tab-view Route array
 * Example return value:
 * [
 *    { key: routes.Explore.UserFollowsMutual, title: "Mutual" },
 *    { key: routes.Explore.UserFollowsFollowers, title: "Followers" },
 *    { key: routes.Explore.UserFollowsInfluencers, title: "Following" },
 * ]
 * @param tabChildren
 */
function getInitialRoutes(tabChildren: React.ReactElement<TabProps>[]): Route[] {
  return tabChildren.map((tab) => {
    return { key: tab.props.route, title: tab.props.title, badge: tab.props.badge }
  })
}

/**
 * Returns the element wrapped in Tab corresponding to the currently selected tab
 * @param tabChildren
 */
const getActiveTabLayout = (tabChildren: React.ReactElement<TabProps>[]) => ({
  route,
}): React.ReactNode => {
  return tabChildren.find((tab) => tab.props.route === route.key)
}

const TabLabel = ({ route, focused, color }) => (
  <Flex direction="row">
    <H3
      style={{
        color: focused ? Colors.link : Colors.bodyText,
        paddingRight: 5,
      }}>
      {route.title}
    </H3>
    {route.badge ? <Badge text={route.badge} /> : null}
  </Flex>
)

/**
 * Styled version of react-native-tab-view
 * Example use:
 * <Tabs>
 *  <Tab title="Mutual" route={routes.Explore.UserFollowsMutual}>
 *    <InfluencersList navigate={navigate} routes={influencerFeedRoutes} />
 *  </Tab>
 * </Tabs>
 * @param stateRouteName Value from props.navigation.state.routeName
 * @param swipeEnabled
 * @param children
 * @constructor
 */
export function Tabs({ stateRouteName, swipeEnabled = true, children }: TabsProps) {
  const initialState: NavigationState<any> = {
    index: getInitialIndex(children, stateRouteName),
    routes: getInitialRoutes(children),
  }

  const [currentTab, setCurrentTab] = React.useState(initialState)

  const customTabBar = (props) => (
    <TabBar
      {...props}
      style={{ backgroundColor: Colors.navBarBackground }}
      indicatorStyle={{ backgroundColor: Colors.link }}
      renderLabel={TabLabel}
      labelStyle={[styles.H3, { color: Colors.bodyTextEmphasis, textTransform: "capitalize" }]}
    />
  )

  return (
    <TabView
      navigationState={currentTab}
      swipeEnabled={swipeEnabled}
      renderScene={React.useMemo(() => getActiveTabLayout(children), [children])}
      renderTabBar={React.useMemo(() => customTabBar, [])}
      onIndexChange={(index) => setCurrentTab({ ...currentTab, index })}
      initialLayout={{ width: Dimensions.get("window").width }}
    />
  )
}
