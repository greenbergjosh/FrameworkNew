export const pluralize = (count, noun, suffix = "s") => `${noun}${count !== 1 ? suffix : ""}`
