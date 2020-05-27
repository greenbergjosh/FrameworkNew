import * as Reach from "@reach/router"
import { ClickParam } from "antd/lib/menu"
import { ColumnProps } from "antd/lib/table"
import {
  isEmpty,
  mapOption,
  range,
  sort,
  uniq
  } from "fp-ts/lib/Array"
import { none, tryCatch } from "fp-ts/lib/Option"
import { ordString } from "fp-ts/lib/Ord"
import * as Record from "fp-ts/lib/Record"
import { setoidString } from "fp-ts/lib/Setoid"
import { delay, Task, task } from "fp-ts/lib/Task"
import { Branded } from "io-ts"
// eslint-disable-next-line no-duplicate-imports
import * as iots from "io-ts"
import { reporter } from "io-ts-reporters"
import { NonEmptyString, NonEmptyStringBrand } from "io-ts-types/lib/NonEmptyString"
import JSON5 from "json5"
import queryString from "query-string"
import React from "react"
import { Helmet } from "react-helmet"
import { ConfirmableDeleteButton } from "../../../../../components/button/confirmable-delete"
import { PersistedConfig } from "../../../../../data/GlobalConfig.Config"
import { useRematch } from "../../../../../hooks/use-rematch"
import { WithRouteProps } from "../../../../../state/navigation"
import { store } from "../../../../../state/store"
import {
  AutoComplete,
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Icon,
  Input,
  List,
  Menu,
  Modal,
  Row,
  Skeleton,
  Table,
  Tag,
  Typography,
} from "antd"

interface Props {}

export function ListGlobalConfig({
  children,
  location,
  navigate,
  path,
  uri,
}: WithRouteProps<Props>): JSX.Element {
  const [fromStore] = useRematch((s) => ({
    configs: s.globalConfig.configs,
  }))

  return fromStore.configs.foldL(
    function Initial() {
      return <Skeleton active={true} loading={true} />
    },
    function Pending() {
      return <Skeleton active={true} loading={true} />
    },
    function Failure(error) {
      return <Empty description={error.message} />
    },
    function Success(configs) {
      return (
        <>
          <ConfigTable configs={configs} />
        </>
      )
    }
  )
}

// -----------------

interface ConfigTableProps {
  configs: Array<PersistedConfig>
}
function ConfigTable({ configs }: ConfigTableProps) {
  const [fromStore, dispatch] = useRematch((s) => ({
    configTypes: store.select.globalConfig.configTypes(s),
    configsById: store.select.globalConfig.configsById(s),
    isDeletingConfigs: s.loading.effects.globalConfig.deleteRemoteConfigsById,
  }))

  const [potentiallyStaleSelectedRowKeys, setSelectedRowKeys] = React.useState<
    Array<Branded<string, NonEmptyStringBrand>>
  >([])

  const selectedRowKeys = React.useMemo(() => {
    return potentiallyStaleSelectedRowKeys.filter((k) =>
      Record.lookup(k, fromStore.configsById).isSome()
    )
  }, [potentiallyStaleSelectedRowKeys, fromStore.configsById])

  const [configTypeFilters, setConfigTypeFilters] = React.useState<Array<string>>(() => {
    const decoded = iots
      .type({ configTypeFilters: iots.union([iots.string, iots.array(iots.string)]) })
      .decode(queryString.parse(window.location.search, { arrayFormat: "comma" }))

    return decoded.fold(
      (error) => {
        console.log("list.tsx", "Error parsing url params", {
          reporter: reporter(decoded),
          search: window.location.search,
          parsed: queryString.parse(window.location.search, { arrayFormat: "comma" }),
        })
        return []
      },
      ({ configTypeFilters }) =>
        Array.isArray(configTypeFilters) ? configTypeFilters : [configTypeFilters]
    )
  })

  const [configNameFilterVal, setConfigNameFilterVal] = React.useState(() =>
    iots
      .type({ configNameFilterVal: iots.string })
      .decode(queryString.parse(window.location.search, { arrayFormat: "comma" }))
      .map(({ configNameFilterVal }) => configNameFilterVal)
      .getOrElse("")
  )

  React.useEffect(() => {
    dispatch.navigation.navigate(
      `?${queryString.stringify(
        {
          configTypeFilters,
          configNameFilterVal,
        },
        { arrayFormat: "comma" }
      )}`
    )
  }, [dispatch, configTypeFilters, configNameFilterVal])

  const [isConfirmBatchDelete, setIsConfirmBatchDelete] = React.useState(false)

  const clearFilters = React.useCallback(() => {
    setConfigNameFilterVal("")
    setConfigTypeFilters([])
  }, [])

  const filtered = React.useMemo(() => {
    const filteredConfigs = configs.filter(whatIWant)
    return {
      configs: filteredConfigs,
      configNames: sort(ordString)(uniq(setoidString)(filteredConfigs.map((c) => c.name))),
      configTypes: sort(ordString)(uniq(setoidString)(filteredConfigs.map((c) => c.type))),
    }
    function whatIWant(c: PersistedConfig): boolean {
      return [
        new RegExp(configNameFilterVal, "i").test(c.name) && configTypeFilters.includes(c.type),
        new RegExp(configNameFilterVal, "i").test(c.name) && isEmpty(configTypeFilters),
      ].some((cond) => cond === true)
    }
  }, [configs, configNameFilterVal, configTypeFilters])

  const nameFilterAutoComplete = React.useRef<AutoComplete>(null)

  const columns = React.useMemo<Array<ColumnProps<PersistedConfig>>>(
    () => [
      {
        title: "Type",
        dataIndex: "type",
        filteredValue: configTypeFilters,
        filters: fromStore.configTypes.map((ts) => ({
          text: ts,
          value: ts,
        })),
        key: "type",
        width: `${100 / 3}%`,
        render: (text, config, idx) => <Typography.Text ellipsis={true}>{text}</Typography.Text>,
        sorter: (a, b) => ordString.compare(a.type, b.type),
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: `${100 / 3}%`,
        sorter: (a, b) => ordString.compare(a.name, b.name),
        filters: filtered.configNames.map((n) => ({ text: n, value: n })),
        filteredValue: configNameFilterVal ? [configNameFilterVal] : [],
        filterDropdown: () => (
          <AutoComplete
            ref={nameFilterAutoComplete}
            allowClear
            autoFocus
            placeholder="Search by Name"
            dataSource={filtered.configNames}
            value={configNameFilterVal}
            onChange={(val) => {
              return val ? setConfigNameFilterVal(val.toString()) : setConfigNameFilterVal("")
            }}
          />
        ),
        onFilterDropdownVisibleChange: (visible: boolean) => {
          const { current } = nameFilterAutoComplete
          visible &&
            current &&
            delay(0, current)
              .chain((instance) => task.of(instance.focus()))
              .run()
        },
        render: (text, config, idx) => (
          <Typography.Text ellipsis={true}>
            <Reach.Link to={config.id}>{text}</Reach.Link>
          </Typography.Text>
        ),
      },
      {
        align: "right",
        title: "Manage",
        key: "adminActions",
        width: `${100 / 3}%`,
        render: (text, config) => (
          <Button.Group size="small">
            <Button ghost={true} title="Edit" type="primary">
              <Reach.Link to={`${config.id}/edit`}>
                <Icon type="edit" />
              </Reach.Link>
            </Button>
            <Button ghost={true} title="Duplicate" type="primary">
              <Reach.Link
                to={`create?type=${encodeURIComponent(config.type)}&name=${encodeURIComponent(
                  config.name
                )}&config=${tryCatch(() =>
                  encodeURIComponent(config.config.getOrElse("{}"))
                ).getOrElse("")}`}>
                <Icon type="copy" />
              </Reach.Link>
            </Button>
            <ConfirmableDeleteButton
              confirmationMessage={`Are you sure want to delete?`}
              confirmationTitle={`Confirm Delete`}
              ghost={true}
              onDelete={() => dispatch.globalConfig.deleteRemoteConfigsById([config.id])}
            />
          </Button.Group>
        ),
      },
    ],
    [configNameFilterVal, configTypeFilters, dispatch, filtered, fromStore.configTypes]
  )

  return (
    <>
      <Helmet>
        <title>Manage Configurations | Channel Admin | OPG</title>
      </Helmet>

      <Card bordered={false} size="small">
        <Row align="middle" type="flex">
          <Col span={12}>
            <Row align="middle" justify="start" type="flex">
              <Button.Group size="small">
                <Dropdown
                  disabled={isEmpty(selectedRowKeys)}
                  trigger={["click"]}
                  overlay={
                    <Menu
                      onClick={({ key }: ClickParam) => {
                        if (key === "batch:delete") {
                          setIsConfirmBatchDelete(true)
                        } else if (key === "batch:clear") {
                          setSelectedRowKeys([])
                        }
                      }}>
                      <Menu.Item key="batch:clear">
                        <Icon type="rollback" /> Clear Selection
                      </Menu.Item>
                      <Menu.Item key="batch:delete">
                        <Typography.Text type="danger">
                          <Icon type="delete" /> Delete
                        </Typography.Text>
                      </Menu.Item>
                    </Menu>
                  }>
                  <Button style={{ marginLeft: 8 }} disabled={isEmpty(selectedRowKeys)}>
                    {isEmpty(selectedRowKeys)
                      ? "Batch Actions"
                      : `${selectedRowKeys.length} Selected`}{" "}
                    <Icon type="down" />
                  </Button>
                </Dropdown>

                <Button
                  disabled={isEmpty(configTypeFilters) && isEmpty(configNameFilterVal.split(""))}
                  onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Button.Group>

              <Modal
                closable={false}
                destroyOnClose={true}
                title="Confirm Batch Delete"
                visible={isConfirmBatchDelete}
                onOk={() => {
                  dispatch.globalConfig.deleteRemoteConfigsById(selectedRowKeys)
                  setIsConfirmBatchDelete(false)
                }}
                onCancel={() => setIsConfirmBatchDelete(false)}
                okText="Delete"
                okType="danger">
                <Typography.Text type="danger">
                  Are you sure you want to delete the selected {selectedRowKeys.length} item
                  {selectedRowKeys.length !== 1 ? "s" : ""}?
                </Typography.Text>
                <List
                  size="small"
                  split={false}
                  header={<div>Items to be deleted:</div>}
                  dataSource={mapOption(selectedRowKeys, (key) =>
                    Record.lookup(key, fromStore.configsById).map((c) => (
                      <>
                        <Tag>{c.type}</Tag>
                        {c.name}
                      </>
                    ))
                  )}
                  renderItem={(item) => <List.Item>{item}</List.Item>}
                />
              </Modal>
            </Row>
          </Col>

          <Col span={12}>
            <Row align="middle" justify="end" type="flex">
              <Reach.Link
                to={
                  configTypeFilters && configTypeFilters.length
                    ? `create?type=${configTypeFilters[0]}`
                    : "create"
                }>
                <Button size="small" type="primary">
                  <Icon type="plus" />
                  New Config
                </Button>
              </Reach.Link>
            </Row>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={filtered.configs}
        loading={fromStore.isDeletingConfigs}
        pagination={{
          defaultPageSize: 15,
          hideOnSinglePage: true,
          pageSizeOptions: range(1, 10).map((n) => `${n * 10}`),
          showSizeChanger: true,
          showTotal: (total, range) => <span>{`${range.join(" - ")} of ${total}`}</span>,
        }}
        rowKey={(config) => config.id}
        rowSelection={{
          onChange: (keys, cs) => {
            setSelectedRowKeys(
              iots
                .array(NonEmptyString)
                .decode(keys)
                .getOrElse([])
            )
          },
          selectedRowKeys,
        }}
        size="middle"
        onChange={(pagination, filters, sorters) => {
          Record.lookup("type", filters).foldL(
            function None() {
              dispatch.logger.logError(`No filters exist on table for Config.Type`)
            },
            function Some(typeFilters) {
              if (typeFilters) {
                setConfigTypeFilters(typeFilters)
              }
            }
          )
        }}
      />
    </>
  )
}

export default ListGlobalConfig
