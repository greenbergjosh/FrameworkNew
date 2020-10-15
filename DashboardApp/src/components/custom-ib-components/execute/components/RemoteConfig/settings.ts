export const remoteConfigSettings = [
  {
    center: false,
    headerSize: "4",
    textType: "title",
    invisible: false,
    hidden: false,
    stringTemplate: "Remote Config Settings",
    useTokens: false,
    valueKey: "data",
    label: "Text",
    hideLabel: true,
    component: "text",
    marginBottom: 20,
    components: [],
    visibilityConditions: {
      and: [
        {
          "===": [
            "remote-config",
            {
              var: ["queryType"],
            },
          ],
        },
      ],
    },
  },
  {
    key: "RemoteConfig_queryConfigId",
    valueKey: "RemoteConfig_queryConfigId",
    label: "Remote Config Query",
    component: "select",
    dataHandlerType: "remote-config",
    remoteConfigType: "Report.Query",
    visibilityConditions: {
      and: [
        {
          "===": [
            "remote-config",
            {
              var: ["queryType"],
            },
          ],
        },
      ],
    },
  },
  {
    key: "RemoteConfig_actionType",
    valueKey: "RemoteConfig_actionType",
    label: "Operation",
    component: "select",
    dataHandlerType: "local",
    defaultValue: "fetch",
    data: {
      values: [
        {
          label: "Read Config",
          value: "fetch",
        },
        {
          label: "Create Config",
          value: "create",
        },
        {
          label: "Update Config",
          value: "update",
        },
        {
          label: "Delete Config",
          value: "delete",
        },
      ],
    },
    visibilityConditions: {
      "==": [
        {
          var: ["queryType"],
        },
        "remote-config",
      ],
    },
  },

  {
    key: "RemoteConfig_resultsType",
    valueKey: "RemoteConfig_resultsType",
    label: "Expected Result",
    component: "select",
    dataHandlerType: "local",
    defaultValue: "all",
    data: {
      values: [
        {
          label: "All Configs of a Type",
          value: "all",
        },
        {
          label: "A Config that the User Selects (from another control)",
          value: "selected",
        },
        {
          label: "A Specific Config",
          value: "static",
        },
      ],
    },
    visibilityConditions: {
      and: [
        {
          "==": [
            {
              var: ["queryType"],
            },
            "remote-config",
          ],
        },
        {
          "==": [
            {
              var: ["RemoteConfig_actionType"],
            },
            "fetch",
          ],
        },
      ],
    },
  },
  {
    key: "RemoteConfig_entityTypeId",
    valueKey: "RemoteConfig_entityTypeId",
    label: "Config Type",
    component: "select",
    dataHandlerType: "remote-config",
    remoteConfigType: "EntityType",
    visibilityConditions: {
      and: [
        {
          "==": [
            {
              var: ["queryType"],
            },
            "remote-config",
          ],
        },
        {
          or: [
            {
              "==": [
                {
                  var: ["RemoteConfig_actionType"],
                },
                "update",
              ],
            },
            {
              "==": [
                {
                  var: ["RemoteConfig_actionType"],
                },
                "delete",
              ],
            },
            {
              "==": [
                {
                  var: ["RemoteConfig_actionType"],
                },
                "create",
              ],
            },
            {
              and: [
                {
                  "==": [
                    {
                      var: ["RemoteConfig_actionType"],
                    },
                    "fetch",
                  ],
                },
                {
                  or: [
                    {
                      "==": [
                        {
                          var: ["RemoteConfig_resultsType"],
                        },
                        "all",
                      ],
                    },
                    {
                      "==": [
                        {
                          var: ["RemoteConfig_resultsType"],
                        },
                        "selected",
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
  },
  {
    key: "RemoteConfig_idKey",
    valueKey: "RemoteConfig_idKey",
    label: "Config ID Key",
    component: "input",
    defaultValue: "remoteConfigId",
    visibilityConditions: {
      and: [
        {
          "==": [
            {
              var: ["queryType"],
            },
            "remote-config",
          ],
        },
        {
          or: [
            {
              "==": [
                {
                  var: ["RemoteConfig_actionType"],
                },
                "update",
              ],
            },
            {
              "==": [
                {
                  var: ["RemoteConfig_actionType"],
                },
                "delete",
              ],
            },
            {
              and: [
                {
                  "==": [
                    {
                      var: ["RemoteConfig_actionType"],
                    },
                    "fetch",
                  ],
                },
                {
                  "==": [
                    {
                      var: ["RemoteConfig_resultsType"],
                    },
                    "selected",
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    key: "RemoteConfig_staticId",
    valueKey: "RemoteConfig_staticId",
    label: "Config",
    component: "select",
    dataHandlerType: "remote-config",
    remoteConfigType: "",
    visibilityConditions: {
      and: [
        {
          "==": [
            {
              var: ["queryType"],
            },
            "remote-config",
          ],
        },
        {
          "==": [
            {
              var: ["RemoteConfig_actionType"],
            },
            "fetch",
          ],
        },
        {
          "==": [
            {
              var: ["RemoteConfig_resultsType"],
            },
            "static",
          ],
        },
      ],
    },
  },
  {
    key: "RemoteConfig_configNameKey",
    valueKey: "RemoteConfig_configNameKey",
    label: "Name Key",
    component: "input",
    defaultValue: "configNameValueKey",
    visibilityConditions: {
      and: [
        {
          "==": [
            {
              var: "queryType",
            },
            "remote-config",
          ],
        },
        {
          or: [
            {
              "==": [
                {
                  var: "RemoteConfig_actionType",
                },
                "create",
              ],
            },
            {
              "==": [
                {
                  var: "RemoteConfig_actionType",
                },
                "update",
              ],
            },
          ],
        },
      ],
    },
  },
  {
    key: "RemoteConfig_useDeleteRedirect",
    valueKey: "RemoteConfig_useDeleteRedirect",
    component: "toggle",
    defaultValue: false,
    label: "Redirect After Delete",
    visibilityConditions: {
      and: [
        {
          "==": [
            {
              var: ["queryType"],
            },
            "remote-config",
          ],
        },
        {
          "==": [
            {
              var: ["RemoteConfig_actionType"],
            },
            "delete",
          ],
        },
      ],
    },
  },
  {
    key: "RemoteConfig_deleteRedirectPath",
    valueKey: "RemoteConfig_deleteRedirectPath",
    label: "Redirect Path",
    component: "input",
    defaultValue: "/dashboard/apps/",
    visibilityConditions: {
      and: [
        {
          "==": [
            {
              var: ["queryType"],
            },
            "remote-config",
          ],
        },
        {
          "==": [
            {
              var: ["RemoteConfig_actionType"],
            },
            "delete",
          ],
        },
        {
          "==": [
            {
              var: ["RemoteConfig_useDeleteRedirect"],
            },
            true,
          ],
        },
      ],
    },
  },
  {
    center: false,
    headerSize: "",
    textType: "warning",
    invisible: false,
    hidden: false,
    stringTemplate: "Proceed With Caution!",
    description: "You risk making unintentional changes to the Global Config",
    showIcon: true,
    useTokens: false,
    valueKey: "data",
    label: "Text",
    hideLabel: true,
    component: "text",
    marginTop: 20,
    marginBottom: 20,
    components: [],
    visibilityConditions: {
      and: [
        {
          "==": [
            {
              var: ["queryType"],
            },
            "remote-config",
          ],
        },
        {
          or: [
            {
              "==": [
                {
                  var: ["RemoteConfig_actionType"],
                },
                "update",
              ],
            },
            {
              "==": [
                {
                  var: ["RemoteConfig_actionType"],
                },
                "delete",
              ],
            },
          ],
        },
      ],
    },
  },
]
