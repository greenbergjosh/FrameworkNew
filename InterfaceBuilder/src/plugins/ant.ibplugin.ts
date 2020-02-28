import { BulkTextInputInterfaceComponent } from "../components/interface-builder/components/form/bulk-text-input/BulkTextInputInterfaceComponent"
import { CardInterfaceComponent } from "../components/interface-builder/components/display/card/CardInterfaceComponent"
import { CheckboxInterfaceComponent } from "../components/interface-builder/components/form/checkbox/CheckboxInterfaceComponent"
import { CodeEditorInterfaceComponent } from "../components/interface-builder/components/special/code-editor/CodeEditorInterfaceComponent"
import { CollapseInterfaceComponent } from "../components/interface-builder/components/display/collapse/CollapseInterfaceComponent"
import { ColumnInterfaceComponent } from "../components/interface-builder/components/display/column/ColumnInterfaceComponent"
import { DataDictionaryInterfaceComponent } from "../components/interface-builder/components/form/data-dictionary/DataDictionaryInterfaceComponent"
import { DataMapInterfaceComponent } from "../components/interface-builder/components/form/data-map/DataMapInterfaceComponent"
import { DateInterfaceComponent } from "../components/interface-builder/components/form/date/DateInterfaceComponent"
import { DateRangeInterfaceComponent } from "../components/interface-builder/components/form/date-range/DateRangeInterfaceComponent"
import { DividerInterfaceComponent } from "../components/interface-builder/components/display/divider/DividerInterfaceComponent"
import { DownloadInterfaceComponent } from "../components/interface-builder/components/form/download/DownloadInterfaceComponent"
import { EmptyInterfaceComponent } from "../components/interface-builder/components/display/empty/EmptyInterfaceComponent"
import { FormInterfaceComponent } from "../components/interface-builder/components/form/FormInterfaceComponent"
import { InputInterfaceComponent } from "../components/interface-builder/components/form/input/InputInterfaceComponent"
import { ListInterfaceComponent } from "../components/interface-builder/components/display/list/ListInterfaceComponent"
import { NumberInputInterfaceComponent } from "../components/interface-builder/components/form/number-input/NumberInputInterfaceComponent"
import { NumberRangeInterfaceComponent } from "../components/interface-builder/components/form/number-range/NumberRangeInterfaceComponent"
import { PasswordInterfaceComponent } from "../components/interface-builder/components/form/password/PasswordInterfaceComponent"
import { ProgressInterfaceComponent } from "../components/interface-builder/components/display/progress/ProgressInterfaceComponent"
import { RichTextEditorInterfaceComponent } from "../components/interface-builder/components/form/rich-text-editor/RichTextEditorInterfaceComponent"
import { SectionedNavigationInterfaceComponent } from "../components/interface-builder/components/display/sectioned-navigation/SectionedNavigationInterfaceComponent"
import { SelectInterfaceComponent } from "../components/interface-builder/components/form/select/SelectInterfaceComponent"
import { TableInterfaceComponent } from "../components/interface-builder/components/display/table/TableInterfaceComponent"
import { TabsInterfaceComponent } from "../components/interface-builder/components/display/tabs/TabsInterfaceComponent"
import { TagsInterfaceComponent } from "../components/interface-builder/components/form/tags/TagsInterfaceComponent"
import { TextAreaInterfaceComponent } from "../components/interface-builder/components/form/textarea/TextAreaInterfaceComponent"
import { TimeRangeInterfaceComponent } from "../components/interface-builder/components/form/time-range/TimeRangeInterfaceComponent"
import { ToggleInterfaceComponent } from "../components/interface-builder/components/form/toggle/ToggleInterfaceComponent"
import { TreeInterfaceComponent } from "../components/interface-builder/components/form/tree/TreeInterfaceComponent"
import { UploadInterfaceComponent } from "../components/interface-builder/components/form/upload/UploadInterfaceComponent"
import { UserInterfaceInterfaceComponent } from "../components/interface-builder/components/special/user-interface/UserInterfaceInterfaceComponent"
import { WizardInterfaceComponent } from "../components/interface-builder/components/display/wizard/WizardInterfaceComponent"
/* TODO: Menu needs to implement data fetching and updates with Selectable. Patrick mentioned possibly changing Selectable to use Query. */
// import { MenuInterfaceComponent } from "../components/interface-builder/components/display/menu/MenuInterfaceComponent"
/* TODO: Button needs to execute LBMs */
// import { ButtonInterfaceComponent } from "../components/interface-builder/components/form/button/ButtonInterfaceComponent"

export default {
  // button: ButtonInterfaceComponent,
  card: CardInterfaceComponent,
  checkbox: CheckboxInterfaceComponent,
  "code-editor": CodeEditorInterfaceComponent,
  collapse: CollapseInterfaceComponent,
  column: ColumnInterfaceComponent,
  "bulk-text-input": BulkTextInputInterfaceComponent,
  "data-map": DataMapInterfaceComponent,
  "data-dictionary": DataDictionaryInterfaceComponent,
  date: DateInterfaceComponent,
  "date-range": DateRangeInterfaceComponent,
  divider: DividerInterfaceComponent,
  download: DownloadInterfaceComponent,
  // menu: MenuInterfaceComponent,
  empty: EmptyInterfaceComponent,
  form: FormInterfaceComponent,
  input: InputInterfaceComponent,
  list: ListInterfaceComponent,
  "number-input": NumberInputInterfaceComponent,
  "number-range": NumberRangeInterfaceComponent,
  password: PasswordInterfaceComponent,
  progress: ProgressInterfaceComponent,
  "rich-text-editor": RichTextEditorInterfaceComponent,
  "sectioned-navigation": SectionedNavigationInterfaceComponent,
  select: SelectInterfaceComponent,
  table: TableInterfaceComponent,
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
