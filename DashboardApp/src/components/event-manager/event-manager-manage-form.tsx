import { ComponentDefinition } from "@opg/interface-builder"

export const eventManagerManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                component: "repeater",
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
                    size: "default",
                    allowClear: false,
                    placeholder: null,
                    invisible: false,
                    hidden: false,
                    createNewLabel: "Create New...",
                    allowCreateNew: false,
                    remoteQueryMapping: [
                      {
                        label: "label",
                        value: "",
                      },
                      {
                        label: "value",
                        value: "",
                      },
                    ],
                    data: {
                      values: [],
                    },
                    dataHandlerType: "remote-config",
                    multiple: false,
                    valueKey: "handlerFunctionId",
                    label: "Handler Function",
                    hideLabel: false,
                    component: "select",
                    remoteConfigType: "45d3cad9-863d-4b36-8836-90b4f937180e",
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
