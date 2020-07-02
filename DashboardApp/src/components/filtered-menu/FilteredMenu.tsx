import { Button, Input, Menu, Typography } from "antd"
import FlexSearch, { Index, SearchResults } from "flexsearch"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { get } from "lodash/fp"
import * as React from "react"

export interface FilteredMenuProps<T> {
  data: T[]
  inputStyle?: JSONObject
  inputClassName?: string
  labelAccessor: string | ((dataItem: T) => string)
  menuStyle?: JSONObject
  onSelect?: (dataItem: T | null) => unknown
  placeholder?: string
  resultLimit?: number
  selected?: T | null
  valueAccessor: string | ((dataItem: T) => string)
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const FilteredMenu = <T extends {} = any>({
  data,
  inputStyle,
  inputClassName,
  labelAccessor,
  menuStyle,
  onSelect,
  placeholder = "Search...",
  resultLimit = 15,
  selected,
  valueAccessor,
}: FilteredMenuProps<T>) => {
  const { valueToDataItemMap, searchDB } = React.useMemo(() => {
    const valueToDataItemMap = new Map<string, T>()
    const searchDB: Index<T> = FlexSearch.create({ profile: "speed", tokenize: "full" })

    data.forEach((dataItem) => {
      const value = access(valueAccessor, dataItem)
      const label = access(labelAccessor, dataItem)
      valueToDataItemMap.set(value, dataItem)
      searchDB.add(value, label)
    })

    return { valueToDataItemMap, searchDB }
  }, [data, labelAccessor, valueAccessor])

  const [filterInput, setFilterInput] = React.useState("")
  const [results, setSearchResults] = React.useState<T[]>([])

  React.useEffect(() => {
    const resultsPromise = filterInput
      ? Promise.resolve(searchDB.search(filterInput, resultLimit)).then((ids) =>
          ids
            ? (((ids as unknown) as string[]).map((id) => id && valueToDataItemMap.get(id)).filter((i) => i) as T[])
            : ([] as T[])
        )
      : Promise.resolve(data.slice(0, resultLimit))

    console.log("FilteredMenu.useEffect", { resultsPromise })
    resultsPromise.then((results) => setSearchResults(results))
  }, [data, filterInput, resultLimit])

  console.log("FilteredMenu.render", { results })
  const selectedValue = selected && access(valueAccessor, selected)

  return (
    <>
      <Input
        style={inputStyle}
        className={inputClassName}
        placeholder={placeholder}
        onChange={(e) => setFilterInput(e.target.value)}
        allowClear={true}
      />
      <Typography.Text type="secondary" ellipsis={true}>
        Selected:&nbsp;
        {get(labelAccessor as string, selected)}
        {selected && (
          <Button
            type="link"
            shape="circle"
            size="small"
            icon="close-circle"
            onClick={() => {
              onSelect && onSelect(null)
            }}
          />
        )}
      </Typography.Text>
      <Menu
        style={menuStyle}
        onClick={({ key }) => {
          const dataItem = valueToDataItemMap.get(key)
          console.log("FilteredMenu.onClick", key, dataItem)
          onSelect && onSelect(typeof dataItem !== "undefined" ? dataItem : null)
        }}
        selectedKeys={selectedValue ? [selectedValue] : []}>
        {results &&
          results.map((item) => <Menu.Item key={access(valueAccessor, item)}>{access(labelAccessor, item)}</Menu.Item>)}
      </Menu>
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/ban-types
const access = <T extends {}>(accessor: FilteredMenuProps<T>["valueAccessor"], item: T) =>
  typeof accessor === "string" ? get(accessor, item) : typeof accessor === "function" ? accessor(item) : null
