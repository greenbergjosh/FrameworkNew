import { FlatList, Image, ScrollView, TouchableOpacity, View } from "react-native"
import { FeedItemType } from "./mockData"
import { Colors } from "constants"
import React from "react"

function FeedImage({ src, id, onPress }) {
  return (
    <View
      style={{
        margin: 3,
        borderColor: Colors.grey,
        borderWidth: 1,
        flex: 1,
      }}>
      <TouchableOpacity onPress={onPress}>
        <Image source={{ uri: src }} style={{ flex: 1, height: 120 }} />
      </TouchableOpacity>
    </View>
  )
}

export function FeedGrid({ feed, onPress }) {
  return (
    <ScrollView>
      <FlatList
        data={feed}
        keyExtractor={(item: FeedItemType) => item.id.toString()}
        renderItem={({ item }) => (
          <FeedImage src={item.uri} id={item.id} onPress={() => onPress(item.id)} />
        )}
        numColumns={3}
      />
    </ScrollView>
  )
}
