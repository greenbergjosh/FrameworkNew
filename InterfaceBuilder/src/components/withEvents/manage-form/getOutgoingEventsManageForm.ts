import { ComponentDefinition } from "globalTypes"

/**
 *
 * @param WrappedComponent
 */
export function getOutgoingEventsManageForm(WrappedComponent: any): Partial<ComponentDefinition>[] {
  let outgoingEventComponents: Partial<ComponentDefinition>[] = []
  WrappedComponent.availableEvents &&
    WrappedComponent.availableEvents.forEach((availableEvent: string) => {
      outgoingEventComponents = outgoingEventComponents.concat([
        {
          key: `outgoingEventMap.${availableEvent}.type`,
          valueKey: `outgoingEventMap.${availableEvent}.type`,
          component: "select",
          label: availableEvent,
          dataHandlerType: "local",
          defaultValue: "none",
          data: {
            values: [
              {
                label: "None",
                value: "none",
              },
              {
                label: "Simple",
                value: "simple",
              },
              {
                label: "Function",
                value: "lbm",
              },
            ],
          },
        },
        {
          gutter: 8,
          invisible: false,
          hidden: false,
          components: [],
          hideTitle: false,
          valueKey: "",
          label: "",
          hideLabel: true,
          component: "column",
          columns: [
            {
              components: [],
              hideTitle: false,
              span: 3,
            },
            {
              components: [
                {
                  key: `outgoingEventMap.${availableEvent}.simpleMapValue`,
                  valueKey: `outgoingEventMap.${availableEvent}.simpleMapValue`,
                  component: "input",
                  label: "Mapped Event Name",
                  defaultValue: availableEvent,
                  visibilityConditions: {
                    "===": [
                      {
                        var: [`outgoingEventMap.${availableEvent}.type`],
                      },
                      "simple",
                    ],
                  },
                },
                {
                  key: `outgoingEventMap.${availableEvent}.lbmId`,
                  valueKey: `outgoingEventMap.${availableEvent}.lbmId`,
                  label: "Event Mapper Function",
                  component: "select",
                  dataHandlerType: "remote-config",
                  remoteConfigType: "Components.EventMapper.EventMapperFunction",
                  visibilityConditions: {
                    "===": [
                      {
                        var: [`outgoingEventMap.${availableEvent}.type`],
                      },
                      "lbm",
                    ],
                  },
                },
                {
                  key: `outgoingEventMap.${availableEvent}.lbmSrc`,
                  valueKey: `outgoingEventMap.${availableEvent}.lbmSrc`,
                  label: "Event Mapper Function",
                  defaultTheme: "vs-dark",
                  defaultLanguage: "javascript",
                  defaultValue: `
return function({props, lib: { getValue, setValue, raiseEvent }, args}) {
  // Do stuff here
}`,
                  hidden: false,
                  hideLabel: false,
                  component: "code-editor",
                  height: 400,
                  bindable: true,
                  visibilityConditions: {
                    and: [
                      {
                        "===": [
                          {
                            var: [`outgoingEventMap.${availableEvent}.type`],
                          },
                          "lbm",
                        ],
                      },
                      {
                        "!": {
                          var: ["lbmId"],
                        },
                      },
                    ],
                  },
                },
                {
                  key: `outgoingEventMap.${availableEvent}.lbmParameters`,
                  valueKey: `outgoingEventMap.${availableEvent}.lbmParameters`,
                  label: "Mapper Function Parameters",
                  help: "Give additional properties to the event mapper function",
                  component: "data-dictionary",
                  keyLabel: "Property Name",
                  valueComponent: [
                    {
                      hidden: false,
                      maxRows: null,
                      minRows: 1,
                      autosize: true,
                      maxLength: null,
                      valueKey: "value",
                      label: "Value",
                      hideLabel: false,
                      component: "input",
                    },
                  ],
                  defaultValue: [],
                  multiple: true,
                  visibilityConditions: {
                    "===": [
                      {
                        var: [`outgoingEventMap.${availableEvent}.type`],
                      },
                      "lbm",
                    ],
                  },
                },
              ],
              hideTitle: false,
            },
          ],
        },
      ])
    })

  return outgoingEventComponents
}
