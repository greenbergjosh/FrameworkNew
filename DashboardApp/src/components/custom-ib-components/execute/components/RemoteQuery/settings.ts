export const remoteQuerySettings = [
  {
    center: false,
    headerSize: "4",
    textType: "title",
    invisible: false,
    hidden: false,
    stringTemplate: "Remote Query Settings",
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
            "remote-query",
            {
              var: ["queryType"],
            },
          ],
        },
      ],
    },
  },
  {
    key: "RemoteQuery_isCRUD",
    valueKey: "RemoteQuery_isCRUD",
    component: "toggle",
    defaultValue: false,
    label: "CRUD Operation",
    help: "Does this query CReate Update or Delete data?",
    bindable: true,
    visibilityConditions: {
      or: [
        {
          "===": [
            "remote-query",
            {
              var: ["queryType"],
            },
          ],
        },
      ],
    },
  },
  {
    key: "RemoteQuery_notifyOkShow",
    valueKey: "RemoteQuery_notifyOkShow",
    component: "toggle",
    defaultValue: true,
    label: "Show Success Message",
    bindable: true,
    visibilityConditions: {
      or: [
        {
          "===": [
            "remote-query",
            {
              var: ["queryType"],
            },
          ],
        },
      ],
    },
  },
  {
    key: "RemoteQuery_notifyUnauthorizedShow",
    valueKey: "RemoteQuery_notifyUnauthorizedShow",
    component: "toggle",
    defaultValue: true,
    label: "Show Unauthorized Message",
    bindable: true,
    visibilityConditions: {
      or: [
        {
          "===": [
            "remote-query",
            {
              var: ["queryType"],
            },
          ],
        },
      ],
    },
  },
  {
    key: "RemoteQuery_notifyServerExceptionShow",
    valueKey: "RemoteQuery_notifyServerExceptionShow",
    component: "toggle",
    defaultValue: true,
    label: "Show Server Exception Message",
    bindable: true,
    visibilityConditions: {
      or: [
        {
          "===": [
            "remote-query",
            {
              var: ["queryType"],
            },
          ],
        },
      ],
    },
  },
  {
    key: "remoteQuery",
    valueKey: "remoteQuery",
    label: "TGWD Query",
    component: "select",
    dataHandlerType: "remote-config",
    // remoteDataFilter: {
    //   // Set of both
    //   or: [
    //     // Queries with no parameter options
    //     { "!": { var: "config.parameters" } },
    //     // and Queries with all parameter options filled in
    //     { all: [{ var: "config.parameters" }, { "!!": { var: "defaultValue" } }] },
    //   ],
    // },
    remoteConfigType: "Report.Query",
    bindable: true,
    visibilityConditions: {
      and: [
        {
          "===": [
            "remote-query",
            {
              var: ["queryType"],
            },
          ],
        },
      ],
    },
  },
]
