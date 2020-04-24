import * as Formik from "formik"
import * as record from "fp-ts/lib/Record"
import React from "react"
import { AdminUserInterfaceContextManagerProvider } from "../../../data/AdminUserInterfaceContextManager"
import { AppDispatch } from "../../../state/store.types"
import { Form } from "antd"
import { Identity } from "fp-ts/lib/Identity"
import { isWhitespace } from "../../../lib/string"
import { JSONRecord } from "../../../data/JSON"
import { none, Option, some, tryCatch } from "fp-ts/lib/Option"
import { ComponentDefinition, UserInterface, UserInterfaceProps } from "@opg/interface-builder"
import { InProgressRemoteUpdateDraft } from "../../../data/GlobalConfig.Config"
import { mapData } from "./mapData"
import { ReportDetailsType, Values } from "./types"

export interface ReportDetailsProps {
  details: ReportDetailsType
  dispatch: AppDispatch
  rowData: JSONRecord
  onChangeData: UserInterfaceProps["onChangeData"]
  parameterValues?: JSONRecord
  parentData?: JSONRecord
  layout: ComponentDefinition[]
}

export const ReportDetails = ({
  details,
  dispatch,
  rowData,
  onChangeData,
  parameterValues,
  parentData,
  layout,
}: ReportDetailsProps) => {
  const [updatedConfig, setUpdatedConfig] = React.useState<Option<InProgressRemoteUpdateDraft>>(
    none
  )
  const initialFormState = { config: JSON.stringify(rowData) }
  const dataResolver = getDataResolver(details, parentData)

  /****************************************************************
   * EVENT HANDLERS
   */

  /* afterCreate */
  // React.useEffect(() => {
  //   updatedConfig.chain(findInStore).foldL(
  //     None(() => {}),
  //     Some((c) => {
  //       dispatch.navigation.showGlobalConfigById({ id: c.id, navOpts: { replace: true } })
  //     })
  //   )
  //
  //   function findInStore(c: InProgressRemoteUpdateDraft): Option<PersistedConfig> {
  //     return findFirst(array)(fromStore.configs.getOrElse([]), (c1) =>
  //       equals(c, { ...c1, config: c1.config.getOrElse("") })
  //     )
  //   }
  //   function equals<T extends InProgressRemoteUpdateDraft>(a: T, b: T): boolean {
  //     return getStructSetoid({
  //       config: setoidString,
  //       id: setoidString,
  //       name: setoidString,
  //       type: setoidString,
  //     }).equals(a, b)
  //   }
  // }, [dispatch, fromStore.configs, updatedConfig])

  const validateHandler = (
    vs: any //Values
  ) =>
    new Identity({})
      .map((errs) => ({
        ...errs,
        config: isWhitespace(vs.config) ? some("Cannot be empty") : none,
      }))
      .map(record.compact)
      .extract()

  const submitHandler = (
    values: Values,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    // setUpdatedConfig(some({ ...rowData, ...values }))
    // dispatch.globalConfig
    //   .updateRemoteConfig({
    //     ...rowData,
    //     ...values,
    //   })
    //   .then(() => setSubmitting(false))
  }

  const handleChangeDataFromChildren = (form: Formik.FormikProps<Values>) => (
    value: JSONRecord
  ) => {
    console.log("ReportBody.handleChangeData!", value)
    form.setFieldValue("config", JSON.stringify(value, null, 2))
    form.setFieldTouched("config", true)
    if (onChangeData) {
      // Call parent's callback
      onChangeData(value)
    }
  }

  /****************************************************************
   * RENDER
   */

  return (
    <AdminUserInterfaceContextManagerProvider>
      {(userInterfaceContextManager) => (
        <Formik.Formik
          initialValues={initialFormState}
          enableReinitialize
          validate={validateHandler}
          onSubmit={submitHandler}>
          {(form) => (
            <Form
              labelAlign="left"
              layout="horizontal"
              onSubmit={form.handleSubmit}
              {...formItemLayout}
              style={{ width: "100%" }}>
              <UserInterface
                mode="display"
                contextManager={userInterfaceContextManager}
                components={layout}
                onChangeData={handleChangeDataFromChildren(form)}
                data={dataResolver({
                  ...(parentData || record.empty),
                  ...(parameterValues || record.empty),
                  ...parseConfig(form.values.config),
                })}
              />
            </Form>
          )}
        </Formik.Formik>
      )}
    </AdminUserInterfaceContextManagerProvider>
  )
}

/***************************************************************************
 *
 * Private Functions
 */

function getDataResolver(
  details: ReportDetailsProps["details"],
  parentData: JSONRecord | undefined
) {
  return typeof details === "object" &&
    (details.type === "report" || details.type === "layout" || details.type === "ReportConfig") &&
    !!details.dataMapping
    ? mapData.bind(null, details.dataMapping)
    : (rowData: JSONRecord) => ({ ...(parentData || record.empty), ...rowData })
}

function parseConfig(config: string) {
  return tryCatch(() => JSON.parse(config)).getOrElse({})
}

const formItemLayout = {
  labelCol: {
    xs: { span: 12 },
    sm: { span: 8 },
    md: { span: 4 },
    lg: { span: 2 },
  },
  wrapperCol: {
    xs: { span: 12 },
    sm: { span: 16 },
    md: { span: 20 },
    lg: { span: 22 },
  },
}
