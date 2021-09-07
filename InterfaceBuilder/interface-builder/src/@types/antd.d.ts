import { ColumnProps } from "antd/lib/table/interface"

declare module "antd/lib/table/interface" {
  export interface ColumnProps<T> {
    filterDropdown?: (params: {
      clearFilters: () => void
      confirm: () => void
      filters: Array<{ text: string; value: string }>
      selectedKeys: string[]
      setSelectedKeys: (keys: string[]) => void
    }) => React.ReactNode
  }
}
