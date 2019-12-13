import React from "react"
import { Button, Carousel, Flex, Icon, WhiteSpace } from "@ant-design/react-native"
import { Image, Text, View } from "react-native"
import { Influencer } from "api/onboarding-services"
import { routes, styles } from "constants"
import { carouselStyles } from "./styles"
import Avatar from "components/Avatar"
import { H2, H3, P, SMALL } from "components/Markup"
import { FollowsScreenProps } from "../../follows/FollowsScreen"
import { influencerFeedRoutes } from "../../feedRoutes"
import { InfluencersList } from "components/follows"

interface SuggestedFollowsProps {
  value: Influencer[]
  navigate: FollowsScreenProps["navigation"]["navigate"]
}

export default (props: SuggestedFollowsProps) => {
  const { value, navigate } = props
  if (!value) {
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
        {value.map((influencer) => (
          <View style={carouselStyles.carouselHorizontal} key={influencer.userId}>
            <Flex direction="column" align="center">
              <Avatar
                source={influencer.avatar}
                size="lg"
                onPress={() => navigate(routes.Explore.UserFeed, { id: influencer.userId })}
              />
              <H2>{influencer.name}</H2>
              <WhiteSpace size="sm" />
              <Text style={styles.Body}>{influencer.description}</Text>
              <WhiteSpace size="xl" />
              <Button type="primary" size="small" style={{ maxWidth: 92 }}>
                <Icon name="plus" size="xs" color="#fff" /> Follow
              </Button>
              <WhiteSpace size="xl" />
              <SMALL>{influencer.source}</SMALL>
              <WhiteSpace size="lg" />
              <Flex direction={"row"} justify={"between"} style={{ width: 226 }}>
                {influencer.feedImages.map((imgUri, index, ary) => (
                  <Image source={{ uri: imgUri }} style={{ width: 73, height: 73 }} key={index} />
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
