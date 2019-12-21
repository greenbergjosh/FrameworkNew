import React from "react"
import { Button, Carousel, Flex, Icon, WhiteSpace } from "@ant-design/react-native"
import { Image, Text, View } from "react-native"
import { Influencer } from "api/onboarding-services"
import { influencerFeedRoutes, routes, styles, Units } from "constants"
import { carouselStyles } from "./styles"
import Avatar from "components/Avatar"
import { H2, H3, SMALL } from "components/Markup"
import { FollowsScreenProps } from "../../follows/FollowsScreen"
import { InfluencersList } from "components/follows"
import TouchImage from "../../../../components/TouchImage"

interface SuggestedFollowsProps {
  influencers: Influencer[]
  navigate: FollowsScreenProps["navigation"]["navigate"]
}

export default (props: SuggestedFollowsProps) => {
  const { influencers, navigate } = props
  if (!influencers) {
    return null
  }
  return (
    <View style={styles.View}>
      <H2>Welcome to GetGot</H2>
      <WhiteSpace size="lg" />
      <H3 style={[{ textAlign: "center" }]}>
        When you follow people, you&rsquo;ll see the products and services that they recommend.
      </H3>
      <WhiteSpace size="xl" />
      <WhiteSpace size="xl" />
      <Carousel afterChange={this.onHorizontalSelectedIndexChange}>
        {influencers.map((influencer) => (
          <View style={carouselStyles.carouselHorizontal} key={influencer.userId}>
            <Flex direction="column" align="center">
              <Avatar
                source={influencer.avatarUri}
                size="lg"
                onPress={() => navigate(routes.Explore.UserFeed, { id: influencer.userId })}
              />
              <H2>{influencer.handle}</H2>
              <WhiteSpace size="sm" />
              <Text style={styles.Body}>{influencer.description}</Text>
              <WhiteSpace size="xl" />
              <Button type="primary" size="small" style={{ maxWidth: 92 }}>
                <Icon name="plus" size="xs" color="#fff" /> Follow
              </Button>
              <WhiteSpace size="xl" />
              <SMALL>{influencer.source}</SMALL>
              <WhiteSpace size="lg" />
              <Flex direction="row" justify="center" style={{ width: "100%" }}>
                {influencer.feed.map((feedItem, index, ary) => (
                  <TouchImage
                    key={index}
                    uri={feedItem.image.source.uri}
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
      <InfluencersList navigate={navigate} routes={influencerFeedRoutes} isRecommended={true} />
    </View>
  )
}
