"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BulkTextInputInterfaceComponent_1 = require("../components/interface-builder/components/form/bulk-text-input/BulkTextInputInterfaceComponent");
var CardInterfaceComponent_1 = require("../components/interface-builder/components/display/card/CardInterfaceComponent");
var CheckboxInterfaceComponent_1 = require("../components/interface-builder/components/form/checkbox/CheckboxInterfaceComponent");
var CodeEditorInterfaceComponent_1 = require("../components/interface-builder/components/special/code-editor/CodeEditorInterfaceComponent");
var CollapseInterfaceComponent_1 = require("../components/interface-builder/components/display/collapse/CollapseInterfaceComponent");
var ColumnInterfaceComponent_1 = require("../components/interface-builder/components/display/column/ColumnInterfaceComponent");
var DataDictionaryInterfaceComponent_1 = require("../components/interface-builder/components/form/data-dictionary/DataDictionaryInterfaceComponent");
var DataMapInterfaceComponent_1 = require("../components/interface-builder/components/form/data-map/DataMapInterfaceComponent");
var DateInterfaceComponent_1 = require("../components/interface-builder/components/form/date/DateInterfaceComponent");
var DateRangeInterfaceComponent_1 = require("../components/interface-builder/components/form/date-range/DateRangeInterfaceComponent");
var DividerInterfaceComponent_1 = require("../components/interface-builder/components/display/divider/DividerInterfaceComponent");
var DownloadInterfaceComponent_1 = require("../components/interface-builder/components/form/download/DownloadInterfaceComponent");
var EmptyInterfaceComponent_1 = require("../components/interface-builder/components/display/empty/EmptyInterfaceComponent");
var FormInterfaceComponent_1 = require("../components/interface-builder/components/form/FormInterfaceComponent");
var InputInterfaceComponent_1 = require("../components/interface-builder/components/form/input/InputInterfaceComponent");
var ListInterfaceComponent_1 = require("../components/interface-builder/components/display/list/ListInterfaceComponent");
var NumberInputInterfaceComponent_1 = require("../components/interface-builder/components/form/number-input/NumberInputInterfaceComponent");
var NumberRangeInterfaceComponent_1 = require("../components/interface-builder/components/form/number-range/NumberRangeInterfaceComponent");
var PasswordInterfaceComponent_1 = require("../components/interface-builder/components/form/password/PasswordInterfaceComponent");
var ProgressInterfaceComponent_1 = require("../components/interface-builder/components/display/progress/ProgressInterfaceComponent");
var RichTextEditorInterfaceComponent_1 = require("../components/interface-builder/components/form/rich-text-editor/RichTextEditorInterfaceComponent");
var SectionedNavigationInterfaceComponent_1 = require("../components/interface-builder/components/display/sectioned-navigation/SectionedNavigationInterfaceComponent");
var SelectInterfaceComponent_1 = require("../components/interface-builder/components/form/select/SelectInterfaceComponent");
var TableInterfaceComponent_1 = require("../components/interface-builder/components/display/table/TableInterfaceComponent");
var TabsInterfaceComponent_1 = require("../components/interface-builder/components/display/tabs/TabsInterfaceComponent");
var TagsInterfaceComponent_1 = require("../components/interface-builder/components/form/tags/TagsInterfaceComponent");
var TextAreaInterfaceComponent_1 = require("../components/interface-builder/components/form/textarea/TextAreaInterfaceComponent");
var TimeRangeInterfaceComponent_1 = require("../components/interface-builder/components/form/time-range/TimeRangeInterfaceComponent");
var ToggleInterfaceComponent_1 = require("../components/interface-builder/components/form/toggle/ToggleInterfaceComponent");
var TreeInterfaceComponent_1 = require("../components/interface-builder/components/form/tree/TreeInterfaceComponent");
var UploadInterfaceComponent_1 = require("../components/interface-builder/components/form/upload/UploadInterfaceComponent");
var UserInterfaceInterfaceComponent_1 = require("../components/interface-builder/components/special/user-interface/UserInterfaceInterfaceComponent");
var WizardInterfaceComponent_1 = require("../components/interface-builder/components/display/wizard/WizardInterfaceComponent");
/* TODO: Menu needs to implement data fetching and updates with Selectable. Patrick mentioned possibly changing Selectable to use Query. */
// import { MenuInterfaceComponent } from "../components/interface-builder/components/display/menu/MenuInterfaceComponent"
/* TODO: Button needs to execute LBMs */
// import { ButtonInterfaceComponent } from "../components/interface-builder/components/form/button/ButtonInterfaceComponent"
exports.default = {
    // button: ButtonInterfaceComponent,
    card: CardInterfaceComponent_1.CardInterfaceComponent,
    checkbox: CheckboxInterfaceComponent_1.CheckboxInterfaceComponent,
    "code-editor": CodeEditorInterfaceComponent_1.CodeEditorInterfaceComponent,
    collapse: CollapseInterfaceComponent_1.CollapseInterfaceComponent,
    column: ColumnInterfaceComponent_1.ColumnInterfaceComponent,
    "bulk-text-input": BulkTextInputInterfaceComponent_1.BulkTextInputInterfaceComponent,
    "data-map": DataMapInterfaceComponent_1.DataMapInterfaceComponent,
    "data-dictionary": DataDictionaryInterfaceComponent_1.DataDictionaryInterfaceComponent,
    date: DateInterfaceComponent_1.DateInterfaceComponent,
    "date-range": DateRangeInterfaceComponent_1.DateRangeInterfaceComponent,
    divider: DividerInterfaceComponent_1.DividerInterfaceComponent,
    download: DownloadInterfaceComponent_1.DownloadInterfaceComponent,
    // menu: MenuInterfaceComponent,
    empty: EmptyInterfaceComponent_1.EmptyInterfaceComponent,
    form: FormInterfaceComponent_1.FormInterfaceComponent,
    input: InputInterfaceComponent_1.InputInterfaceComponent,
    list: ListInterfaceComponent_1.ListInterfaceComponent,
    "number-input": NumberInputInterfaceComponent_1.NumberInputInterfaceComponent,
    "number-range": NumberRangeInterfaceComponent_1.NumberRangeInterfaceComponent,
    password: PasswordInterfaceComponent_1.PasswordInterfaceComponent,
    progress: ProgressInterfaceComponent_1.ProgressInterfaceComponent,
    "rich-text-editor": RichTextEditorInterfaceComponent_1.RichTextEditorInterfaceComponent,
    "sectioned-navigation": SectionedNavigationInterfaceComponent_1.SectionedNavigationInterfaceComponent,
    select: SelectInterfaceComponent_1.SelectInterfaceComponent,
    table: TableInterfaceComponent_1.TableInterfaceComponent,
    tabs: TabsInterfaceComponent_1.TabsInterfaceComponent,
    tags: TagsInterfaceComponent_1.TagsInterfaceComponent,
    textarea: TextAreaInterfaceComponent_1.TextAreaInterfaceComponent,
    "time-range": TimeRangeInterfaceComponent_1.TimeRangeInterfaceComponent,
    toggle: ToggleInterfaceComponent_1.ToggleInterfaceComponent,
    tree: TreeInterfaceComponent_1.TreeInterfaceComponent,
    upload: UploadInterfaceComponent_1.UploadInterfaceComponent,
    "user-interface": UserInterfaceInterfaceComponent_1.UserInterfaceInterfaceComponent,
    wizard: WizardInterfaceComponent_1.WizardInterfaceComponent,
};
//# sourceMappingURL=ant.ibplugin.js.map