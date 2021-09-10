import { store } from "../state/store"
import { some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"

type guidRangeItem = {
  link: { range: { containsPosition: (p: any) => any }; url: string } // Not same as monacoEditor.languages.ILink
  guid: string
}
interface LinkProvider {}
interface HoverProvider {}

/**
 *
 * @param registerLinkProvider From monaco languages namespace
 * @param registerHoverProvider From monaco languages namespace
 * @param Range From monaco Range
 */
export default function getMonacoEditorConstructionOptions(
  registerLinkProvider: any,
  registerHoverProvider: any,
  Range: any
) {
  class GUIDEditorServiceAdapter implements LinkProvider, HoverProvider {
    constructor(private monaco: unknown, private applicationStore: typeof store) {}

    provideLinks(model: unknown, token: unknown) {
      return { links: extractGuidRangeItems(model).map((item) => item.link) }
    }

    provideHover(model: unknown, position: unknown) {
      const hoveredGuid = extractGuidRangeItems(model).find(({ link, guid }) => link.range.containsPosition(position))

      if (hoveredGuid) {
        const configsById = this.applicationStore.select.globalConfig.configsById(this.applicationStore.getState())
        return record
          .lookup(hoveredGuid.guid.toLowerCase(), configsById)
          .map((config) => ({
            range: hoveredGuid.link.range,
            contents: [{ value: `**${config.type}:** ${config.name}` }],
          }))
          .alt(
            some({
              range: hoveredGuid.link.range,
              contents: [
                {
                  value: `**Unknown GUID**\n\n_${hoveredGuid.guid}_ is not a known Global Config ID`,
                },
              ],
            })
          )
          .toUndefined()
      }
    }
  }

  function extractGuidRangeItems(model: any): guidRangeItem[] {
    const guidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi
    const text = model.getValue()
    let match
    const items: guidRangeItem[] = []

    while ((match = guidPattern.exec(text)) !== null) {
      const { index } = match
      const textBeforeMatch = text.substr(0, index)
      const lines = textBeforeMatch.split(/\n/g)
      const lineNumber = lines.length
      const lastNewLine = textBeforeMatch.lastIndexOf("\n")
      const startColumnNumber = index - lastNewLine
      const endColumnNumber = startColumnNumber + match[0].length
      const guid = match[0]
      const range = new Range(lineNumber, startColumnNumber, lineNumber, endColumnNumber)
      const url = `${window.location.origin}/dashboard/global-config/${guid}`

      items.push({ link: { range, url }, guid })
    }

    return items
  }

  return (monaco: unknown) => {
    const adapter = new GUIDEditorServiceAdapter(monaco, store)
    const linkDisposable = registerLinkProvider("json", adapter)
    const hoverDisposable = registerHoverProvider("json", adapter)
    return [linkDisposable, hoverDisposable]
  }
}
