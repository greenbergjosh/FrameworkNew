import { IconProps } from "antd/lib/icon"
import { ComponentDefinition } from "../globalTypes"

/**
 * LayoutDefinition
 */
export interface LayoutDefinition {
  /** A grouping of the component in the component selection */
  category: string
  /** A unique name for this component */
  name: string
  /** The display text of this component */
  title: string
  /** A description of this component */
  description?: string | { __html: string }
  /** The AntDesign icon name of this component */
  icon?: string
  /** An SVG icon component to use instead of AntDesign icons */
  iconComponent?: IconProps["component"]
  /** Whether or not this component is a form control */
  formControl?: boolean
  /** The initial ComponentDefinition when creating an instance of this */
  componentDefinition: Partial<ComponentDefinition>
}
