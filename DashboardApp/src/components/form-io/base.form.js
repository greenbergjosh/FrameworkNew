import baseEditForm from "formiojs/components/base/Base.form"

export default function(...extend) {
  return baseEditForm(
    [
      {
        key: "display",
        components: [
          {
            key: "labelPosition",
            ignore: true,
          },
          {
            key: "persistent",
            ignore: true,
          },
          {
            key: "multiple",
            ignore: true,
          },
          {
            key: "reorder",
            ignore: true,
          },
          {
            key: "protected",
            ignore: true,
          },
          {
            key: "mask",
            ignore: true,
          },
        ],
      },
    ],
    ...extend
  )
}
