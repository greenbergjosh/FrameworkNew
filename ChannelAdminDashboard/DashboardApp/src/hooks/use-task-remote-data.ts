import { initial, pending, RemoteData } from "@devexperts/remote-data-ts"
import { IO } from "fp-ts/lib/IO"
import { Option } from "fp-ts/lib/Option"
import { Task, task } from "fp-ts/lib/Task"
import * as React from "react"

type UseTaskRemoteDataReturn<L, A> = {
  Fold: React.FC<RemoteProps<L, A>>
  run: () => void
  state: RemoteData<L, A>
  prevState: RemoteData<L, A>
}

export function useTaskRemoteData<Args extends VariadicTuple, L, A>(
  getTask: (...args: Args) => Task<RemoteData<L, A>>,
  ...args: Args
): UseTaskRemoteDataReturn<L, A> {
  const [[prev, current], setRD] = React.useState<[RemoteData<L, A>, RemoteData<L, A>]>([
    initial,
    initial,
  ])

  const run = React.useCallback(() => {
    if (current.isPending()) return

    task
      .fromIO(new IO(() => setRD(([_, current]) => [current, pending])))
      .chain(() => getTask(...args))
      .chain((rmtData) => task.fromIO(new IO(() => setRD(([_, current]) => [current, rmtData]))))
      .run()
  }, [setRD, prev, current, ...args])

  const Fold = React.useMemo(() => withRemoteData(current, prev), [current, prev])

  return {
    Fold,
    state: current,
    prevState: prev,
    run,
  }
}

interface RemoteProps<L, A> {
  children: {
    Initial(): React.ReactElement
    Pending(prev: Option<A>): React.ReactElement
    Failure(err: L): React.ReactElement
    Success(val: A): React.ReactElement
  }
}

function withRemoteData<L, A>(
  current: RemoteData<L, A>,
  prev: RemoteData<L, A>
): React.FC<RemoteProps<L, A>> {
  return function Remote(props: RemoteProps<L, A>): React.ReactElement {
    return current.fold(
      props.children.Initial(),
      props.children.Pending(prev.toOption()),
      (e) => props.children.Failure(e),
      (v) => props.children.Success(v)
    )
  }
}
