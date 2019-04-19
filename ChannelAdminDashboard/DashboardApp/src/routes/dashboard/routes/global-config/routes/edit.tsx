import * as Reach from "@reach/router"
import { Alert, Button, Col, Empty, PageHeader, Row, Skeleton, Typography } from "antd"
import { IO } from "fp-ts/lib/IO"
import { fromEither, getSetoid, none, Option, some } from "fp-ts/lib/Option"
import { insert, lookup } from "fp-ts/lib/Record"
import { setoidString } from "fp-ts/lib/Setoid"
import React from "react"
import { ConfirmableDeleteButton } from "../../../../../components/button/confirmable-delete"
import { CodeEditor, EditorLangCodec } from "../../../../../components/code-editor"
import { fromStrToJSONRec } from "../../../../../data/JSON"
import { None, Some } from "../../../../../data/Option"
import { useRematch } from "../../../../../hooks/use-rematch"
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
    draftConfig: s.globalConfig.draftConfig,
    entityTypes: store.select.globalConfig.entityTypeConfigs(s),
    isUpdatingRemoteConfig: s.loading.effects.globalConfig.updateRemoteConfig,
  }))

  const [state, setState] = React.useState({
    draft: none as Option<string>,
  })

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
            <PageHeader
              extra={
                <>
                  <Button
                    disabled={
                      state.draft.isNone() ||
                      getSetoid(setoidString).equals(
                        state.draft,
                        focusedConfig.chain((c) => c.config)
                      )
                    }
                    icon={fromStore.isUpdatingRemoteConfig ? "loading" : "save"}
                    key="save"
                    loading={fromStore.isUpdatingRemoteConfig}
                    size="small"
                    type="primary"
                    onClick={updateRemoteConfig}>
                    Save
                  </Button>
                  <ConfirmableDeleteButton
                    confirmationMessage={`Are you sure want to delete?`}
                    confirmationTitle={`Confirm Delete`}
                    size="small"
                    onDelete={() => dispatch.globalConfig.deleteRemoteConfigsById([config.id])}>
                    Delete
                  </ConfirmableDeleteButton>
                </>
              }
              subTitle={config.id.toUpperCase()}
              title={`Edit Config`}>
              {/*  */}
              <Row type="flex" dir="column" gutter={10}>
                <Col xs={{ span: 12 }} sm={{ span: 8 }} md={{ span: 4 }} lg={{ span: 2 }}>
                  <Typography.Text strong>Type: </Typography.Text>
                </Col>
                <Col xs={{ span: 12 }} sm={{ span: 16 }} md={{ span: 20 }} lg={{ span: 22 }}>
                  <Typography.Text>
                    {entityTypeConfig.foldL(
                      None(() => <span>{config.type}</span>),
                      Some((entityTypeConfig) => (
                        <Reach.Link to={`../../${entityTypeConfig.id}`}>{config.type}</Reach.Link>
                      ))
                    )}
                  </Typography.Text>
                </Col>
              </Row>
              <Row type="flex" dir="column" gutter={10}>
                <Col xs={{ span: 12 }} sm={{ span: 8 }} md={{ span: 4 }} lg={{ span: 2 }}>
                  <Typography.Text strong>Name: </Typography.Text>
                </Col>
                <Col xs={{ span: 12 }} sm={{ span: 16 }} md={{ span: 20 }} lg={{ span: 22 }}>
                  <Typography.Text>{config.name}</Typography.Text>
                </Col>
              </Row>
            </PageHeader>
            <CodeEditor
              content={focusedConfig.chain((c) => c.config).getOrElse("")}
              contentDraft={state.draft.alt(focusedConfig.chain((c) => c.config))}
              height={500}
              language={editorLanguage}
              width="100%"
              onChange={(value) => setState(insert("draft", some(value), state))}
            />
          </>
        ))
      )}
    </Skeleton>
  )
}
