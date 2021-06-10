import { ComponentDefinition } from "../../../globalTypes"
import { baseManageForm } from "../../../components/BaseInterfaceComponent/base-manage-form"

export const modalManageForm = (...extend: Partial<ComponentDefinition>[]): ComponentDefinition[] => {
  return baseManageForm(...ModalManageFormDefinition, ...extend)
}

const ModalManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                hidden: true,
                bindable: true,
              },
              {
                key: "hideLabel",
                hidden: true,
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "modalData",
                bindable: true,
              },
              {
                key: "showKey",
                valueKey: "showKey",
                component: "input",
                defaultValue: "showModal",
                label: "Show Key",
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "title",
                valueKey: "title",
                component: "input",
                defaultValue: "Edit Item",
                label: "Modal Title",
                bindable: true,
              },
              {
                key: "width",
                valueKey: "width",
                component: "input",
                label: "Width",
                bindable: true,
              },
              {
                key: "closable",
                valueKey: "closable",
                label: "Closable",
                help: 'Show an "X" close button on the upper right of the modal.',
                component: "toggle",
                defaultValue: true,
                bindable: true,
              },
              {
                key: "mask",
                valueKey: "mask",
                label: "Mask",
                component: "toggle",
                defaultValue: true,
                bindable: true,
              },
              {
                key: "destroyOnClose",
                valueKey: "destroyOnClose",
                label: "Destroy on Close",
                component: "toggle",
                defaultValue: true,
                bindable: true,
              },
            ],
          },
          {
            key: "style",
            components: [
              {
                key: "modalStyleInstructions",
                center: false,
                headerSize: "h2",
                closable: false,
                banner: false,
                description:
                  "Write React.CSSProperties styles below. Property names must be surrounded by double-quotes.",
                showIcon: true,
                textType: "info",
                invisible: false,
                hidden: false,
                stringTemplate: "Modal Style",
                valueKey: "",
                label: "Text",
                hideLabel: true,
                component: "text",
                marginTop: 20,
                components: [],
              },
              {
                key: "modalStyle",
                valueKey: "modalStyle",
                label: "Modal Style",
                defaultTheme: "vs-dark",
                defaultLanguage: "json",
                defaultValue: "{}",
                hidden: false,
                hideLabel: true,
                component: "code-editor",
                height: 200,
                bindable: true,
              },
              {
                key: "bodyStyleInstructions",
                center: false,
                headerSize: "h2",
                closable: false,
                banner: false,
                description:
                  "Write React.CSSProperties styles below. Property names must be surrounded by double-quotes.",
                showIcon: true,
                textType: "info",
                invisible: false,
                hidden: false,
                stringTemplate: "Body Style",
                valueKey: "",
                label: "Text",
                hideLabel: true,
                component: "text",
                marginTop: 20,
                components: [],
              },
              {
                key: "bodyStyle",
                valueKey: "bodyStyle",
                label: "Body Style",
                defaultTheme: "vs-dark",
                defaultLanguage: "json",
                defaultValue: "{}",
                hidden: false,
                hideLabel: true,
                component: "code-editor",
                height: 200,
                bindable: true,
              },
              {
                key: "maskStyleInstructions",
                center: false,
                headerSize: "h2",
                closable: false,
                banner: false,
                description:
                  "Write React.CSSProperties styles below. Property names must be surrounded by double-quotes.",
                showIcon: true,
                textType: "info",
                invisible: false,
                hidden: false,
                stringTemplate: "Mask Style",
                valueKey: "",
                label: "Text",
                hideLabel: true,
                component: "text",
                marginTop: 20,
                components: [],
              },
              {
                key: "maskStyle",
                valueKey: "maskStyle",
                label: "Mask Style",
                defaultTheme: "vs-dark",
                defaultLanguage: "json",
                defaultValue: "{}",
                hidden: false,
                hideLabel: true,
                component: "code-editor",
                height: 200,
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
