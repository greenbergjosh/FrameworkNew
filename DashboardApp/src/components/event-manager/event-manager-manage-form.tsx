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
                key: `incomingEventHandlers`,
                valueKey: `incomingEventHandlers`,
                label: "Incoming Events",
                help: "Provide handlers for incoming events",
                component: "data-dictionary",
                keyLabel: "Event Name",
                valueComponent: [
                  {
                    label: "Handler Function",
                    component: "select",
                    dataHandlerType: "remote-config",
                    remoteConfigType: "Components.EventMapper.EventHandlerFunction",
                  },
                ],
                defaultValue: [],
                multiple: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
