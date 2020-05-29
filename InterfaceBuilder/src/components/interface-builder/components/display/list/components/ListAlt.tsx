/* NOTE:
 * This is a draft that Patrick started when he wrote this component.
*/
/*
  <br />
  <ComponentRenderer
    components={finalComponents}
    mode="edit"
    data={data.map((item: any, index: number) =>
      item
        ? unwrapped
          ? {
              // @ts-ignore (valueKey doesn't technically exist on the props)
              [finalComponents[index].valueKey]: item,
            }
          : item
        : {}
    )}
    onChangeData={(newData) =>
      (console.log("ListInterfaceComponent.render", "onChangeData", {
        data,
        newData,
      }),
      0) ||
      (onChangeData &&
        onChangeData(
          set(
            valueKey,
            unwrapped
              ? newData.map((item: any) => Object.values(item)[0])
              : newData,
            userInterfaceData
          )
        ))
    }
    onChangeSchema={(newSchema) => {
      console.warn(
        "ListInterfaceComponent.render",
        "TODO: Cannot alter schema inside ComponentRenderer in List.",
        { newSchema }
      )
    }}
  />
*/
