import * as Reach from "@reach/router"
import { Empty, Tag, Tree } from "antd"
import * as record from "fp-ts/lib/Record"
import React from "react"
import { useRematch } from "../../../hooks/use-rematch"
import { store } from "../../../state/store"
import { RelationshipTreeProps } from "./types"
import { none } from "fp-ts/lib/Option"

const normalizeURLParams = (param: string) => (typeof param === "string" ? param.toLowerCase() : param)

export function RelationshipTree({ configId }: RelationshipTreeProps): JSX.Element | null {
  const [fromStore /*, dispatch*/] = useRematch((appState) => ({
    associations: store.select.globalConfig.associations(appState),
    configsById: store.select.globalConfig.configsById(appState),
  }))
  const focusedConfig = React.useMemo(() => {
    if (!configId || configId.length === 0) {
      return none
    }
    return record.lookup(normalizeURLParams(configId), fromStore.configsById)
  }, [configId, fromStore.configsById])
  const config = focusedConfig.toNullable()
  const association = focusedConfig.chain(({ id }) => record.lookup(id, fromStore.associations))

  return (
    <>
      {association.foldL(
        () => (
          <Empty description={`No configs found related to ${configId}`} />
        ),
        (assoc) => (
          <>
            {config ? config.name : "Untitled Component"}
            <Tree.DirectoryTree>
              {record.toArray(assoc).map(([key, guidArray]) => (
                <Tree.TreeNode selectable={false} title={`${key} (${guidArray.length})`} key={key}>
                  {guidArray.map((guid) => {
                    const associatedRecord = record.lookup(guid, fromStore.configsById)
                    return associatedRecord.foldL(
                      () => (
                        <Tree.TreeNode
                          isLeaf
                          selectable={false}
                          title={
                            <>
                              <Tag>Unknown GUID</Tag>
                              <Reach.Link to={`/${guid}`}>{guid}</Reach.Link> is not a known Global Config ID
                            </>
                          }
                          key={guid}
                        />
                      ),
                      (r) => (
                        <Tree.TreeNode
                          isLeaf
                          selectable={false}
                          title={
                            <>
                              <Tag>{r.type}</Tag>
                              <Reach.Link to={`/${guid}`}>{r.name}</Reach.Link>
                            </>
                          }
                          key={guid}
                        />
                      )
                    )
                  })}
                </Tree.TreeNode>
              ))}
            </Tree.DirectoryTree>
          </>
        )
      )}
    </>
  )
}
