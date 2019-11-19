type ISO8601String = string
type Base64EncodedImage = string
type GUID = string

declare module "react-native-masonry-list"

type FSA<
  Type extends string = unknown,
  PayloadType = unknown,
  ErrorType = unknown,
  MetaType = unknown
> = {
  type: Type
  payload?: PayloadType
  error?: ErrorType
  meta?: MetaType
}
