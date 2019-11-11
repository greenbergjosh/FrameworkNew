import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const uploadManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...uploadManageFormDefinition, ...extend)
}

const uploadManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Upload File",
              },
              {
                key: "valueKey",
                defaultValue: "value",
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "uploadUrl",
                valueKey: "uploadUrl",
                component: "input",
                // Testing URL: https://www.mocky.io/v2/5cc8019d300000980a055e76
                defaultValue: "https://",
                label: "Upload URL",
                help: "URL for the service that receives the uploaded file.",
              },
              {
                key: "accept",
                valueKey: "accept",
                component: "select",
                label: "Accept File Type",
                defaultValue: "*",
                dataHandlerType: "local",
                data: {
                  // See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
                  values: [
                    {
                      label: "Any type (*)",
                      value: "*",
                    },
                    {
                      label: "Comma-separated values (csv)",
                      value: "text/csv",
                    },
                    {
                      label: "Images (jpg, png, gif, tiff, etc.)",
                      value: "image/*",
                    },
                    {
                      label: "Microsoft Excel (xls, xlsx)",
                      value:
                        "application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    },
                    {
                      label: "Microsoft PowerPoint (ppt, pptx)",
                      value:
                        "application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    },
                    {
                      label: "Microsoft Word (doc, docx)",
                      value:
                        "application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    },
                    {
                      label: "Adobe Portable Document Format (pdf)",
                      value: "application/pdf",
                    },
                    {
                      label: "ZIP archive",
                      value: "application/zip, application/x-zip-compressed",
                    },
                    {
                      label: "Other (not listed)",
                      value: "other",
                    },
                  ],
                },
              },
              {
                key: "acceptOther",
                valueKey: "acceptOther",
                component: "input",
                defaultValue: "",
                label: "Other Type",
                visibilityConditions: {
                  "===": ["other", { var: "accept" }],
                },
                help:
                  "Enter a filename with wildcards (e.g., *.txt), or a MIME type (e.g., application/pdf)",
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "hideButtonLabel",
                valueKey: "hideButtonLabel",
                component: "toggle",
                defaultValue: false,
                label: "Hide Button Label",
              },
              {
                key: "buttonLabel",
                valueKey: "buttonLabel",
                component: "input",
                defaultValue: "Upload",
                label: "Button Label",
                visibilityConditions: {
                  "===": [false, { var: "hideButtonLabel" }],
                },
              },
            ],
          },
          {
            key: "http-headers",
            component: "tab",
            hideLabel: true,
            label: "HTTP Headers",
            components: [
              {
                key: "editHeaders",
                valueKey: "editHeaders",
                component: "toggle",
                defaultValue: false,
                label: "Edit Headers",
              },
              {
                key: "headers.authorization",
                valueKey: "headers.authorization",
                component: "input",
                defaultValue: "",
                label: "Authorization",
                visibilityConditions: {
                  "===": [true, { var: "editHeaders" }],
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
