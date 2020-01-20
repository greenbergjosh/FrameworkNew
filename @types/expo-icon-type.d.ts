import AntIcons from "@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/AntDesign.json"
// import EntypoIcons from "@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Entypo.json"
import Ionicons from "@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json"

type AntIconNames = keyof typeof AntIcons

/*
Too many types in the ExpoIconType union throws TS2509,
so we're just including the used icons since we're
only using one icon from Entypo.
 */
type EntypoIconNames = "shopping-bag"

type IoniconsNames = keyof typeof Ionicons

type ExpoIconType = AntIconNames | EntypoIconNames | IoniconsNames
