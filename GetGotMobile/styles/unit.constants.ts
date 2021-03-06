export enum AntIconSizes {
  // 12
  xxs = 14,
  xs = 16,
  sm = 18,
  md = 24,
  lg = 32,
  // 64
}
export type ImgSizeType =
  | "img16"
  | "img20"
  | "img24"
  | "img32"
  | "img40"
  | "img64"
  | "img80"
  | "img128"
  | number
export enum Units {
  margin = 17,
  padding = 10,
  minTouchArea = 40,
  img16 = 16,
  img20 = 20,
  img24 = 24,
  img32 = 32,
  img40 = 40,
  img64 = 64,
  img80 = 80,
  img128 = 128,
  thumb90 = 90,
  disabledOpacity = 0.3,
}
export enum FontWeights {
  light = "300",
  regular = "normal",
  bold = "600",
}
export enum Colors {
  childBackground = "#F7F6F5",
  screenBackground = "#EFEEEB",
  bodyText = "#707070",
  bodyTextEmphasis = "#000000",
  border = "#D6D4CD",
  divider = "#F0EEE7",
  ggNavy = "#343997",
  highlight = "#007AFF1A",
  link = "#007AFF",
  navBarBackground = "#F8F8F8",
  navBarText = "#999999",
  warning = "#FE3C32",
  success = "#4CD964",
  reverse = "#FFFFFF",
  archived = "#3D71A3",
}
export enum ImageUris {
  placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAAANlBMVEXf39+goKDi4uKdnZ2np6e4uLjU1NSamprOzs7KysrExMTj4+PBwcHc3NyoqKiioqKwsLC0tLSjj0KtAAADSklEQVR4nO2b2WKqMBBAA0EjAkL//2fLIMuAigsXeh3OebAVQiWnM9kkrihcITih0HRvhzPqZ/Nb+6IuHA6P3riW27/XnR7KTI/oGxofvHfLo3PdBcM9uQnXgzeHYZcQBzgAAAAAAACAeZg34kDAAQAAaOgXcCDgAAcCDgCgg/YABwIOcCDgAAcCDnAg4AAHAg5wIOAABwIOAABAQ7+AAwEHOBBwgAMBBzgAAIAx9As4EFZ3EC9n7VtcnfywmG+P1TgJfiHh+NeVWEic+GghNhwsCILagTfhoPq8LdjCwdrtjTjwp+zTLiHzVhykH3dvMQ6sOIiuDorj2zhrDs7hXUpnzsHb44QkxsHFsIMy8sFH4akTiQO3hYO1uePA+0Ndq+Jc+nkNjYPIqINj21X+7MaBnzjoFbjsMiuhywUTc6aRA3/I+pNFeOYgtulA1Si77MpB3DtQ4+b4MJcMdh1E2kG+TwdejUj+kzjYfIzkU3WyVFUukwcODI4Tkz4Z4lSFgf85edMOnB4fdJ1jfNSVDmk2WX417CDyVZHVDYREgY6DOizCXhzUUyZf5edDOfqv+yqbrsNvNmf6gzhoqjyZL/mQumkgbDZf+CMHE8prlxmPuoadOWhSYRoIF+O5MCVcl55HgWBsHck9jYO2tB48b+ZgbV5cT6zaMcNRJYOh+cIrDvoBdKaSwZyDeMaB96EvrpJhPw588FU6tEpqaWknDuqhUi1AfxtZTxr81g42+871jgMfqtRNHrlSyWBovvDAQSMgu71gSAZjDtyNA58UdwQ43TMYcnB/zpQ8vCCftgdGHTxWoJJhMwdrczcX6kR4fEWfDKYdzEWBmjxadjCvoA6EVoK5dSQ1RnqioJdgbg0lzrvnlp8qaNJBClpz4E55yyufmEnps61ckNpcNyK8uBtBijXFbTn47HIbDhY9p2rneeX89DFWHNRzRMV4j0q43eaijwUb/cLifSw4sLCWVpXJQspvd8D+xu/g2/dP/gtwgAMBBzgQcIADAQc4EHCAAwEHOBBwgAMAABhDv4ADAQc4EHCAAwEHOACAAdoDHAg4wIGAAxwIOMCBgAMcAMAA7QEOBBzgQMABDgQcAAAAAADAI5gv4AAAen4BZVMuzK5mga8AAAAASUVORK5CYII=",
}
interface iImages {
  placeholder: ImageType
}
export const Images: iImages = {
  placeholder: {
    id: "placeholder",
    source: { uri: ImageUris.placeholder },
    dimensions: {
      width: 259,
      height: 194,
    },
  },
}
