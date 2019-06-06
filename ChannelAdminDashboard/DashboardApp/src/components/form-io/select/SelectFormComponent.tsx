import { Select } from "antd"
import * as iots from "io-ts"
import React from "react"
import ReactFormBase from "../ReactFormBase"
import editForm from "./select.form"

interface LabelValueObject {
  label: string
  value: string
}

interface SelectOptions {
  value: string | string[]
}
interface SelectData {
  label: string
  [key: string]: string
}

interface ISelectComponentConfig {
  dataSrc: "values" | "json" | "entity" | "query" | "custom"
  label: string
  lazyLoad: boolean
  multiple: boolean
  placeholder?: string
}

interface SelectComponentWithDataConfig extends ISelectComponentConfig {
  dataSrc: "values"
  data: {
    values: LabelValueObject[]
  }
}
interface SelectComponentWithJSONConfig extends ISelectComponentConfig {
  dataSrc: "json"
  data: {
    json: string
  }
}
interface SelectComponentWithEntityConfig extends ISelectComponentConfig {
  dataSrc: "entity"
  data: {
    entity: {}
  }
}
interface SelectComponentWithQueryConfig extends ISelectComponentConfig {
  dataSrc: "query"
  data: {
    query: {}
  }
}
interface SelectComponentWithCustomConfig extends ISelectComponentConfig {
  dataSrc: "custom"
  data: {
    custom: string
  }
}

type SelectComponentConfig =
  | SelectComponentWithDataConfig
  | SelectComponentWithJSONConfig
  | SelectComponentWithEntityConfig
  | SelectComponentWithQueryConfig
  | SelectComponentWithCustomConfig

export default class SelectFormComponent extends ReactFormBase<SelectOptions> {
  static schema(...extend: unknown[]) {
    return ReactFormBase.schema(
      {
        type: "select",
        label: "Select",
        key: "select",
        data: {
          values: [],
          json: "",
          url: "",
          resource: "",
          custom: "",
        },
        limit: 100,
        dataSrc: "values",
        valueProperty: "",
        filter: "",
        searchEnabled: true,
        searchField: "",
        minSearch: 0,
        readOnlyValue: false,
        authenticate: false,
        template: "{{ item.label }}",
        selectFields: "",
        searchThreshold: 0.3,
        fuseOptions: {},
        customOptions: {},
      },
      ...extend
    )
  }

  static builderInfo = {
    title: "Select",
    group: "basic",
    icon: "fa fa-th-list",
    weight: 70,
    schema: SelectFormComponent.schema(),
  }

  static editForm = editForm

  component: SelectComponentConfig

  constructor(component: SelectComponentConfig, options: unknown, data: SelectData) {
    super(component, options, data)
    this.component = component
    console.log("SelectFormComponent.constructor", { component, options, data, _this: this })

    this.state = { value: component.multiple ? [] : "" }

    // Trigger an update.
    this.triggerUpdate = (...args: any[]) => {
      console.log("SelectFormComponent.triggerUpdate", ...args)
    }

    // Keep track of the select options.
    this.selectOptions = []

    // Keep track of the last batch of items loaded.
    this.currentItems = []
    this.loadedItems = 0

    // If this component has been activated.
    this.activated = false

    // Determine when the items have been loaded.
    this.itemsLoaded = new Promise((resolve) => {
      this.itemsLoadedResolve = resolve
    })
  }

  get dataReady() {
    return this.itemsLoaded
  }

  elementInfo() {
    const info = super.elementInfo()
    info.type = "select"
    info.changeEvent = "change"
    return info
  }

  // createWrapper() {
  //   return false
  // }

  render(): JSX.Element {
    const dataItems = this.getOptionItems()
    console.log("SelectFormComponent.render ", this.component && this.component.label, this)

    return (
      <Select placeholder={this.component.placeholder} style={{ width: "100%" }}>
        {dataItems.map(({ label, value }) => (
          <Select.Option key={value} value={value}>
            {label}
          </Select.Option>
        ))}
      </Select>
    )
  }

  get emptyValue() {
    return this.component.multiple ? ([] as string[]) : ""
  }

  get defaultSchema() {
    return SelectFormComponent.schema()
  }

  getOptionItems(): LabelValueObject[] {
    //  Only load the data if it is visible.
    if (!this.isBuilt || !this.checkConditions()) {
      return []
    }

    switch (this.component.dataSrc) {
      case "values":
        return this.component.data.values
      case "json":
        return iots
          .array(iots.type({ label: iots.string, value: iots.string }))
          .decode(this.component.data.json)
          .getOrElse([])
      case "entity":
        return [] //this.component.data.entity
      case "query": {
        // If there is no resource, or we are lazyLoading, wait until active.
        if (!this.component.data.query || !this.active) {
          return []
        }

        // const data = await this.loadRemote(this.component.data.query)
      }
      case "custom":
        return this.getCustomItems()
    }

    return []
  }

  getCustomItems() {
    return (
      this.component.dataSrc === "custom" &&
      this.evaluate(
        this.component.data.custom,
        {
          values: [],
        },
        "values"
      )
    )
  }

  /* eslint-disable max-statements */
  // updateItems(searchInput, forceUpdate) {
  //   if (!this.component.data) {
  //     console.warn(`Select component ${this.key} does not have data configuration.`)
  //     this.itemsLoadedResolve()
  //     return
  //   }

  //   // Only load the data if it is visible.
  //   if (!this.checkConditions()) {
  //     this.itemsLoadedResolve()
  //     return
  //   }

  //   switch (this.component.dataSrc) {
  //     case "values":
  //       this.component.valueProperty = "value"
  //       this.setItems(this.component.data.values)
  //       break
  //     case "json":
  //       this.setItems(this.component.data.json)
  //       break
  //     case "custom":
  //       this.updateCustomItems()
  //       break
  //     case "resource": {
  //       // If there is no resource, or we are lazyLoading, wait until active.
  //       if (!this.component.data.resource || (!forceUpdate && !this.active)) {
  //         return
  //       }
  //       let resourceUrl = this.options.formio
  //         ? this.options.formio.formsUrl
  //         : `${Formio.getProjectUrl()}/form`
  //       resourceUrl += `/${this.component.data.resource}/submission`

  //       try {
  //         this.loadItems(resourceUrl, searchInput, this.requestHeaders)
  //       } catch (err) {
  //         console.warn(`Unable to load resources for ${this.key}`)
  //       }
  //       break
  //     }
  //     case "url": {
  //       if (!forceUpdate && !this.active) {
  //         // If we are lazyLoading, wait until activated.
  //         return
  //       }
  //       let url = this.component.data.url
  //       let method
  //       let body

  //       if (url.substr(0, 1) === "/") {
  //         let baseUrl = Formio.getProjectUrl()
  //         if (!baseUrl) {
  //           baseUrl = Formio.getBaseUrl()
  //         }
  //         url = baseUrl + this.component.data.url
  //       }

  //       if (!this.component.data.method) {
  //         method = "GET"
  //       } else {
  //         method = this.component.data.method
  //         if (method.toUpperCase() === "POST") {
  //           body = this.component.data.body
  //         } else {
  //           body = null
  //         }
  //       }
  //       const options = this.component.authenticate ? {} : { noToken: true }
  //       this.loadItems(url, searchInput, this.requestHeaders, options, method, body)
  //       break
  //     }
  //   }
  // }

  /**
   * Activate this select control.
   */
  // activate() {
  //   if (this.active) {
  //     return
  //   }
  //   this.activated = true
  //   if (this.choices) {
  //     this.choices.setChoices(
  //       [
  //         {
  //           value: "",
  //           label: `<i class="${this.iconClass("refresh")}" style="font-size:1.3em;"></i>`,
  //         },
  //       ],
  //       "value",
  //       "label",
  //       true
  //     )
  //   }
  //   // else {
  //   //   this.addOption("", this.t("loading..."))
  //   // }
  //   this.triggerUpdate()
  // }

  get active() {
    return !this.component.lazyLoad || this.activated
  }

  destroy() {
    super.destroy()
    // if (this.choices) {
    //   this.choices.destroyed = true
    //   this.choices.destroy()
    //   this.choices = null
    // }
  }

  focus() {
    // this.focusableElement.focus()
  }
}
