import { BulkTextInputInterfaceComponent } from "./bulk-text-input/BulkTextInputInterfaceComponent"
import { ButtonInterfaceComponent } from "./button/ButtonInterfaceComponent"
import { CardInterfaceComponent } from "./card/CardInterfaceComponent"
import { CheckboxInterfaceComponent } from "./checkbox/CheckboxInterfaceComponent"
import { CollapseInterfaceComponent } from "./collapse/CollapseInterfaceComponent"
import { ColorPickerInterfaceComponent } from "./color-picker/ColorPickerInterfaceComponent"
import { ColumnInterfaceComponent } from "./column/ColumnInterfaceComponent"
import { DataDictionaryInterfaceComponent } from "./data-dictionary/DataDictionaryInterfaceComponent"
import { DataMapInterfaceComponent } from "./data-map/DataMapInterfaceComponent"
import { DateInterfaceComponent } from "./date/DateInterfaceComponent"
import { DateRangeInterfaceComponent } from "./date-range/DateRangeInterfaceComponent"
import { DateStepperInterfaceComponent } from "./date-stepper/DateStepperInterfaceComponent"
import { DevToolsInterfaceComponent } from "./dev-tools/DevToolsInterfaceComponent"
import { DividerInterfaceComponent } from "./divider/DividerInterfaceComponent"
import { DownloadInterfaceComponent } from "./download/DownloadInterfaceComponent"
import { EmptyInterfaceComponent } from "./empty/EmptyInterfaceComponent"
import { FormInterfaceComponent } from "./form/FormInterfaceComponent"
import { InputInterfaceComponent } from "./input/InputInterfaceComponent"
import { LinkInterfaceComponent } from "./link/LinkInterfaceComponent"
import { ListInterfaceComponent } from "./list/ListInterfaceComponent"
import { NumberInputInterfaceComponent } from "./number-input/NumberInputInterfaceComponent"
import { NumberRangeInterfaceComponent } from "./number-range/NumberRangeInterfaceComponent"
import { PasswordInterfaceComponent } from "./password/PasswordInterfaceComponent"
import { ProgressInterfaceComponent } from "./progress/ProgressInterfaceComponent"
import { QueryBuilderInterfaceComponent } from "./query-builder/QueryBuilderInterfaceComponent"
import { RadioInterfaceComponent } from "./radio/RadioInterfaceComponent"
import { RepeaterInterfaceComponent } from "./repeater/RepeaterInterfaceComponent"
import { SectionedNavigationInterfaceComponent } from "./sectioned-navigation/SectionedNavigationInterfaceComponent"
import { SelectInterfaceComponent } from "./select/SelectInterfaceComponent"
import { StringTemplateInterfaceComponent } from "./string-template/StringTemplateInterfaceComponent"
import { TabsInterfaceComponent } from "./tabs/TabsInterfaceComponent"
import { TagsInterfaceComponent } from "./tags/TagsInterfaceComponent"
import { TextAreaInterfaceComponent } from "./textarea/TextAreaInterfaceComponent"
import { TextInterfaceComponent } from "./text/TextInterfaceComponent"
import { TimeRangeInterfaceComponent } from "./time-range/TimeRangeInterfaceComponent"
import { ToggleInterfaceComponent } from "./toggle/ToggleInterfaceComponent"
import { TreeInterfaceComponent } from "./tree/TreeInterfaceComponent"
import { UploadInterfaceComponent } from "./upload/UploadInterfaceComponent"
import { UserInterfaceInterfaceComponent } from "./user-interface/UserInterfaceInterfaceComponent"
import { WizardInterfaceComponent } from "./wizard/WizardInterfaceComponent"
import { ComponentRegistryCache } from "../../services/ComponentRegistry"
/* TODO: Menu needs to implement data fetching and updates with Selectable. Patrick mentioned possibly changing Selectable to use Query. */
// import { MenuInterfaceComponent } from "components/interface-builder/components/display/menu/MenuInterfaceComponent"

const plugin: ComponentRegistryCache = {
  button: ButtonInterfaceComponent,
  card: CardInterfaceComponent,
  checkbox: CheckboxInterfaceComponent,
  collapse: CollapseInterfaceComponent,
  "color-picker": ColorPickerInterfaceComponent,
  column: ColumnInterfaceComponent,
  "bulk-text-input": BulkTextInputInterfaceComponent,
  "data-map": DataMapInterfaceComponent,
  "data-dictionary": DataDictionaryInterfaceComponent,
  date: DateInterfaceComponent,
  "date-range": DateRangeInterfaceComponent,
  "date-stepper": DateStepperInterfaceComponent,
  "dev-tools": DevToolsInterfaceComponent,
  divider: DividerInterfaceComponent,
  download: DownloadInterfaceComponent,
  // menu: MenuInterfaceComponent,
  empty: EmptyInterfaceComponent,
  form: FormInterfaceComponent,
  input: InputInterfaceComponent,
  text: TextInterfaceComponent,
  link: LinkInterfaceComponent,
  list: ListInterfaceComponent,
  repeater: RepeaterInterfaceComponent,
  "number-input": NumberInputInterfaceComponent,
  "number-range": NumberRangeInterfaceComponent,
  password: PasswordInterfaceComponent,
  progress: ProgressInterfaceComponent,
  "query-builder": QueryBuilderInterfaceComponent,
  radio: RadioInterfaceComponent,
  "sectioned-navigation": SectionedNavigationInterfaceComponent,
  select: SelectInterfaceComponent,
  "string-template": StringTemplateInterfaceComponent,
  tabs: TabsInterfaceComponent,
  tags: TagsInterfaceComponent,
  textarea: TextAreaInterfaceComponent,
  "time-range": TimeRangeInterfaceComponent,
  toggle: ToggleInterfaceComponent,
  tree: TreeInterfaceComponent,
  upload: UploadInterfaceComponent,
  "user-interface": UserInterfaceInterfaceComponent,
  wizard: WizardInterfaceComponent,
}

export default plugin
