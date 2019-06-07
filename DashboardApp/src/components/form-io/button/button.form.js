import baseEditForm from "../base.form"

export default function(...extend) {
  return baseEditForm(
    [
      {
        type: "select",
        key: "action",
        label: "Action",
        input: true,
        dataSrc: "values",
        weight: 110,
        tooltip: "This is the action to be performed by this button.",
        data: {
          values: [
            { label: "Submit", value: "submit" },
            { label: "Event", value: "event" },
            { label: "Custom", value: "custom" },
            { label: "Reset", value: "reset" },
          ],
        },
      },
      {
        type: "checkbox",
        input: true,
        inputType: "checkbox",
        key: "showValidations",
        label: "Show Validations",
        weight: 115,
        tooltip: "When the button is pressed, show any validation errors on the form.",
        conditional: {
          json: { "!==": [{ var: "data.action" }, "submit"] },
        },
      },
      {
        type: "textfield",
        label: "Button Event",
        key: "event",
        input: true,
        weight: 120,
        tooltip: "The event to fire when the button is clicked.",
        conditional: {
          json: { "===": [{ var: "data.action" }, "event"] },
        },
      },

      {
        type: "textarea",
        key: "custom",
        label: "Button Custom Logic",
        tooltip: "The custom logic to evaluate when the button is clicked.",
        rows: 5,
        editor: "ace",
        input: true,
        weight: 120,
        placeholder: "data['mykey'] = data['anotherKey'];",
        conditional: {
          json: { "===": [{ var: "data.action" }, "custom"] },
        },
      },
      {
        type: "select",
        key: "theme",
        label: "Theme",
        input: true,
        tooltip: "The color theme of this button.",
        dataSrc: "values",
        weight: 140,
        data: {
          values: [
            { label: "Default", value: "default" },
            { label: "Primary", value: "primary" },
            { label: "Info", value: "info" },
            { label: "Success", value: "success" },
            { label: "Danger", value: "danger" },
            { label: "Warning", value: "warning" },
          ],
        },
      },
      {
        type: "select",
        key: "size",
        label: "Size",
        input: true,
        tooltip: "The size of this button.",
        dataSrc: "values",
        weight: 150,
        data: {
          values: [
            { label: "Extra Small", value: "xs" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
      },
      {
        type: "textfield",
        key: "leftIcon",
        label: "Left Icon",
        input: true,
        placeholder: "Enter icon classes",
        tooltip: "This is the full icon class string to show the icon. Example: 'fa fa-plus'",
        weight: 160,
      },
      {
        type: "textfield",
        key: "rightIcon",
        label: "Right Icon",
        input: true,
        placeholder: "Enter icon classes",
        tooltip: "This is the full icon class string to show the icon. Example: 'fa fa-plus'",
        weight: 170,
      },
      {
        type: "checkbox",
        key: "block",
        label: "Block",
        input: true,
        weight: 610,
        tooltip: "This control should span the full width of the bounding container.",
      },
      {
        type: "checkbox",
        key: "disableOnInvalid",
        label: "Disable on Form Invalid",
        tooltip: "This will disable this field if the form is invalid.",
        input: true,
        weight: 620,
      },
    ],
    ...extend
  )
}
