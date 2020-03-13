import { store } from "../../state/store"
import { IDisposable, IPosition, Range } from "monaco-editor"
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api"
import { some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"

type guidRangeItem = {
  link: { range: Range; url: string } // Not same as monacoEditor.languages.ILink
  guid: string
}

export const getCustomEditorConstructionOptions = (monaco: typeof monacoEditor): IDisposable[] => {
  const adapter = new GUIDEditorServiceAdapter(monaco, store)
  const linkDisposable = monaco.languages.registerLinkProvider("json", adapter)
  const hoverDisposable = monaco.languages.registerHoverProvider("json", adapter)
  return [linkDisposable, hoverDisposable]
}

class GUIDEditorServiceAdapter
  implements monacoEditor.languages.LinkProvider, monacoEditor.languages.HoverProvider {
  constructor(private monaco: typeof monacoEditor, private applicationStore: typeof store) {}

  provideLinks(
    model: monacoEditor.editor.ITextModel,
    token: monacoEditor.CancellationToken
  ): monacoEditor.languages.ProviderResult<monacoEditor.languages.ILinksList> {
    return { links: extractGuidRangeItems(model).map((item) => item.link)}
  }

  provideHover(model: monacoEditor.editor.ITextModel, position: IPosition) {
    const hoveredGuid = extractGuidRangeItems(model).find(({ link, guid }) =>
      link.range.containsPosition(position)
    )

    if (hoveredGuid) {
      const configsById = this.applicationStore.select.globalConfig.configsById(
        this.applicationStore.getState()
      )
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

function extractGuidRangeItems(model: monacoEditor.editor.ITextModel): guidRangeItem[] {
  const guidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi
  const text = model.getValue()
  let match
  const items: guidRangeItem[] = []

  while ((match = guidPattern.exec(text)) !== null) {
    const index = match.index
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
