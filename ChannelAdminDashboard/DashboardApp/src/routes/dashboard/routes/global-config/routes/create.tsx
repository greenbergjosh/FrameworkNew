import { Button, Card, Col, Form, Icon, Input, Modal, Row, Select, Skeleton } from "antd"
import { Do } from "fp-ts-contrib/lib/Do"
import { sequenceS } from "fp-ts/lib/Apply"
import { array } from "fp-ts/lib/Array"
import { fromValidation as eitherFromValidation } from "fp-ts/lib/Either"
import { findFirst } from "fp-ts/lib/Foldable2v"
import { constant, identity, unsafeCoerce } from "fp-ts/lib/function"
import { IO } from "fp-ts/lib/IO"
import { monoidString } from "fp-ts/lib/Monoid"
import { head, make, nonEmptyArray } from "fp-ts/lib/NonEmptyArray2v"
import {
  fromEither,
  getSetoid as getOptionSetoid,
  none,
  Option,
  option,
  some,
} from "fp-ts/lib/Option"
import * as Record from "fp-ts/lib/Record"
import { getStructSetoid, setoidString } from "fp-ts/lib/Setoid"
import { failure, getSetoid as getSetoidValidation, success } from "fp-ts/lib/Validation"
import { Branded } from "io-ts"
import { NonEmptyStringBrand } from "io-ts-types/lib/NonEmptyString"
import React from "react"
import {
  CodeEditor,
  EditorLang,
  EditorLangCodec,
  editorLanguages,
} from "../../../../../components/code-editor"
import { Space } from "../../../../../components/space"
import { Left, Right } from "../../../../../data/Either"
import {
  CompleteLocalDraft,
  mkCompleteLocalDraft,
  PersistedConfig,
} from "../../../../../data/GlobalConfig.Config"
import { fromStrToJSONRec } from "../../../../../data/JSON"
import { None, Some } from "../../../../../data/Option"
import {
  getApplicativeValidated,
  getSetoidValidatorErrors,
  isNotEmpty,
  isUnique,
  validate,
  Validated,
} from "../../../../../data/Validator"
import { useRematch } from "../../../../../hooks/use-rematch"
import { prettyPrint } from "../../../../../lib/json"
import { isWhitespace } from "../../../../../lib/string"
import { WithRouteProps } from "../../../../../state/navigation"
import { store } from "../../../../../state/store"

interface Props {
  configId: "create"
}
export function CreateGlobalConfig({
  children,
  configId,
  location,
  navigate,
  path,
  uri,
}: WithRouteProps<Props>): JSX.Element {
  const [fromStore, dispatch] = useRematch((s) => ({
    configs: s.globalConfig.configs,
    configsByType: store.select.globalConfig.configsByType(s),
    defaultEntityTypeConfig: s.globalConfig.defaultEntityTypeConfig,
    entityTypeConfigs: store.select.globalConfig.entityTypeConfigs(s),
    isCreatingConfig: s.loading.effects.globalConfig.createRemoteConfig,
  }))

  const [state, setState] = React.useState({
    draft: {
      config: none as Option<Validated<string>>,
      name: none as Option<Validated<string>>,
      type: none as Option<Validated<string>>,
    },
    shouldShowConfigTypeSelectDropdown: false,
    shouldShowCreateEntityModal: false,
  })

  const { entityTypeConfig, editorLanguage } = React.useMemo(() => {
    const entityTypeConfig = state.draft.type
      .chain((t) => t.fold(constant(none), some))
      .chain((t) => Record.lookup(t, fromStore.entityTypeConfigs))

    const editorLanguage = entityTypeConfig
      .chain((etc) => etc.config)
      .chain(fromStrToJSONRec)
      .chain((config) => Record.lookup("lang", config))
      .chain((lang) => fromEither(EditorLangCodec.decode(lang)))
      .getOrElse(fromStore.defaultEntityTypeConfig.lang)

    return { entityTypeConfig, editorLanguage }
  }, [state.draft.type, fromStore.entityTypeConfigs, fromStore.defaultEntityTypeConfig.lang])

  const entityTypeNames = React.useMemo(() => {
    return Object.values(fromStore.entityTypeConfigs).map((c) => c.name)
  }, [fromStore.entityTypeConfigs])

  const configValidation = React.useMemo(() => {
    return sequenceS(option)(state.draft)
      .map((draft) => sequenceS(getApplicativeValidated<string>())(draft))
      .getOrElse(
        failure({
          value: prettyPrint(state.draft),
          reasons: nonEmptyArray.of("some inputs are still clean"),
        })
      )
  }, [state.draft])

  const createConfig = React.useCallback(() => {
    sequenceS(option)(state.draft)
      .map((draft) => sequenceS(getApplicativeValidated<string>())(draft))
      .map((draft) => eitherFromValidation(draft))
      .map((draft) =>
        draft.chain((d) =>
          mkCompleteLocalDraft(d).mapLeft((errs) => ({
            value: prettyPrint(d),
            reasons: make("invalid", errs),
          }))
        )
      )
      .foldL(
        None(() => new IO(() => dispatch.logger.logError("some input is still clean"))),
        Some((draft) =>
          draft.fold(
            Left((err) => new IO(() => dispatch.logger.logError(err.reasons.join("\n")))),
            Right((draft) => new IO(() => void dispatch.globalConfig.createRemoteConfig(draft)))
          )
        )
      )
      .run()
  }, [dispatch, state.draft])

  const toggleCreateEntityTypeModal = React.useCallback(() => {
    setState((s) => ({ ...s, shouldShowCreateEntityModal: !s.shouldShowCreateEntityModal }))
  }, [])

  const setShouldShowConfigTypeSelectDropdown = React.useCallback(() => {
    setState((s) => ({
      ...s,
      shouldShowConfigTypeSelectDropdown: !s.shouldShowConfigTypeSelectDropdown,
    }))
  }, [])

  React.useEffect(
    function showConfigAfterCreate() {
      if (configValidation.isSuccess()) {
        const cs = fromStore.configs.getOrElse([])
        findFirst(array)(cs, equalsDraftConfig).foldL(
          None(() => {}),
          Some((c) => {
            dispatch.navigation.showGlobalConfigById({ id: c.id, navOpts: { replace: true } })
          })
        )
      }
      function equalsDraftConfig({ config, name, type }: PersistedConfig) {
        const setoidOptionValidationString = getOptionSetoid(
          getSetoidValidation(getSetoidValidatorErrors(setoidString), setoidString)
        )
        const { equals } = getStructSetoid({
          config: setoidOptionValidationString,
          name: setoidOptionValidationString,
          type: setoidOptionValidationString,
        })

        return equals(state.draft, {
          config: config.map((c) => success(c)),
          name: some(success(name)),
          type: some(success(type)),
        })
      }
    },
    [configValidation, dispatch, fromStore.configs, state.draft]
  )

  //
  // ─── RENDER ─────────────────────────────────────────────────────────────────────
  //

  return (
    <Skeleton active loading={fromStore.configs.isPending()}>
      <Card
        bordered={false}
        extra={
          <>
            {/* --------- Save Button ----------- */}
            <Button
              disabled={configValidation.isFailure()}
              icon={fromStore.isCreatingConfig ? "loading" : "save"}
              key="save"
              loading={fromStore.isCreatingConfig}
              size="small"
              type="primary"
              onClick={createConfig}>
              Save
            </Button>
          </>
        }
        title={`Create Config`}>
        <Form labelAlign="left" layout="horizontal" {...formItemLayout} style={{ width: "100%" }}>
          {/* ---------- Config.Type Input ---------------- */}
          <Form.Item
            hasFeedback={state.draft.type.isSome()}
            help={state.draft.type
              .chain((ctv) => ctv.fold((fs) => some(fs.reasons), constant(none)))
              .map(head)
              .toUndefined()}
            label="Type"
            style={{ width: "100%" }}
            required={true}
            validateStatus={state.draft.type
              .map((ctv) => ctv.fold(constant<"error">("error"), constant<"success">("success")))
              .toUndefined()}>
            <Select
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Button block ghost type="primary" onMouseDown={toggleCreateEntityTypeModal}>
                    <Icon type="plus-circle" /> New Entity Type
                  </Button>
                </>
              )}
              open={state.shouldShowConfigTypeSelectDropdown}
              placeholder="Select a config type"
              style={{ width: "100%" }}
              value={state.draft.type.chain((t) => t.fold(constant(none), some)).toUndefined()}
              onDropdownVisibleChange={setShouldShowConfigTypeSelectDropdown}
              onSelect={(type) => {
                setState({
                  ...state,
                  draft: { ...state.draft, type: some(validateConfigType(type)) },
                })
              }}>
              {entityTypeNames.map((type) => (
                <Select.Option key={type}>{type}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* ---------- Config.Name Input ---------------- */}
          <Form.Item
            hasFeedback={state.draft.name.isSome()}
            help={state.draft.name
              .chain((name) => name.fold((err) => some(err.reasons), constant(none)))
              .map(head)
              .toUndefined()}
            label="Name"
            required={true}
            validateStatus={state.draft.name
              .map((name) => name.fold(constant<"error">("error"), constant<"success">("success")))
              .toUndefined()}>
            <Input
              placeholder="Enter a unique config name"
              value={state.draft.name
                .chain((n) => n.fold((e) => some(e.value), some))
                .toUndefined()}
              onChange={({ target: t }) =>
                setState({
                  ...state,
                  draft: { ...state.draft, name: some(validateConfigName(t.value.trim())) },
                })
              }
            />
          </Form.Item>

          {/* ---------- Config.Config Input ---------------- */}
          <Form.Item
            hasFeedback={state.draft.config.isSome()}
            help={state.draft.config
              .chain((config) => config.fold((err) => some(err.reasons), constant(none)))
              .map(head)
              .toUndefined()}
            label="Config"
            required={true}
            validateStatus={state.draft.config
              .map((config) =>
                config.fold(constant<"error">("error"), constant<"success">("success"))
              )
              .toUndefined()}>
            <CodeEditor
              content={state.draft.config
                .chain((c) => c.fold((e) => some(e.value), some))
                .getOrElse("")}
              contentDraft={state.draft.config
                .chain((c) => c.fold((e) => some(e.value), some))
                .alt(some(""))}
              height={500}
              language={editorLanguage}
              width="100%"
              onChange={(config) =>
                setState({
                  ...state,
                  draft: { ...state.draft, config: some(validateConfigConfig(config)) },
                })
              }
            />
          </Form.Item>
        </Form>
      </Card>
      <CreateEntityTypeModal
        isVisible={state.shouldShowCreateEntityModal}
        onRequestClose={toggleCreateEntityTypeModal}
      />
    </Skeleton>
  )

  //
  // ─── PRIVATE ────────────────────────────────────────────────────────────────────
  //

  function validateConfigName(name: string): Validated<string> {
    const existingConfigNames = fromStore.configs.getOrElse([]).map((c) => c.name.toLowerCase())

    return validate(name, [
      isNotEmpty(monoidString),
      (n) => (isWhitespace(n) ? failure({ value: n, reason: "must not be blank" }) : success(n)),
      (n) =>
        existingConfigNames.includes(n.toLowerCase())
          ? failure({ value: n, reason: "must be unique" })
          : success(n),
    ])
  }

  function validateConfigType(type: string): Validated<string> {
    return validate(type, [
      isNotEmpty(monoidString),
      function configTypeExists(type) {
        return entityTypeNames.includes(
          unsafeCoerce<string, Branded<string, NonEmptyStringBrand>>(type)
        )
          ? success(type)
          : failure({ value: type, reason: "does not exist" })
      },
    ])
  }

  function validateConfigConfig(c: string): Validated<string> {
    return validate(c, [
      isNotEmpty(monoidString),
      (config) =>
        isWhitespace(config)
          ? failure({ value: config, reason: "must not be blank" })
          : success(config),
    ])
  }
}

function CreateEntityTypeModal(props: { isVisible: boolean; onRequestClose: () => void }) {
  const [fromStore, dispatch] = useRematch((s) => ({
    configs: s.globalConfig.configs,
    configsByType: store.select.globalConfig.configsByType(s),
    defaultEntityTypeConfig: s.globalConfig.defaultEntityTypeConfig,
    isCreatingConfig: s.loading.effects.globalConfig.createRemoteConfig,
  }))

  const [state, setState] = React.useState(getInitialState)

  const resetState = React.useCallback(() => setState(getInitialState()), [])

  const nameValidation = React.useMemo(() => {
    const existingConfigNames = Record.lookup("EntityType", fromStore.configsByType)
      .map((cs) => cs.map((c) => c.name))
      .getOrElse([])

    return state.draft.name.map((name) =>
      validate(name, [
        (n) => (isWhitespace(n) ? failure({ value: n, reason: "must not be blank" }) : success(n)),
        isNotEmpty(monoidString),
        isUnique(setoidString)(existingConfigNames),
      ])
    )
  }, [fromStore.configsByType, state.draft.name])

  const typeValidation = React.useMemo(() => {
    return state.draft.type.map((l) => validate(l, [(x) => success(x)]))
  }, [state.draft.type])

  const langValidation = React.useMemo(() => {
    return state.draft.lang.map((l) => validate(l, [isNotEmpty(monoidString)]))
  }, [state.draft.lang])

  const entityTypeValidation = React.useMemo(() => {
    return Do(option)
      .bind("lang", langValidation)
      .bind("name", nameValidation)
      .bind("type", typeValidation)
      .return(({ lang, name, type }) => {
        return sequenceS(getApplicativeValidated<string>())({ lang, name, type })
      })
      .getOrElse(
        failure({
          value: prettyPrint(state.draft),
          reasons: nonEmptyArray.of("some inputs are still clean"),
        })
      )
  }, [langValidation, nameValidation, state.draft, typeValidation])

  const handleRequestClose = React.useCallback(() => {
    props.onRequestClose()
    resetState()
  }, [props, resetState])

  const createEntityTypeConfig = React.useCallback(() => {
    eitherFromValidation(entityTypeValidation)
      .mapLeft((err) => [...err.reasons])
      .map(({ lang, name, type }) => ({
        type,
        name,
        config: JSON.stringify({ lang }),
      }))
      .chain((draft) => mkCompleteLocalDraft(draft))
      .fold(
        Left((errs) => dispatch.logger.logError(errs.join("\n"))),
        Right((draftConfig) => {
          setState((s) => ({ ...s, submittedDraft: some(draftConfig) }))
          dispatch.globalConfig.createRemoteConfig(draftConfig)
        })
      )
  }, [dispatch.globalConfig, dispatch.logger, entityTypeValidation])

  React.useEffect(
    function requestCloseAfterCreate() {
      const { equals } = getStructSetoid({
        config: getOptionSetoid(setoidString),
        name: setoidString,
        type: setoidString,
      })

      Do(option)
        .bind("configs", fromStore.configs.toOption())
        .bind("draft", state.submittedDraft.map((d) => ({ ...d, config: some(d.config) })))
        .return(identity)
        .chain(({ configs, draft }) => findFirst(array)(configs, (c) => equals(c, draft)))
        .foldL(None(() => {}), Some((c) => handleRequestClose()))
    },
    [entityTypeValidation, dispatch, fromStore.configs, handleRequestClose, state]
  )
  // ────────────────────────────────────────────────────────────────────────────────
  if (!props.isVisible) return null
  return (
    <Modal
      centered
      closable={false}
      destroyOnClose
      footer={null}
      title="Create New Entity Type"
      visible={props.isVisible}
      onCancel={handleRequestClose}>
      <Form layout="vertical">
        <Form.Item
          hasFeedback={nameValidation.isSome()}
          help={nameValidation
            .chain((nv) => nv.fold((err) => some(err.reasons), constant(none)))
            .map(head)
            .toUndefined()}
          label={`Name`}
          validateStatus={nameValidation
            .map((nv) => nv.fold(constant<"error">("error"), constant<"success">("success")))
            .toUndefined()}>
          <Input
            placeholder={`Enter a unique EntityType name`}
            value={state.draft.name.getOrElse("")}
            onChange={(evt) =>
              setState({
                ...state,
                draft: { ...state.draft, name: some(evt.target.value) },
              })
            }
          />
        </Form.Item>
        <Form.Item
          hasFeedback={langValidation.isSome()}
          help={langValidation
            .chain((lv) => lv.fold((err) => some(err.reasons), constant(none)))
            .map(head)
            .toUndefined()}
          label={`Language`}
          validateStatus={langValidation
            .map((lv) => lv.fold(constant<"error">("error"), constant<"success">("success")))
            .toUndefined()}>
          <Select
            placeholder={state.draft.name.fold(
              `Select the config language`,
              (name) => `Select the config language for ${name}`
            )}
            value={state.draft.lang.toUndefined()}
            onSelect={(val) => {
              EditorLangCodec.decode(val).fold(
                function Left(errors) {
                  dispatch.logger.logError(
                    `Attempted to select invalid lang: ${val}\n\n${prettyPrint(errors)}`
                  )
                },
                function Right(lang) {
                  setState((s) => ({ ...s, draft: { ...s.draft, lang: some(lang) } }))
                }
              )
            }}>
            {Object.values(editorLanguages).map((lang) => (
              <Select.Option key={lang} title={lang} value={lang}>
                {lang}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Row type="flex">
          <Col span={12} />
          <Col span={12}>
            <Row align="middle" justify="end" type="flex">
              <Button
                disabled={fromStore.isCreatingConfig}
                icon="close-circle"
                onClick={handleRequestClose}>
                Cancel
              </Button>
              <Space.Vertical width={8} />
              <Button
                disabled={entityTypeValidation.isFailure()}
                htmlType="submit"
                icon="save"
                loading={fromStore.isCreatingConfig}
                type="primary"
                onClick={createEntityTypeConfig}>
                Save
              </Button>
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal>
  )

  // ────────────────────────────────────────────────────────────────────────────────
  function getInitialState() {
    return {
      draft: {
        name: none as Option<string>,
        type: some(identity<"EntityType">("EntityType")),
        lang: none as Option<EditorLang>,
      },
      submittedDraft: none as Option<CompleteLocalDraft>,
    }
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
