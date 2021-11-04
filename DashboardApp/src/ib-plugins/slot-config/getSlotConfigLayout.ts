import { ComponentDefinition, UserInterfaceProps } from "@opg/interface-builder"

export function getSlotConfigLayout(
  getRootUserInterfaceData: () => UserInterfaceProps["data"],
  onChangeRootData: (newData: UserInterfaceProps["data"]) => void,
  providerType: string,
  actionType: string
): ComponentDefinition[] {
  return [
    {
      key: "slot-config",
      valueKey: "data",
      component: "list",
      orientation: "horizontal",
      interleave: "round-robin",
      getRootUserInterfaceData,
      onChangeRootData,
      incomingEventHandlers: [],
      outgoingEventMap: {},
      components: [
        {
          key: "provider",
          valueKey: "provider",
          component: "card",
          components: [
            {
              key: "slot-config-guid",
              valueKey: "value",
              component: "select",
              dataHandlerType: "remote-config",
              remoteConfigType: providerType,
              valuePrefix: "@",
            },
          ],
        },
        {
          key: "slot-config-action",
          valueKey: "value",
          component: "select",
          dataHandlerType: "remote-kvp",
          remoteKeyValuePair: actionType,
        },
      ],
    },
  ]
}
