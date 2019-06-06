import { Applicative2C } from "fp-ts/lib/Applicative"
import { sequenceT } from "fp-ts/lib/Apply"
import { Monoid } from "fp-ts/lib/Monoid"
import {
  getSemigroup as getNonEmptyArraySemigroup,
  getSetoid as getNonEmptyArraySetoid,
  NonEmptyArray,
  nonEmptyArray,
} from "fp-ts/lib/NonEmptyArray2v"
import { getLastSemigroup, getStructSemigroup, Semigroup } from "fp-ts/lib/Semigroup"
import { getStructSetoid, Setoid, setoidString } from "fp-ts/lib/Setoid"
import {
  failure,
  getApplicative as getApplicativeValidation,
  success,
  Validation,
} from "fp-ts/lib/Validation"

export interface ValidatorError<T> {
  value: T
  reason: string
}

export interface ValidatorErrors<T> {
  value: T
  reasons: NonEmptyArray<string>
}

export function getSetoidValidatorErrors<T>(
  S: Setoid<T>
): Setoid<{
  value: T
  reasons: NonEmptyArray<string>
}> {
  return getStructSetoid({
    value: S,
    reasons: getNonEmptyArraySetoid(setoidString),
  })
}
export type Validator<T> = (value: T) => Validation<ValidatorError<T>, T>

export type Validated<T> = Validation<ValidatorErrors<T>, T>

export const isNotEmpty = <T>(M: Monoid<T>): Validator<T> => (value: T) =>
  M.empty === value ? failure({ value, reason: "cannot be empty" }) : success(value)

export const isUnique = <T>(S: Setoid<T>) => (existing: Array<T>): Validator<T> => (value: T) =>
  existing.some((el) => S.equals(el, value))
    ? failure({ value, reason: "must be unique" })
    : success(value)

export function validate<T>(
  value: T,
  validators: [Validator<T>, ...Array<Validator<T>>]
): Validated<T> {
  const applicativeValidation = getApplicativeValidation(getSemigroupValidated<T>())
  const sequenceValidations = sequenceT(applicativeValidation)
  const [fst, ...rest] = validators
  const validations = rest.map((v) =>
    v(value).mapFailure((err) => ({ value: err.value, reasons: nonEmptyArray.of(err.reason) }))
  )
  return sequenceValidations(
    fst(value).mapFailure((err) => ({ value: err.value, reasons: nonEmptyArray.of(err.reason) })),
    ...validations
  ).map(() => value)
}

export function getSemigroupValidated<T>(): Semigroup<{
  value: T
  reasons: NonEmptyArray<string>
}> {
  return getStructSemigroup({
    value: getLastSemigroup<T>(),
    reasons: getNonEmptyArraySemigroup<string>(),
  })
}

export function getApplicativeValidated<T>(): Applicative2C<
  "Validation",
  {
    value: T
    reasons: NonEmptyArray<string>
  }
> {
  return getApplicativeValidation(getSemigroupValidated<T>())
}
