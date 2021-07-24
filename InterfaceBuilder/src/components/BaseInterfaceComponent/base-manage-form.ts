import { ComponentDefinition } from "../../globalTypes"
import { hydrateDefinition } from "./componentDefinitionUtils"

/**
 * extendBaseManageForm
 *
 * Example use...
 * export const buttonManageForm = (...extend: Partial<ComponentDefinition>[]): ComponentDefinition[] => {
 *   return baseManageForm(...buttonManageFormDefinition, ...extend)
 * }
 * @param overrideDefinitions
 */
export const baseManageForm = (...overrideDefinitions: Partial<ComponentDefinition>[]): ComponentDefinition[] => {
  return overrideDefinitions.length
    ? hydrateDefinition(overrideDefinitions, baseComponentDefinition)
    : baseComponentDefinition
}

const baseComponentDefinition: ComponentDefinition[] = [
  {
    key: "base",
    component: "form",
    getRootUserInterfaceData: () => void 0,
    onChangeRootData: () => void 0,
    incomingEventHandlers: [],
    outgoingEventMap: {},
    components: [
      {
        key: "tabs",
        defaultActiveKey: "data",
        component: "tabs",
        tabs: [
          {
            key: "data",
            component: "tab",
            hideLabel: true,
            label: "Data",
            components: [
              {
                key: "name",
                valueKey: "name",
                component: "input",
                label: "Name",
                bindable: true,
              },
              {
                key: "hideLabel",
                valueKey: "hideLabel",
                ordinal: 0,
                component: "toggle",
                defaultValue: false,
                label: "Hide Label",
                help: "Whether or not to hide the label of this field.",
                bindable: true,
              },
              {
                key: "label",
                valueKey: "label",
                ordinal: 0.1,
                component: "input",
                label: "Label",
                bindable: true,
                visibilityConditions: {
                  "!==": [
                    true,
                    {
                      var: ["hideLabel"],
                    },
                  ],
                },
              },
              {
                key: "valueKey",
                valueKey: "valueKey",
                ordinal: 2,
                component: "input",
                label: "API Key",
                help: "The API property name to use for this input component.",
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            component: "tab",
            hideLabel: true,
            label: "Appearance",
            components: [
              {
                key: "hidden",
                valueKey: "hidden",
                ordinal: 10,
                component: "toggle",
                label: "Disable",
                help: "Do not render and block behavior.",
                defaultValue: false,
                bindable: true,
              },
              {
                key: "invisible",
                valueKey: "invisible",
                ordinal: 10,
                component: "toggle",
                label: "Invisible",
                help: "Do not display but otherwise behave as normal.",
                defaultValue: false,
                bindable: true,
              },
            ],
          },
          {
            key: "style",
            component: "tab",
            hideLabel: true,
            label: "Style",
            components: [
              {
                key: "instructions",
                center: false,
                headerSize: "h2",
                closable: false,
                banner: false,
                description: "",
                showIcon: true,
                textType: "info",
                invisible: false,
                hidden: false,
                stringTemplate: `Write SCSS class styles below. Available CSS class names: {$.classNames}. Classes in the root must be prefixed with "&".`,
                valueKey: "",
                label: "Text",
                hideLabel: true,
                component: "text",
                components: [],
                visibilityConditions: {
                  "!!": {
                    var: ["classNames"],
                  },
                },
              },
              {
                key: "not-supported",
                center: false,
                headerSize: "h2",
                closable: false,
                banner: false,
                description: "",
                showIcon: true,
                textType: "warning",
                invisible: false,
                hidden: false,
                stringTemplate: `This component does not yet support styles.`,
                valueKey: "",
                label: "Text",
                hideLabel: true,
                component: "text",
                components: [],
                visibilityConditions: {
                  "!": {
                    var: ["classNames"],
                  },
                },
              },
              {
                key: "style",
                valueKey: "style",
                label: "SCSS",
                defaultTheme: "vs-dark",
                defaultLanguage: "scss",
                hidden: false,
                hideLabel: true,
                component: "code-editor",
                height: 200,
                bindable: true,
                visibilityConditions: {
                  "!!": {
                    var: ["classNames"],
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
