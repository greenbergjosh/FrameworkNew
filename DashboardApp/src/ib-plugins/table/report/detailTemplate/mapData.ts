import { DataMappingItem } from "../../../../api/ReportCodecs"
import { JSONRecord } from "../../../../lib/JSONRecord"

export const mapData = (dataMapping: DataMappingItem[], data: JSONRecord) => {
  if (dataMapping) {
    return dataMapping.reduce((acc, { originalKey, mappedKey }) => ({ ...acc, [mappedKey]: acc[originalKey] }), data)
  }
  return data
}

export const unMapData = (dataMapping: DataMappingItem[], data: JSONRecord) => {
  if (dataMapping) {
    return dataMapping.reduce((acc, { originalKey, mappedKey }) => ({ ...acc, [originalKey]: acc[mappedKey] }), data)
  }
  return data
}
