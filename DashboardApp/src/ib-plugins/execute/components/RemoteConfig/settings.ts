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
    bindable: true,
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
    bindable: true,
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
    bindable: true,
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
    bindable: true,
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
    key: "RemoteConfig_staticId",
    valueKey: "RemoteConfig_staticId",
    label: "Config",
    component: "select",
    dataHandlerType: "remote-config",
    remoteConfigType: "",
    bindable: true,
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
    component: "toggle",
    label: "Use Config Default",
    valueKey: "RemoteConfig_useConfigDefault",
    key: "RemoteConfig_useConfigDefault",
    bindable: true,
  },
  {
    component: "code-editor",
    label: "Config Default",
    valueKey: "RemoteConfig_configDefault",
    key: "RemoteConfig_configDefault",
    height: "300px",
    defaultValue: { lang: "json" },
    bindable: true,
    visibilityConditions: {
      "===": [{ var: ["RemoteConfig_useConfigDefault"] }, true],
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
    bindable: true,
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
  {
    key: "RemoteConfig_useRedirect",
    valueKey: "RemoteConfig_useRedirect",
    component: "toggle",
    defaultValue: false,
    label: "Redirect After Execute",
    bindable: true,
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
          "!==": [
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
    key: "RemoteConfig_redirectPath",
    valueKey: "RemoteConfig_redirectPath",
    label: "Redirect Path",
    component: "input",
    defaultValue: "/",
    bindable: true,
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
          "!==": [
            {
              var: ["RemoteConfig_actionType"],
            },
            "fetch",
          ],
        },
        {
          "==": [
            {
              var: ["RemoteConfig_useRedirect"],
            },
            true,
          ],
        },
      ],
    },
  },
]
