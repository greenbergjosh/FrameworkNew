import React from "react"
import { Flex, Icon, List, WhiteSpace } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { ScrollView, Text, View } from "react-native"
import { routes, styles } from "constants"

interface DevMenuScreenProps extends NavigationTabScreenProps {}

function NavItem({ keyName, route, navigate }) {
  const getTitle = (str) => (str.includes(".") ? str.split(".")[1] : str)
  return (
    <List.Item>
      <Flex>
        <Icon name="file" />
        {keyName === "default" ? (
          <>
            <Text style={styles.LinkText} onPress={() => navigate(route)}>
              {" Default "}
            </Text>
            <Text style={styles.SmallCopy}>({getTitle(route)})</Text>
          </>
        ) : (
          <>
            <Text style={styles.LinkText} onPress={() => navigate(route)}>
              {" "}
              {getTitle(route)}
            </Text>
            <Text style={styles.SmallCopy}>{keyName === "default" ? " (default)" : null}</Text>
          </>
        )}
      </Flex>
    </List.Item>
  )
}

function Section({ section, navigate }) {
  const sectionRoutes = routes[section]

  return (
    <>
      <WhiteSpace size="xl" />
      <List renderHeader={section}>
        <>
          {typeof sectionRoutes === "string" ? (
            <NavItem
              key={sectionRoutes}
              keyName={sectionRoutes}
              route={sectionRoutes}
              navigate={navigate}
            />
          ) : (
            Object.keys(sectionRoutes).map((key) => (
              <NavItem key={key} keyName={key} route={sectionRoutes[key]} navigate={navigate} />
            ))
          )}
        </>
      </List>
    </>
  )
}

export class DevMenuScreen extends React.Component<DevMenuScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Dev Menu" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <View style={{ padding: 32, paddingTop: 80, paddingBottom: 80 }}>
        <Text style={styles.H2}>Dev Menu</Text>
        <WhiteSpace size="xl" />
        <ScrollView>
          {/* ROOT SECTIONS */}
          <Section section="Landing" navigate={navigate} />
          <Section section="Authentication" navigate={navigate} />
          <Section section="OnBoarding" navigate={navigate} />
          <Section section="Main" navigate={navigate} />
          <Section section="Legal" navigate={navigate} />

          {/* MAIN SECTION */}
          <Section section="Home" navigate={navigate} />
          <Section section="Explore" navigate={navigate} />
          <Section section="Promotions" navigate={navigate} />
          <Section section="Follows" navigate={navigate} />
          <Section section="Profile" navigate={navigate} />
          <Section section="Messages" navigate={navigate} />
          <Section section="Settings" navigate={navigate} />

          <WhiteSpace size="xl" />
        </ScrollView>
      </View>
    )
  }
}
