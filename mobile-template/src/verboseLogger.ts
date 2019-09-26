let runOnce = false

if (!runOnce) {
  const logger = console.log

  /**
   * Verbose mode for debugging on mobile devices
   * because objects are converted to strings
   * @param args
   */
  const verboseLogger = (...args: []) => {
    const reducer = (acc: string, arg: string | {} | undefined) => {
      if (acc.length > 0) {
        acc = `${acc}, `
      }
      if (arg instanceof HTMLCollection) {
        let html = ""
        for (const item of arg) {
          html += item.outerHTML
        }
        return `${acc}${html}`
      }
      if (arg instanceof Element) {
        return `${acc}${arg.outerHTML}`
      }
      if (typeof arg === "object") {
        const stringifiedArg = Object.entries(arg).join()
        return `${acc}${stringifiedArg}`
      }
      return `${acc}${arg}`
    }
    const stringifiedArgs = args.reduce(reducer, "")
    logger(stringifiedArgs)
  }

  console.log = verboseLogger
  runOnce = true
}

export {}
