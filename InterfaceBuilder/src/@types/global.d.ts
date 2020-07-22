declare type Nil = undefined | null
declare type Nilable<T> = T | null | undefined
declare type Nullable<T> = T | null
declare type PropsFromComponent<C extends React.ComponentType<any>> = C extends React.ComponentType<
  infer P
>
  ? P
  : never

/** Make keys in K required in T */
declare type Require<T extends object, K extends keyof T> = Pick<T, Exclude<keyof T, K>> &
  Required<Pick<T, K>>
declare type VariadicTuple =
  | []
  | [unknown]
  | [unknown, unknown]
  | [unknown, unknown, unknown]
  | [unknown, unknown, unknown, unknown]
  | [unknown, unknown, unknown, unknown, unknown]
  | [unknown, unknown, unknown, unknown, unknown, unknown]

/**
 * Default definitions for typescript
 */

// declare module '*.scss'
declare module "*.scss" {
  const content: { [className: string]: string }
  export default content
}

declare module "*.css" {
  const content: { [className: string]: string }
  export default content
}

interface SvgrComponent extends React.StatelessComponent<React.SVGAttributes<SVGElement>> {}

declare module "*.svg" {
  const svgUrl: string
  const svgComponent: SvgrComponent
  export default svgUrl
  export { svgComponent as ReactComponent }
}

declare module "*.png"
