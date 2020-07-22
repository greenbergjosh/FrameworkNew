export interface Codec {
  type: string
  join: JoinerType
  split: SplitterType
}

type JoinStrategyType = (
  previousValue: string,
  currentValue: string,
  currentIndex: number,
  array: string[]
) => string
type SplitStrategyType = (value: string) => string[]
type SplitterType = (value: string) => string[]
type JoinerType = (value: string[]) => string

export enum separator {
  newline = "newline",
  comma = "comma",
}

const newline: Codec = {
  type: separator.newline,
  join: getJoiner(joinWithNewline),
  split: getSplitter(splitByNewline),
}

const comma: Codec = {
  type: separator.comma,
  join: getJoiner(joinWithComma),
  split: getSplitter(splitByComma),
}

export function getCodec(type: separator): Codec {
  switch (type) {
    case separator.comma:
      return comma
    default:
      return newline
  }
}

function joinWithNewline(joined: string, item: string) {
  return `${joined}\n${item}`
}

function joinWithComma(joined: string, item: string) {
  if (item.length === 0) {
    return `${joined},`
  }
  return `${joined}, ${item}`
}

function splitByNewline(value: string) {
  return value.split("\n")
}

function splitByComma(value: string) {
  return value.split(/\s*,|\s*,\s/)
}

function getJoiner(joinStrategy: JoinStrategyType): JoinerType {
  return function (value: string[]): string {
    if (typeof value === "undefined") {
      return ""
    }
    if (Array.isArray(value)) {
      return value.reduce(joinStrategy)
    }
    return ""
  }
}

function getSplitter(splitStrategy: SplitStrategyType): SplitterType {
  return function (value: string): string[] {
    return splitStrategy(value).map((item: string) => item.trimStart())
  }
}
