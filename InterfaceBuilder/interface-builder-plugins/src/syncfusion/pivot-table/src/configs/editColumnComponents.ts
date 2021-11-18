import { ComponentDefinition } from "@opg/interface-builder"

export const editColumnComponents: ComponentDefinition[] = [
  /* *****************************************
   *
   *  COLUMNS
   */
  {
    key: "columns-title",
    handlerFunctionSrc:
      "return function({props, lib: { getValue, setValue, raiseEvent }, args}) {\n  // Do stuff here\n}",
    style: "&.container {}",
    center: false,
    headerSize: "4",
    closable: false,
    banner: false,
    description: "",
    showIcon: false,
    textType: "text",
    invisible: false,
    hidden: false,
    stringTemplate: "Columns",
    valueKey: "data",
    label: "Text",
    hideLabel: true,
    component: "text",
    getRootUserInterfaceData: () => void 0,
    onChangeRootData: () => void 0,
    incomingEventHandlers: [],
    outgoingEventMap: {},
    components: [],
  },
  {
    key: "columns",
    valueKey: "columns",
    label: "Columns",
    hideLabel: true,
    addItemLabel: "Add Column",
    component: "list",
    emptyText: "No Configured Columns",
    orientation: "horizontal",
    preconfigured: true,
    getRootUserInterfaceData: () => void 0,
    onChangeRootData: () => void 0,
    incomingEventHandlers: [],
    outgoingEventMap: {},
    components: [
      {
        key: "column",
        component: "container",
        label: "Column",
        hideLabel: true,
        preconfigured: true,
        size: "small",
        style: "&.container { padding: 5px; margin: -5px; background-color: white; }",
        components: [
          {
            key: "name",
            valueKey: "name",
            label: "Name",
            component: "input",
            size: "small",
          },
          {
            key: "caption",
            valueKey: "caption",
            label: "Caption",
            component: "input",
            size: "small",
          },
        ],
      },
    ],
  },

  /* *****************************************
   *
   *  ROWS
   */
  {
    key: "rows-title",
    handlerFunctionSrc:
      "return function({props, lib: { getValue, setValue, raiseEvent }, args}) {\n  // Do stuff here\n}",
    style: "&.container {}",
    center: false,
    headerSize: "4",
    closable: false,
    banner: false,
    description: "",
    showIcon: false,
    textType: "text",
    invisible: false,
    hidden: false,
    stringTemplate: "Rows",
    valueKey: "data",
    label: "Text",
    hideLabel: true,
    component: "text",
    getRootUserInterfaceData: () => void 0,
    onChangeRootData: () => void 0,
    incomingEventHandlers: [],
    outgoingEventMap: {},
    components: [],
  },
  {
    key: "rows",
    valueKey: "rows",
    label: "Rows",
    hideLabel: true,
    addItemLabel: "Add Row",
    component: "list",
    emptyText: "No Configured Rows",
    orientation: "vertical",
    preconfigured: true,
    getRootUserInterfaceData: () => void 0,
    onChangeRootData: () => void 0,
    incomingEventHandlers: [],
    outgoingEventMap: {},
    components: [
      {
        key: "row",
        component: "container",
        label: "Row",
        hideLabel: true,
        preconfigured: true,
        size: "small",
        style: "&.container { padding: 5px; margin: -5px; background-color: white; }",
        components: [
          {
            key: "name",
            valueKey: "name",
            label: "Name",
            component: "input",
            size: "small",
          },
          {
            key: "caption",
            valueKey: "caption",
            label: "Caption",
            component: "input",
            size: "small",
          },
        ],
      },
    ],
  },

  /* *****************************************
   *
   *  COLLAPSE
   */
  {
    key: "collapse-title",
    handlerFunctionSrc:
      "return function({props, lib: { getValue, setValue, raiseEvent }, args}) {\n  // Do stuff here\n}",
    style: "&.container {}",
    center: false,
    headerSize: "4",
    closable: false,
    banner: false,
    description: "",
    showIcon: false,
    textType: "text",
    invisible: false,
    hidden: false,
    stringTemplate: "Other Settings",
    valueKey: "data",
    label: "Text",
    hideLabel: true,
    component: "text",
    getRootUserInterfaceData: () => void 0,
    onChangeRootData: () => void 0,
    incomingEventHandlers: [],
    outgoingEventMap: {},
    marginBottom: 5,
    components: [],
  },
  {
    key: "collapse",
    handlerFunctionSrc:
      "return function({props, lib: { getValue, setValue, raiseEvent }, args}) {\n  // Do stuff here\n}",
    style: "&.container {}",
    invisible: false,
    hidden: false,
    components: [],
    accordion: true,
    bordered: true,
    valueKey: "",
    label: "Collapse",
    hideLabel: true,
    getRootUserInterfaceData: () => void 0,
    onChangeRootData: () => void 0,
    incomingEventHandlers: [],
    outgoingEventMap: {},
    component: "collapse",
    sections: [
      {
        title: "Values",
        extra: [
          {
            handlerFunctionSrc: "",
            style: "&.container {}",
            invisible: false,
            hidden: false,
            icon: "question-circle",
            valueKey: "icon",
            hideLabel: true,
            classNames: ["container"],
            component: "icon",
            tooltip:
              "Collection of OLAP cube elements (such as Measures, Calculated Measures) that needs to be displayed as aggregated numeric values in the pivot table.",
            components: [],
          },
        ],
        components: [
          /* *****************************************
           *
           *  VALUES
           */
          {
            key: "values",
            valueKey: "values",
            label: "Values",
            hideLabel: true,
            addItemLabel: "Add Value",
            component: "list",
            emptyText: "No Configured Values",
            orientation: "vertical",
            preconfigured: true,
            components: [
              {
                key: "value",
                component: "container",
                label: "Value",
                hideLabel: true,
                preconfigured: true,
                size: "small",
                style: "&.container { padding: 5px; margin: -5px; background-color: white; }",
                components: [
                  {
                    key: "name",
                    valueKey: "name",
                    label: "Name",
                    component: "input",
                    size: "small",
                  },
                  {
                    key: "caption",
                    valueKey: "caption",
                    label: "Caption",
                    component: "input",
                    size: "small",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        title: "Filters",
        extra: [
          {
            handlerFunctionSrc: "",
            style: "&.container {}",
            invisible: false,
            hidden: false,
            icon: "question-circle",
            valueKey: "icon",
            hideLabel: true,
            classNames: ["container"],
            component: "icon",
            tooltip:
              "Collection of OLAP cube elements (such as Hierarchies and Calculated Members) that would act as master filter over the data bound in row, column and value axes of the pivot table.",
            components: [],
          },
        ],
        components: [
          /* *****************************************
           *
           *  FILTERS
           */
          {
            key: "filters",
            valueKey: "filters",
            label: "Filters",
            hideLabel: true,
            addItemLabel: "Add Filter",
            component: "list",
            emptyText: "No Configured Filters",
            orientation: "vertical",
            preconfigured: true,
            components: [
              {
                key: "filter",
                component: "container",
                label: "Filter",
                hideLabel: true,
                preconfigured: true,
                size: "small",
                style: "&.container { padding: 5px; margin: -5px; background-color: white; }",
                components: [
                  {
                    key: "name",
                    valueKey: "name",
                    label: "Name",
                    component: "input",
                    size: "small",
                  },
                  {
                    key: "caption",
                    valueKey: "caption",
                    label: "Caption",
                    component: "input",
                    size: "small",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        title: "Format",
        extra: [
          {
            handlerFunctionSrc: "",
            style: "&.container {}",
            invisible: false,
            hidden: false,
            icon: "question-circle",
            valueKey: "icon",
            hideLabel: true,
            classNames: ["container"],
            component: "icon",
            tooltip:
              "Formatting defines a way in which values should be displayed in pivot table. For example, format “C0” denotes the values should be displayed in currency pattern without decimal points.",
            components: [],
          },
        ],
        components: [
          /* *****************************************
           *
           *  FORMAT SETTINGS
           */
          {
            key: "formatSettings",
            valueKey: "formatSettings",
            label: "Format",
            hideLabel: true,
            addItemLabel: "Add Format",
            component: "list",
            emptyText: "No Configured Formats",
            orientation: "vertical",
            preconfigured: true,
            components: [
              {
                key: "format",
                component: "container",
                label: "Format",
                hideLabel: true,
                preconfigured: true,
                size: "small",
                style: "&.container { padding: 5px; margin: -5px; background-color: white; }",
                components: [
                  {
                    key: "name",
                    valueKey: "name",
                    label: "Name",
                    component: "input",
                    size: "small",
                  },
                  {
                    key: "format",
                    valueKey: "format",
                    label: "Formats",
                    component: "input",
                    size: "small",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        title: "Calculated Fields",
        extra: [
          {
            handlerFunctionSrc: "",
            style: "&.container {}",
            invisible: false,
            hidden: false,
            icon: "question-circle",
            valueKey: "icon",
            hideLabel: true,
            classNames: ["container"],
            component: "icon",
            tooltip:
              "The calculated field allows user to insert or add a new calculated field based on the available OLAP cube elements from the bound data source. Calculated fields are nothing but customized dimensions or measures that are newly created based on the user-defined expression.",
            components: [],
          },
        ],
        components: [
          /* *****************************************
           *
           *  CALCULATED FIELD SETTINGS
           */
          {
            key: "calculatedFieldSettings",
            valueKey: "calculatedFieldSettings",
            label: "Calculated Field",
            hideLabel: true,
            addItemLabel: "Add Calculated Field",
            component: "list",
            emptyText: "No Configured Calculated Fields",
            orientation: "vertical",
            preconfigured: true,
            components: [
              {
                key: "calculatedField",
                component: "container",
                label: "Calculated Field",
                hideLabel: true,
                preconfigured: true,
                size: "small",
                style: "&.container { padding: 5px; margin: -5px; background-color: white; }",
                components: [
                  {
                    key: "name",
                    valueKey: "name",
                    label: "Name",
                    component: "input",
                    size: "small",
                  },
                  {
                    key: "formula",
                    valueKey: "formula",
                    label: "Formula",
                    component: "input",
                    size: "small",
                  },
                  {
                    key: "hierarchyUniqueName",
                    valueKey: "hierarchyUniqueName",
                    label: "Hierarchy Unique Name",
                    component: "input",
                    size: "small",
                  },
                  {
                    key: "formatString",
                    valueKey: "formatString",
                    label: "Format String",
                    component: "input",
                    size: "small",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        title: "Filter Settings",
        components: [
          /* *****************************************
           *
           *  FILTER SETTINGS
           */
          {
            key: "filterSettings",
            valueKey: "filterSettings",
            label: "Filter",
            hideLabel: true,
            addItemLabel: "Add Filter",
            component: "list",
            emptyText: "No Configured Filter",
            orientation: "vertical",
            preconfigured: true,
            components: [
              {
                key: "filter",
                component: "container",
                label: "Filter",
                hideLabel: true,
                preconfigured: true,
                size: "small",
                style: "&.container { padding: 5px; margin: -5px; background-color: white; }",
                components: [
                  {
                    key: "name",
                    valueKey: "name",
                    label: "Name",
                    component: "input",
                    size: "small",
                  },
                  {
                    handlerFunctionSrc:
                      "return function({props, lib: { getValue, setValue, raiseEvent }, args}) {\n  // Do stuff here\n}",
                    style: "&.container {}",
                    maxRows: null,
                    minRows: null,
                    commaPlaceholder: "Enter items separated by commas",
                    newlinePlaceholder: "Enter each item on a line by itself",
                    autosize: true,
                    invisible: false,
                    hidden: false,
                    itemSeparator: "newline",
                    valueKey: "items",
                    label: "Items (one per row)",
                    hideLabel: false,
                    component: "bulk-text-input",
                  },
                  {
                    key: "levelCount",
                    valueKey: "levelCount",
                    label: "Level Count",
                    component: "number-input",
                    defaultValue: 0,
                    size: "small",
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
