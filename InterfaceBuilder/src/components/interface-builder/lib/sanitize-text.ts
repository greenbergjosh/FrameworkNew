const badChars: { [key: string]: string } = {
  "<": "lt",
  ">": "gt",
  '"': "quot",
  "'": "apos",
  "&": "amp",
  "\r": "#10",
  "\n": "#13",
}

export const sanitizeText = (text: string) =>
  String(text).replace(/[<>"'\r\n&]/g, (chr) => `&${badChars[chr]};`)
