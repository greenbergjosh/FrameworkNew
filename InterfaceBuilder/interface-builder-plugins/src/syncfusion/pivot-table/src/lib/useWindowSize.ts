import { useEffect, useState } from "react"
import debounce from "lodash/debounce"

export interface Size {
  width: number | undefined
  height: number | undefined
}

/**
 *
 * @param delay
 */
function useWindowSize(delay = 700): Size {
  const [windowSize, setWindowSize] = useState<Size>({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    const debouncedHandleResize = debounce(handleResize, delay)
    window.addEventListener("resize", debouncedHandleResize)
    return () => {
      window.removeEventListener("resize", debouncedHandleResize)
    }
  }, [delay])

  return windowSize
}

export default useWindowSize
