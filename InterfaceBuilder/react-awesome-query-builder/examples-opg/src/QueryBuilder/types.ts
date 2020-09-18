import { BuilderProps, Config, ImmutableTree } from "react-awesome-query-builder"

export interface DemoQueryBuilderState {
  tree: ImmutableTree
  config: Config
  matchResults: {}[]
}

export interface CustomBuilderProps extends BuilderProps {
  onReset: () => void
  onClear: () => void
  onGenerateList: (results: any) => void
}