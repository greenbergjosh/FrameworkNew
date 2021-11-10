import { ComponentDefinition } from "../../../globalTypes"

export const eventsManageFormDefinition: Partial<ComponentDefinition>[] = [
  {
    key: "events",
    component: "tab",
    hideLabel: true,
    label: "Events",
    components: [
      {
        key: "eventTabs",
        component: "tabs",
        hideLabel: true,
        tabs: [
          {
            key: "outgoing",
            component: "tab",
            hideLabel: true,
            label: "Outgoing Events",
            components: [],
          },
          {
            key: "incoming",
            component: "tab",
            hideLabel: true,
            label: "Incoming Events",
            components: [
              {
                invisible: false,
                hidden: false,
                hasLastItemComponents: false,
                hasInitialRecord: false,
                emptyText: "No EventHandlers",
                addItemLabel: "Add Event Handler",
                valueKey: "incomingEventHandlers",
                label: "Event Handlers",
                hideLabel: false,
                component: "ordered-list",
                components: [
                  {
                    size: "default",
                    invisible: false,
                    hidden: false,
                    maxLength: null,
                    valueKey: "eventName",
                    label: "Event Name",
                    hideLabel: false,
                    component: "input",
                  },
                  {
                    key: "handlerFunctionSrc",
                    valueKey: "handlerFunctionSrc",
                    label: "Handler Function",
                    defaultTheme: "vs-dark",
                    defaultLanguage: "javascript",
                    defaultValue: `return function({props, lib: { getValue, setValue, raiseEvent }, args}) {
  // Do stuff here
}`,
                    hidden: false,
                    hideLabel: false,
                    component: "code-editor",
                    height: 200,
                    width: "90%",
                    showMinimap: false,
                    bindable: true,
                  },
                  {
                    invisible: false,
                    hidden: false,
                    keyLabel: "Parameter Name",
                    valueKey: "handlerFunctionParameters",
                    label: "Handler Parameters",
                    hideLabel: false,
                    component: "data-dictionary",
                    valueComponent: [
                      {
                        size: "default",
                        invisible: false,
                        hidden: false,
                        maxLength: null,
                        valueKey: "value",
                        label: "Parameter Value",
                        hideLabel: true,
                        component: "input",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]
