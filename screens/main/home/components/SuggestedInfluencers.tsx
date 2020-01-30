import React from "react"
import { ActivityIndicator, Carousel, Flex, WhiteSpace } from "@ant-design/react-native"
import { ScrollView, Text, View } from "react-native"
import { influencerFeedRoutes, routes, styles, Units } from "constants"
import { carouselStyles } from "./styles"
import Avatar from "components/Avatar"
import { H2, H3, SMALL } from "components/Markup"
import { FollowsScreenProps } from "../../follows/FollowsScreen"
import { InfluencersList } from "components/InfluencersList"
import TouchImage from "components/TouchImage"
import { FollowButton } from "components/FollowButton"
import { useFollowsContext } from "data/contextProviders/follows.contextProvider"

interface SuggestedInfluencersProps {
  navigate: FollowsScreenProps["navigation"]["navigate"]
}

export default (props: SuggestedInfluencersProps) => {
  const { navigate } = props
  const followsContext = useFollowsContext()
  const { suggestedInfluencers } = followsContext

  if (
    !followsContext.lastLoadSuggestedInfluencers &&
    !followsContext.loading.loadSuggestedInfluencers[JSON.stringify([])]
  ) {
    followsContext.loadSuggestedInfluencers()
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  return (
    <>
      <View style={{ margin: Units.margin }}>
        <H2>Welcome to GetGot</H2>
        <WhiteSpace size="lg" />
        <H3 style={[{ textAlign: "center" }]}>
          When you follow people, you&rsquo;ll see the products and services that they recommend.
        </H3>
        <WhiteSpace size="xl" />
        <WhiteSpace size="xl" />
        <Carousel afterChange={this.onHorizontalSelectedIndexChange}>
          {suggestedInfluencers.slice(0, 3).map((influencer) => (
            <View style={carouselStyles.carouselHorizontal} key={influencer.userId}>
              <Flex direction="column" align="center">
                <Avatar
                  source={influencer.avatarUri}
                  size="lg"
                  onPress={() => navigate(routes.Explore.UserFeed, { id: influencer.userId })}
                />
                <H2>{influencer.handle}</H2>
                <WhiteSpace size="sm" />
                <Text style={styles.Body}>{influencer.bio}</Text>
                <WhiteSpace size="xl" />
                <FollowButton onPress={() => alert("Follow feature to come")} />
                <WhiteSpace size="xl" />
                <SMALL>{influencer.statusPhrase.template}</SMALL>
                <WhiteSpace size="lg" />
                <Flex direction="row" justify="center" style={{ width: "100%" }}>
                  {influencer.feed.map((post, index, ary) => (
                    <TouchImage
                      key={index}
                      uri={post.image.source.uri}
                      size="img64"
                      onPress={() =>
                        navigate(influencerFeedRoutes.FeedDetails, {
                          postId: "9860b273-a4ec-493c-b0fa-da8ab13def6f",
                        })
                      }
                      style={{ marginLeft: 2.5, marginRight: 2.5 }}
                    />
                  ))}
                </Flex>
              </Flex>
            </View>
          ))}
        </Carousel>
      </View>
      <View style={styles.SubHeader}>
        <Text style={styles.Body}>OTHER PEOPLE TO FOLLOW</Text>
      </View>
      <InfluencersList
        influencers={suggestedInfluencers.slice(3)}
        navigate={navigate}
        routes={influencerFeedRoutes}
        isRecommended={true}
      />
      <ScrollView />
    </>
  )
}
