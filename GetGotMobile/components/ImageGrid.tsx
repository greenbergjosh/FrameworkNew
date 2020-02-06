import { FlatList, Image, TouchableOpacity, View, Text } from "react-native"
import { Colors } from "constants"
import React from "react"
import { Flex, Icon, WhiteSpace } from "@ant-design/react-native"
import { H2, H3 } from "./Markup"

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
      <TouchableOpacity onPress={onPress} activeOpacity={0.5}>
        <Image
          source={image.source}
          style={{
            aspectRatio: 1,
            // flexGrow: 1,
            // flexShrink: 0,
            backgroundColor: Colors.screenBackground,
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

interface AddImagesProps {
  onAddPhoto: () => void
}

function AddImage({ onAddPhoto }) {
  return (
    <TouchableOpacity
      onPress={onAddPhoto}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: 4,
        flex: 1,
        aspectRatio: 1,
        borderStyle: "dashed",
        borderColor: Colors.bodyText,
        borderWidth: 1,
      }}>
      <Icon name="plus" size="lg" style={{ color: Colors.link }} />
      <H3 style={{ color: Colors.link }}>Add Photo</H3>
      <WhiteSpace />
    </TouchableOpacity>
  )
}

interface GridShimsProps {
  imageCount: number
  cols: number
  hasAddImage: boolean
}

function GridShims({ imageCount, cols, hasAddImage = false }: GridShimsProps) {
  const [needShims, shims] = React.useMemo(() => {
    const adjustedItemsCount = hasAddImage ? imageCount + 1 : imageCount
    const numLastRowItems = adjustedItemsCount % cols
    const shimCount = cols - numLastRowItems
    const needShims = shimCount > 0 && shimCount < cols
    const shims = []
    for (let i = 0; i < shimCount; i++) {
      shims.push(<GridShim key={`grid-shim-${i}`} />)
    }
    return [needShims, shims]
  }, [imageCount, cols, hasAddImage])

  return <>{needShims ? shims : null}</>
}

interface ImageGridProps {
  images: ImageType[]
  onItemPress: (...args: any[]) => void
  cols?: number
  onAddPhoto?: () => void
}

export function ImageGrid({ images, onItemPress, onAddPhoto, cols = 3 }: ImageGridProps) {
  const lastIdx = images.length - 1
  const showAddImage = !!onAddPhoto
  return (
    <FlatList
      data={images}
      keyExtractor={(item: ImageType) => item.id}
      renderItem={({ item, index }) => (
        <>
          <GridImage image={item} onPress={() => onItemPress(item.id)} />
          {index === lastIdx || lastIdx === -1 ? (
            <>
              {showAddImage ? <AddImage onAddPhoto={onAddPhoto} /> : null}
              <GridShims imageCount={images.length} hasAddImage={showAddImage} cols={cols} />
            </>
          ) : null}
        </>
      )}
      ListEmptyComponent={() =>
        showAddImage ? (
          <Flex>
            <AddImage onAddPhoto={onAddPhoto} />
            <GridShims imageCount={0} cols={cols} hasAddImage={showAddImage} />
          </Flex>
        ) : null
      }
      numColumns={cols}
    />
  )
}
