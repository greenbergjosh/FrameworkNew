export const remoteUrlSettings = [
  {
    center: false,
    headerSize: "4",
    textType: "title",
    invisible: false,
    hidden: false,
    stringTemplate: "Remote URL Settings",
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
            "remote-url",
            {
              var: ["queryType"],
            },
          ],
        },
      ],
    },
  },
  {
    key: "RemoteUrl_isCRUD",
    valueKey: "RemoteUrl_isCRUD",
    component: "toggle",
    defaultValue: false,
    label: "CRUD Operation",
    help: "Does this query CReate Update or Delete data?",
    bindable: true,
    visibilityConditions: {
      "===": [
        "remote-url",
        {
          var: ["queryType"],
        },
      ],
    },
  },
  {
    key: "RemoteUrl_notifyOkShow",
    valueKey: "RemoteUrl_notifyOkShow",
    component: "toggle",
    defaultValue: true,
    label: "Show Success Message",
    bindable: true,
    visibilityConditions: {
      or: [
        {
          "===": [
            "remote-url",
            {
              var: ["queryType"],
            },
          ],
        },
      ],
    },
  },
  {
    key: "RemoteUrl_notifyUnauthorizedShow",
    valueKey: "RemoteUrl_notifyUnauthorizedShow",
    component: "toggle",
    defaultValue: true,
    label: "Show Unauthorized Message",
    bindable: true,
    visibilityConditions: {
      or: [
        {
          "===": [
            "remote-url",
            {
              var: ["queryType"],
            },
          ],
        },
      ],
    },
  },
  {
    key: "RemoteUrl_notifyServerExceptionShow",
    valueKey: "RemoteUrl_notifyServerExceptionShow",
    component: "toggle",
    defaultValue: true,
    label: "Show Server Exception Message",
    bindable: true,
    visibilityConditions: {
      or: [
        {
          "===": [
            "remote-url",
            {
              var: ["queryType"],
            },
          ],
        },
      ],
    },
  },
  {
    key: "remoteUrl",
    valueKey: "remoteUrl",
    label: "URL Query",
    component: "select",
    dataHandlerType: "remote-config",
    remoteConfigType: "Report.Query",
    bindable: true,
    visibilityConditions: {
      "===": [
        "remote-url",
        {
          var: ["queryType"],
        },
      ],
    },
  },
]
