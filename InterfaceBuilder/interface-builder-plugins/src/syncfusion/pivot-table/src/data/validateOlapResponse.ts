import { OlapEngine } from "@syncfusion/ej2-react-pivotview"
import { isEmpty } from "lodash/fp"
import { ArgsProps } from "antd/lib/notification"

/**
 * Checks the response for errors.
 * NOTE: Syncfusion PivotView 19.x does not check for errors and does not expose an API to check.
 * We hack into the internals of PivotView to check for errors.
 * PivotView will show an infinite spinner otherwise.
 *
 * @param olapEngineModule
 */
export function validateOlapResponse(olapEngineModule: OlapEngine): ArgsProps | null {
  if (!olapEngineModule) {
    showVersionWarning("olapEngineModule")
    return null
  }
  /*
   * Attempt to access undocumented response "xmlDoc"
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { xmlDoc } = olapEngineModule
  if (!xmlDoc) {
    /* Report may simply be empty, so don't complain */
    return null
  }
  const documentElement = xmlDoc.documentElement as XMLDocument
  if (!documentElement || !documentElement.getElementsByTagName) {
    showVersionWarning("olapEngineModule.xmlDoc.documentElement")
    return null
  }

  const faults = getFaults(documentElement)
  if (faults && faults.length > 0) {
    const errorCode = getErrorCode(faults[0])

    /*
     * The report doesn't have any measures. MDX doesn't run single axis queries.
     * So just ignore this error and let the user add the measures.
     */
    if (errorCode === "3238658121") {
      return null
    }

    const errorMessage = getErrorMessage(faults[0])
    if (!isEmpty(errorMessage)) {
      return {
        message: `Pivot Table error!\n${errorMessage}`,
        duration: 0, // never close
      }
    }
  }

  return null
}

/**
 * Read any errors and display a notification
 * First try "soap:Fault"...
 * @param documentElement
 */
function getFaults(documentElement: XMLDocument): HTMLCollectionOf<Element> | null {
  let faults: HTMLCollectionOf<Element>
  faults = documentElement.getElementsByTagName("soap:Fault")
  if (!faults || faults.length < 1) {
    // Then try "SOAP-ENV:Fault"
    faults = documentElement.getElementsByTagName("SOAP-ENV:Fault")
    if (!faults || faults.length < 1 || !faults[0].getElementsByTagName) {
      // No soap fault errors
      return null
    }
  }
  return faults
}

/**
 *
 * @param fault
 */
function getErrorCode(fault: Element): string | null {
  const detailEls = fault.getElementsByTagName("detail")
  if (!detailEls || detailEls.length < 1) {
    // No 0th detail node
    return null
  }

  const errorEls = detailEls[0].getElementsByTagName("Error")
  if (!errorEls || errorEls.length < 1) {
    // No 0th error node
    return null
  }

  const attrs = errorEls[0].attributes
  if (!attrs || attrs.length < 1) {
    // No 0th error attribute
    return null
  }

  const errorCode = attrs.getNamedItem("ErrorCode")
  if (errorCode) {
    // Hopefully an error code
    return errorCode.value
  }

  // No error code
  return null
}

/**
 *
 * @param fault
 */
function getErrorMessage(fault: Element): string | null {
  const faultstringEl = fault.getElementsByTagName("faultstring")
  if (!faultstringEl || faultstringEl.length < 1) {
    // No 0th fault string node
    return null
  }
  return faultstringEl[0].innerHTML
}

/**
 *
 * @param missingDependency
 */
function showVersionWarning(missingDependency: string) {
  console.warn(
    `PivotTable's dependency on the undocumented property "${missingDependency}" in no longer valid.
        This is most likely due to a version change in Syncfusion PivotView.
        Olap errors won't be notified and the user will see an infinite spinner.`
  )
}
