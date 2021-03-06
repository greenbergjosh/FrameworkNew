import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const settings = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...numberRangeManageFormDefinition, ...extend)
}

const numberRangeManageFormDefinition: Partial<ComponentDefinition>[] = [
  {
    key: "base",
    components: [
      {
        key: "tabs",
        tabs: [
          {
            key: "data",
            components: [
              {
                key: "label",
                defaultValue: "Number Range",
                bindable: true,
              },
              {
                key: "valueKey",
                hidden: true,
              },
              {
                key: "startKey",
                valueKey: "startKey",
                ordinal: 10,
                component: "input",
                defaultValue: "start",
                label: "Start API Name",
                help: "The name of the lower value field in the API endpoint.",
                bindable: true,
              },
              {
                key: "endKey",
                valueKey: "endKey",
                ordinal: 11,
                component: "input",
                defaultValue: "end",
                label: "End API Name",
                help: "The name of the upper value field in the API endpoint.",
                bindable: true,
              },
              {
                key: "lowerBound",
                valueKey: "lowerBound",
                ordinal: 12,
                component: "number-input",
                label: "Lower Bound",
                help: "The minimum value of the range.",
                bindable: true,
              },
              {
                key: "upperBound",
                valueKey: "upperBound",
                ordinal: 13,
                component: "number-input",
                label: "Upper Bound",
                help: "The minimum value of the range.",
                bindable: true,
              },
              {
                key: "defaultRangeValueType",
                valueKey: "defaultRangeValueType",
                ordinal: 15,
                component: "select",
                label: "Default Range Value",
                help: "The initial value of the range",
                defaultValue: "full",
                dataHandlerType: "local",
                bindable: true,
                data: {
                  values: [
                    { label: "No Value", value: "none" },
                    { label: "Full Range", value: "full" },
                    { label: "Customize Default", value: "partial" },
                  ],
                },
              },
              {
                key: "defaultRangeLowerValue",
                valueKey: "defaultRangeLowerValue",
                ordinal: 16,
                component: "number-input",
                label: "Default Lower Value",
                help: "The default value of the lower value.",
                bindable: true,
                visibilityConditions: {
                  "===": [
                    "partial",
                    {
                      var: ["defaultRangeValue"],
                    },
                  ],
                },
              },
              {
                key: "defaultRangeUpperValue",
                valueKey: "defaultRangeUpperValue",
                ordinal: 17,
                component: "number-input",
                label: "Default Upper Value",
                help: "The default value of the upper value.",
                bindable: true,
                visibilityConditions: {
                  "===": [
                    "partial",
                    {
                      var: ["defaultRangeValue"],
                    },
                  ],
                },
              },
              {
                key: "marks",
                valueKey: "marks",
                label: "Value Labels",
                help: "Give custom labels to certain values",
                component: "data-map",
                defaultValue: [],
                multiple: true,
                bindable: true,
                keyComponent: {
                  label: "Value",
                  component: "number-input",
                  valueKey: "value",
                },
                valueComponent: {
                  label: "Label",
                  component: "input",
                  valueKey: "label",
                },
              },
              {
                key: "useWrapperObject",
                valueKey: "useWrapperObject",
                ordinal: 30,
                component: "checkbox",
                defaultValue: false,
                label: "Use API Wrapper Object",
                help: "Whether to send the start and end values as two separate values or contained in an object.",
                bindable: true,
              },
              {
                key: "wrapperObjectKey",
                valueKey: "wrapperObjectKey",
                ordinal: 31,
                component: "input",
                defaultValue: "range",
                label: "Wrapper Object API Name",
                help: "The name of the wrapper object field in the API endpoint.",
                bindable: true,
                visibilityConditions: {
                  "===": [
                    true,
                    {
                      var: ["useWrapperObject"],
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
