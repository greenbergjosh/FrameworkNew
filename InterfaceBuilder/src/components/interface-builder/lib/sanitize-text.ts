const badChars: { [key: string]: string } = {
  "<": "lt",
  ">": "gt",
  '"': "quot",
  "'": "apos",
  "&": "amp",
  "\r": "#10",
  "\n": "#13",
}

/**
 * Remove HTML tag start and end chars, HTML char entities, line breaks, quotes and double-quotes
 * @param text
 */
export const sanitizeText = (text: string) =>
  String(text).replace(/[<>"'\r\n&]/g, (chr) => `&${badChars[chr]};`)
