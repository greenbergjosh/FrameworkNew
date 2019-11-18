import moment from "moment"
import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { Button, Carousel, Flex, Icon, Toast, WhiteSpace } from "@ant-design/react-native"
import { ScrollView, Text, View, StyleSheet, Image } from "react-native"
import { HeaderLogo } from "components/HeaderLogo"
import { useAuthContext } from "providers/auth-context-provider"
import { useFeedContext } from "providers/feed-context-provider"
import { SettingsDrawerContext } from "../settings/SettingsDrawer"
import { Colors, styles } from "constants"

const fpoImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAAANlBMVEXf39+goKDi4uKdnZ2np6e4uLjU1NSamprOzs7KysrExMTj4+PBwcHc3NyoqKiioqKwsLC0tLSjj0KtAAADSklEQVR4nO2b2WKqMBBAA0EjAkL//2fLIMuAigsXeh3OebAVQiWnM9kkrihcITih0HRvhzPqZ/Nb+6IuHA6P3riW27/XnR7KTI/oGxofvHfLo3PdBcM9uQnXgzeHYZcQBzgAAAAAAACAeZg34kDAAQAAaOgXcCDgAAcCDgCgg/YABwIOcCDgAAcCDnAg4AAHAg5wIOAABwIOAABAQ7+AAwEHOBBwgAMBBzgAAIAx9As4EFZ3EC9n7VtcnfywmG+P1TgJfiHh+NeVWEic+GghNhwsCILagTfhoPq8LdjCwdrtjTjwp+zTLiHzVhykH3dvMQ6sOIiuDorj2zhrDs7hXUpnzsHb44QkxsHFsIMy8sFH4akTiQO3hYO1uePA+0Ndq+Jc+nkNjYPIqINj21X+7MaBnzjoFbjsMiuhywUTc6aRA3/I+pNFeOYgtulA1Si77MpB3DtQ4+b4MJcMdh1E2kG+TwdejUj+kzjYfIzkU3WyVFUukwcODI4Tkz4Z4lSFgf85edMOnB4fdJ1jfNSVDmk2WX417CDyVZHVDYREgY6DOizCXhzUUyZf5edDOfqv+yqbrsNvNmf6gzhoqjyZL/mQumkgbDZf+CMHE8prlxmPuoadOWhSYRoIF+O5MCVcl55HgWBsHck9jYO2tB48b+ZgbV5cT6zaMcNRJYOh+cIrDvoBdKaSwZyDeMaB96EvrpJhPw588FU6tEpqaWknDuqhUi1AfxtZTxr81g42+871jgMfqtRNHrlSyWBovvDAQSMgu71gSAZjDtyNA58UdwQ43TMYcnB/zpQ8vCCftgdGHTxWoJJhMwdrczcX6kR4fEWfDKYdzEWBmjxadjCvoA6EVoK5dSQ1RnqioJdgbg0lzrvnlp8qaNJBClpz4E55yyufmEnps61ckNpcNyK8uBtBijXFbTn47HIbDhY9p2rneeX89DFWHNRzRMV4j0q43eaijwUb/cLifSw4sLCWVpXJQspvd8D+xu/g2/dP/gtwgAMBBzgQcIADAQc4EHCAAwEHOBBwgAMAABhDv4ADAQc4EHCAAwEHOACAAdoDHAg4wIGAAxwIOMCBgAMcAMAA7QEOBBzgQMABDgQcAAAAAADAI5gv4AAAen4BZVMuzK5mga8AAAAASUVORK5CYII="

const mockInfluencers = [
  {
    userId: 1,
    name: "loren",
    avatar: fpoImage,
    description: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
    source: "From your contacts",
    feedImages: [fpoImage, fpoImage, fpoImage],
  },
  {
    userId: 2,
    name: "snoren",
    avatar: fpoImage,
    description: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
    source: "From your contacts",
    feedImages: [fpoImage, fpoImage, fpoImage],
  },
  {
    userId: 3,
    name: "boren",
    avatar: fpoImage,
    description: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
    source: "From your contacts",
    feedImages: [fpoImage, fpoImage, fpoImage],
  },
]

const carouselStyles = StyleSheet.create({
  carouselHorizontal: {
    borderWidth: 1,
    borderColor: Colors.medgrey,
    padding: 16,
    paddingBottom: 3,
    marginBottom: 32,
    marginRight: "auto",
    marginLeft: "auto",
    width: 235,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
})

interface HomeFeedScreenProps extends NavigationStackScreenProps {}

export const HomeFeedScreen = (props: HomeFeedScreenProps) => {
  const { navigate } = props.navigation
  const feed = useFeedContext()

  React.useEffect(() => {
    if (
      !feed.lastLoadHomeFeed ||
      moment(feed.lastLoadHomeFeed).isBefore(moment().subtract(5, "minutes"))
    ) {
      feed.loadHomeFeed()
    }
  }, [feed.lastLoadHomeFeed])

  return (
    <>
      {/*****************************************
       * Temporary Navigation for Development
       */}
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

      {/*****************************************
       * No Follows View
       */}
      <ScrollView>
        <View style={styles.View}>
          <Text style={styles.H2}>Welcome to GetGot</Text>
          <WhiteSpace size="lg" />
          <Text style={[styles.H3, { textAlign: "center" }]}>
            When you follow people, you&rsquo;ll see the products and services that they recommend.
          </Text>
          <WhiteSpace size="xl"/>
          <WhiteSpace size="xl"/>
          <Carousel afterChange={this.onHorizontalSelectedIndexChange}>
            {mockInfluencers.map((influencer) => (
              <View style={carouselStyles.carouselHorizontal} key={influencer.userId}>
                <Flex direction="column" align="center">
                  <Image source={{ uri: influencer.avatar }} style={styles.Avatar} />
                  <Text style={styles.H2}>{influencer.name}</Text>
                  <WhiteSpace size="sm" />
                  <Text style={styles.Body}>{influencer.description}</Text>
                  <WhiteSpace size="xl" />
                  <Button type="primary" size="small" style={{ maxWidth: 92 }}>
                    <Icon name="plus" size="md" color="#fff" /> Follow
                  </Button>
                  <WhiteSpace size="xl" />
                  <Text style={styles.SmallCopy}>{influencer.source}</Text>
                  <WhiteSpace size="lg" />
                  <Flex direction={"row"} justify={"between"} style={{ width: 226 }}>
                    {influencer.feedImages.map((imgUri, index) => (
                      <Image
                        source={{ uri: imgUri }}
                        style={{ width: 73, height: 73 }}
                        key={index}
                      />
                    ))}
                  </Flex>
                </Flex>
              </View>
            ))}
          </Carousel>
        </View>
      </ScrollView>
    </>
  )
}

HomeFeedScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: () => (
      <SettingsDrawerContext.Consumer>
        {({ open, toggle }) => (
          <Button onPress={() => toggle()} style={{ backgroundColor: "#343997", borderWidth: 0 }}>
            <Icon name="menu" size="md" color="#fff" />
          </Button>
        )}
      </SettingsDrawerContext.Consumer>
    ),
    headerTitle: () => <HeaderLogo />,
    headerRight: () => (
      <Button
        onPress={() => navigation.navigate("Messages")}
        style={{ backgroundColor: "#343997", borderWidth: 0 }}>
        <Icon name="mail" color="#fff" size="md" />
      </Button>
    ),
  }
}
