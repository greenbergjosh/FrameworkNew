import { Config } from "react-awesome-query-builder"
import AntdConfig from "react-awesome-query-builder/lib/config/antd"
import schema from "../signal-data/schema"

const InitialConfig = AntdConfig // or BasicConfig

export const config: Config = {
  ...InitialConfig,
  fields: {
    ...InitialConfig.fields,
    ...schema,
  },
}
