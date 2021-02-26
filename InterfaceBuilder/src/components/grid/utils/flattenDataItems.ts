/**
 *
 * @param data
 */
export const flattenDataItems = (data: any[] | { items: any[] } | any) => {
  if (Array.isArray(data) || Array.isArray(data.items)) {
    return (Array.isArray(data) ? data : data.items).flatMap(flattenDataItems)
  }
  return data
}
