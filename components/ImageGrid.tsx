import { FlatList, Image, ScrollView, TouchableOpacity, View } from "react-native"
import { Colors } from "constants"
import React from "react"

interface GridImageProps {
  image: ImageType
  onPress: (...args: any[]) => void
}

function GridImage({ image, onPress }: GridImageProps) {
  return (
    <View
      style={{
        margin: 3,
        borderColor: Colors.border,
        borderWidth: 1,
        flex: 1,
        aspectRatio: 1,
        // display: "flex",
        // flexDirection: "row",
        // justifyContent: "flex-start",
        // alignContent: "stretch",
        // alignItems: "stretch",
      }}>
      <TouchableOpacity onPress={onPress}>
        <Image
          source={{ uri: image.source.uri }}
          style={{
            aspectRatio: 1,
            // flexGrow: 1,
            // flexShrink: 0,
          }}
        />
      </TouchableOpacity>
    </View>
  )
}

function GridShim() {
  return (
    <View
      style={{
        margin: 4,
        flex: 1,
        aspectRatio: 1,
      }}
    />
  )
}

interface ImageGridProps {
  images: ImageType[]
  onItemPress: (...args: any[]) => void
  cols?: number
}

export function ImageGrid({ images, onItemPress, cols = 3 }: ImageGridProps) {
  const hasRemainder = images.length % cols === 1
  const lastIdx = images.length - 1
  return (
    <FlatList
      data={images}
      keyExtractor={(item: ImageType) => item.id}
      renderItem={({ item, index }) => (
        <>
          <GridImage image={item} onPress={() => onItemPress(item.id)} />
          {index === lastIdx && hasRemainder ? <GridShim /> : null}
        </>
      )}
      numColumns={cols}
    />
  )
}
