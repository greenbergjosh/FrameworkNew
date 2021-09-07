import FemaleThermometer from "./FemaleThermometer"
import MaleThermometer from "./MaleThermometer"
import ClassicThermometer from "./ClassicThermometer"
import { IconType } from "../types"

export default function getThermometer(iconType: IconType) {
  switch (iconType) {
    case "female":
      return FemaleThermometer
    case "male":
      return MaleThermometer
    default:
      return ClassicThermometer
  }
}
