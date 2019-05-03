import * as Reach from "@reach/router"
import { Alert, Button, Card, Empty, Form, Skeleton, Typography } from "antd"
import { constant } from "fp-ts/lib/function"
import { IO } from "fp-ts/lib/IO"
import { monoidString } from "fp-ts/lib/Monoid"
import { head } from "fp-ts/lib/NonEmptyArray2v"
import { fromEither, getSetoid as getSetoidOption, none, Option, some } from "fp-ts/lib/Option"
import { lookup } from "fp-ts/lib/Record"
import { setoidString } from "fp-ts/lib/Setoid"
import {
  failure,
  getSetoid as getSetoidValidation,
  success,
  Validation,
} from "fp-ts/lib/Validation"
import React from "react"
import { ConfirmableDeleteButton } from "../../../../../components/button/confirmable-delete"
import { CodeEditor, EditorLangCodec } from "../../../../../components/code-editor"
import { fromStrToJSONRec } from "../../../../../data/JSON"
import { None, Some } from "../../../../../data/Option"
import {
  getSetoidValidatorErrors,
  isNotEmpty,
  validate,
  ValidatorErrors,
} from "../../../../../data/Validator"
import { useRematch } from "../../../../../hooks/use-rematch"
import { isWhitespace } from "../../../../../lib/string"
import { WithRouteProps } from "../../../../../state/navigation"
import { store } from "../../../../../state/store"
interface Props {
  configId: string
}
export function EditGlobalConfig({
  children,
  configId,
  location,
  navigate,
  path,
  uri,
}: WithRouteProps<Props>): JSX.Element {
  const [fromStore, dispatch] = useRematch((s) => ({
    configs: s.globalConfig.configs,
    configsById: store.select.globalConfig.configsById(s),
    defaultEntityTypeConfig: s.globalConfig.defaultEntityTypeConfig,
    entityTypes: store.select.globalConfig.entityTypeConfigs(s),
    isUpdatingRemoteConfig: s.loading.effects.globalConfig.updateRemoteConfig,
  }))

  const [state, setState] = React.useState({
    draft: none as Option<string>,
  })

  const draftValidation = React.useMemo(
    () =>
      state.draft.map((draft) =>
        validate(draft, [
          isNotEmpty(monoidString),
          (draft) =>
            isWhitespace(draft)
              ? failure({ value: draft, reason: "cannot be blank" })
              : success(draft),
        ])
      ),
    [state.draft]
  )

  const { focusedConfig, entityTypeConfig, editorLanguage } = React.useMemo(() => {
    const focusedConfig = lookup(configId, fromStore.configsById)
    const entityTypeConfig = focusedConfig.chain((c) => lookup(c.type, fromStore.entityTypes))
    const editorLanguage = entityTypeConfig
      .chain((etc) => etc.config)
      .chain(fromStrToJSONRec)
      .chain((config) => lookup("lang", config))
      .chain((lang) => fromEither(EditorLangCodec.decode(lang)))
      .getOrElse(fromStore.defaultEntityTypeConfig.lang)

    return { focusedConfig, entityTypeConfig, editorLanguage }
  }, [
    configId,
    fromStore.configsById,
    fromStore.entityTypes,
    fromStore.defaultEntityTypeConfig.lang,
  ])

  const isSaveable =
    getSetoidOption(
      getSetoidValidation(getSetoidValidatorErrors(setoidString), setoidString)
    ).equals(
      draftValidation,
      state.draft.map<Validation<ValidatorErrors<string>, string>>(success)
    ) && !getSetoidOption(setoidString).equals(state.draft, focusedConfig.chain((c) => c.config))

  const updateRemoteConfig = React.useCallback(() => {
    focusedConfig
      .chain((c) => state.draft.map((d) => ({ ...c, config: d })))
      .map((draft) => new IO(() => dispatch.globalConfig.updateRemoteConfig(draft)))
      .getOrElse(new IO(() => Promise.resolve(dispatch.logger.logError(`impossible`))))
      .run()
  }, [dispatch, state.draft, focusedConfig])

  React.useEffect(
    function reconcileDraftAndOriginal() {
      setState((s) => ({ ...s, draft: focusedConfig.chain((c) => c.config) }))
    },
    [focusedConfig]
  )

  React.useEffect(
    function afterConfigDelete() {
      if (focusedConfig.isNone() && state.draft.isSome()) {
        dispatch.navigation.goToGlobalConfigs(none)
      }
    },
    [dispatch, focusedConfig, state.draft]
  )

  return (
    <Skeleton active loading={fromStore.configs.isPending()}>
      {focusedConfig.foldL(
        None(() => <Empty description={`No config found with id ${configId}`} />),
        Some((config) => (
          <>
            {entityTypeConfig.isNone() && (
              <Alert
                banner
                closable
                description={`No config of type "EntityType" could be found for configs of type "${
                  config.type
                }." For the best experience, please create an EntityType config for ${config.type}`}
                message={`No EntityType exists for ${config.type}`}
                type="warning"
              />
            )}

            <Card
              bordered={false}
              extra={
                <Button.Group size="small">
                  {SaveButton()}
                  {isSaveable ? (
                    CancelButton()
                  ) : (
                    <ConfirmableDeleteButton
                      confirmationMessage={`Are you sure want to delete?`}
                      confirmationTitle={`Confirm Delete`}
                      size="small"
                      onDelete={() => dispatch.globalConfig.deleteRemoteConfigsById([config.id])}>
                      Delete
                    </ConfirmableDeleteButton>
                  )}
                </Button.Group>
              }
              title={`Edit Config`}>
              <Form
                labelAlign="left"
                layout="horizontal"
                {...formItemLayout}
                style={{ width: "100%" }}>
                {/* ---------- Config.Type Input ---------------- */}
                <Form.Item label="Type" style={{ width: "100%" }}>
                  <Typography.Text>
                    {entityTypeConfig.foldL(
                      None(() => <>{config.type}</>),
                      Some((etc) => <Reach.Link to={`../../${etc.id}`}>{config.type}</Reach.Link>)
                    )}
                  </Typography.Text>
                </Form.Item>

                {/* ---------- Config.Name Input ---------------- */}
                <Form.Item label="Name">
                  <Typography.Text>{config.name}</Typography.Text>
                </Form.Item>

                {/* ---------- Config.Config Input ---------------- */}
                <Form.Item
                  hasFeedback={draftValidation.isSome()}
                  help={draftValidation
                    .chain((dv) => dv.fold((err) => some(err.reasons), constant(none)))
                    .map(head)
                    .toUndefined()}
                  label="Config"
                  required={true}
                  validateStatus={draftValidation
                    .map((dv) =>
                      dv.fold(constant<"error">("error"), constant<"success">("success"))
                    )
                    .chain((status) => (status === "success" ? none : some(status)))
                    .toUndefined()}>
                  <CodeEditor
                    content={state.draft.getOrElse("")}
                    contentDraft={state.draft.alt(some(""))}
                    height={500}
                    language={editorLanguage}
                    width="100%"
                    onChange={(config) =>
                      setState({
                        ...state,
                        draft: some(config),
                      })
                    }
                  />
                </Form.Item>
              </Form>
            </Card>
          </>
        ))
      )}
    </Skeleton>
  )

  function SaveButton() {
    return (
      <Button
        disabled={!isSaveable}
        icon={fromStore.isUpdatingRemoteConfig ? "loading" : "save"}
        key="save"
        loading={fromStore.isUpdatingRemoteConfig}
        size="small"
        type="primary"
        onClick={updateRemoteConfig}>
        Save
      </Button>
    )
  }

  function CancelButton() {
    return (
      <Button
        icon="close-circle"
        key="cancel"
        size="small"
        type="default"
        onClick={() => setState({ draft: focusedConfig.chain((c) => c.config) })}>
        Cancel
      </Button>
    )
  }
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

export default EditGlobalConfig
