import { cloneDeep } from "lodash/fp"
import { eventsManageFormDefinition } from "./events-manage-form"
import { getOutgoingEventsManageForm } from "./getOutgoingEventsManageForm"

/**
 *
 * @param WrappedComponent
 */
export function getManageForm(WrappedComponent: any): any {
  const wrappedForm = WrappedComponent.manageForm()
  const mergedForm = [...wrappedForm]
  const eventManagerTabs: any = cloneDeep(eventsManageFormDefinition)

  eventManagerTabs[0].components[0].tabs[0].components = getOutgoingEventsManageForm(WrappedComponent)
  mergedForm[0].components[0].tabs = mergedForm[0].components[0].tabs.concat(eventManagerTabs)
  return mergedForm
}
