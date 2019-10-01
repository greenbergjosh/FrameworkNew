let runOnce = false

if (!runOnce) {
  const log = console.log
  const debug = console.debug
  const warn = console.warn
  const error = console.error

  /**
   * Verbose mode for debugging on mobile devices
   * because objects are converted to strings
   * @param type
   * @param args
   */
  const verboseLogger = (type: string, ...args: []) => {
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
    log(`[${type}]`, stringifiedArgs)
  }

  // @ts-ignore
  const getVerboseLogger = (type: string) => (...args: []) => verboseLogger(type, args)

  console.log = getVerboseLogger("log")
  console.debug = getVerboseLogger("debug")
  console.warn = getVerboseLogger("warn")
  console.error = getVerboseLogger("error")
  runOnce = true
}

export {}
