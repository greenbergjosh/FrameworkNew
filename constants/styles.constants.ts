import { ImageStyle, StyleProp, TextStyle, ViewStyle } from "react-native"
import { ButtonStyles } from "@ant-design/react-native/es/button/style"

export enum Colors {
  lightgrey = "#F8F8F8",
  medgrey = "#D6D4CD",
  grey = "#707070",
  blue = "#007AFF",
  navy = "#343997",
}
export enum FontWeights {
  light = "300",
  regular = "normal",
  bold = "600",
}
export enum Units {
  margin = 17,
  padding = 10,
  thumbnailSM = 40,
  avatarLG = 80,
  avatarMD = 64,
  avatarSM = 32,
}
export enum ImageUris {
  placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAAANlBMVEXf39+goKDi4uKdnZ2np6e4uLjU1NSamprOzs7KysrExMTj4+PBwcHc3NyoqKiioqKwsLC0tLSjj0KtAAADSklEQVR4nO2b2WKqMBBAA0EjAkL//2fLIMuAigsXeh3OebAVQiWnM9kkrihcITih0HRvhzPqZ/Nb+6IuHA6P3riW27/XnR7KTI/oGxofvHfLo3PdBcM9uQnXgzeHYZcQBzgAAAAAAACAeZg34kDAAQAAaOgXcCDgAAcCDgCgg/YABwIOcCDgAAcCDnAg4AAHAg5wIOAABwIOAABAQ7+AAwEHOBBwgAMBBzgAAIAx9As4EFZ3EC9n7VtcnfywmG+P1TgJfiHh+NeVWEic+GghNhwsCILagTfhoPq8LdjCwdrtjTjwp+zTLiHzVhykH3dvMQ6sOIiuDorj2zhrDs7hXUpnzsHb44QkxsHFsIMy8sFH4akTiQO3hYO1uePA+0Ndq+Jc+nkNjYPIqINj21X+7MaBnzjoFbjsMiuhywUTc6aRA3/I+pNFeOYgtulA1Si77MpB3DtQ4+b4MJcMdh1E2kG+TwdejUj+kzjYfIzkU3WyVFUukwcODI4Tkz4Z4lSFgf85edMOnB4fdJ1jfNSVDmk2WX417CDyVZHVDYREgY6DOizCXhzUUyZf5edDOfqv+yqbrsNvNmf6gzhoqjyZL/mQumkgbDZf+CMHE8prlxmPuoadOWhSYRoIF+O5MCVcl55HgWBsHck9jYO2tB48b+ZgbV5cT6zaMcNRJYOh+cIrDvoBdKaSwZyDeMaB96EvrpJhPw588FU6tEpqaWknDuqhUi1AfxtZTxr81g42+871jgMfqtRNHrlSyWBovvDAQSMgu71gSAZjDtyNA58UdwQ43TMYcnB/zpQ8vCCftgdGHTxWoJJhMwdrczcX6kR4fEWfDKYdzEWBmjxadjCvoA6EVoK5dSQ1RnqioJdgbg0lzrvnlp8qaNJBClpz4E55yyufmEnps61ckNpcNyK8uBtBijXFbTn47HIbDhY9p2rneeX89DFWHNRzRMV4j0q43eaijwUb/cLifSw4sLCWVpXJQspvd8D+xu/g2/dP/gtwgAMBBzgQcIADAQc4EHCAAwEHOBBwgAMAABhDv4ADAQc4EHCAAwEHOACAAdoDHAg4wIGAAxwIOMCBgAMcAMAA7QEOBBzgQMABDgQcAAAAAADAI5gv4AAAen4BZVMuzK5mga8AAAAASUVORK5CYII=",
}

export const styles = {
  H1: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: FontWeights.light,
  } as StyleProp<TextStyle>,
  H2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: FontWeights.light,
    textAlign: "center",
  } as StyleProp<TextStyle>,
  H3: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: FontWeights.regular,
    color: Colors.grey,
  } as StyleProp<TextStyle>,
  Body: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: FontWeights.regular,
    color: Colors.grey,
  } as StyleProp<TextStyle>,
  LinkText: {
    color: Colors.blue,
  } as StyleProp<TextStyle>,
  ErrorText: {
    color: "red",
    paddingTop: Units.padding,
    paddingBottom: Units.padding,
  } as StyleProp<TextStyle>,
  LinkButton: {
    borderWidth: 0,
  } as StyleProp<ViewStyle>,
  Button: {
    minWidth: 200,
  } as StyleProp<ViewStyle>,
  ViewContainer: {
    margin: Units.margin,
    marginTop: Units.padding * 4,
  } as StyleProp<ViewStyle>,
  View: {
    margin: Units.margin,
  } as StyleProp<ViewStyle>,
  SmallCopy: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: FontWeights.regular,
    color: Colors.grey,
  } as StyleProp<TextStyle>,
  BottomButtonBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.lightgrey,
  } as StyleProp<ViewStyle>,
  AvatarLG: {
    width: Units.avatarLG,
    height: Units.avatarLG,
    borderRadius: Units.avatarLG / 2,
    borderColor: Colors.medgrey,
    borderWidth: 1,
  } as StyleProp<ImageStyle>,
  AvatarMD: {
    width: Units.avatarMD,
    height: Units.avatarMD,
    borderRadius: Units.avatarMD / 2,
    borderColor: Colors.medgrey,
    borderWidth: 1,
  } as StyleProp<ImageStyle>,
  AvatarSM: {
    width: Units.avatarSM,
    height: Units.avatarSM,
    borderRadius: Units.avatarSM / 2,
    borderColor: Colors.medgrey,
    borderWidth: 1,
  } as StyleProp<ImageStyle>,
  ThumbnailSM: {
    width: Units.thumbnailSM,
    height: Units.thumbnailSM,
    borderColor: Colors.medgrey,
    borderWidth: 1,
  },
}

export const combineStyles = (a, b) => ({ ...a, ...b })
