const badChars = {
  "<": "lt",
  ">": "gt",
  '"': "quot",
  "'": "apos",
  "&": "amp",
  "\r": "#10",
  "\n": "#13",
} as { [key: string]: string }

export const sanitizeText = (text: string) => String(text).replace(/[<>"'\r\n&]/g, (chr) => `&${badChars[chr]};`)
