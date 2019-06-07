import { Either } from "fp-ts/lib/Either"
import { Type } from "io-ts"
import { failure } from "io-ts/lib/PathReporter"

export interface Decoder<A> {
  decode: (value: unknown) => Either<string, A>
}

export function decodeJSON<A>(decoder: Decoder<A>, value: unknown): Either<string, A> {
  return decoder.decode(value)
}

export function map<A, B>(fa: Decoder<A>, f: (a: A) => B): Decoder<B> {
  return {
    decode: (value) => fa.decode(value).map(f),
  }
}

export function fromType<A>(type: Type<A, any, unknown>): Decoder<A> {
  return {
    decode: (value) => type.decode(value).mapLeft((errors) => failure(errors).join("\n")),
  }
}

export const decoder = {
  decodeJSON,
  fromType,
  map,
}
