/**
 * Your state type will extend this type, using the ActionCreator object map type as the generic
 * This will create an additional state key "loading" which will have keys for every action creator
 * key in the ActionCreatorType object
 */
export type LoadifyStateType<ActionCreatorType> = {
  loading: { [key in keyof ActionCreatorType]: { [key: string]: boolean } }
}

const UPDATE_LOADING_STATE_ACTION_TYPE = "__updateLoadingState"
type UPDATE_LOADING_STATE_TYPE = "__updateLoadingState"

/**
 * Wrap this around context objects to inject the corresponding loading states to the action creators
 * @param dispatch - A reducer dispatch function
 * @param actionCreators - An object map of action creators
 */
export function loadifyContext<T extends object, A extends FSA>(
  dispatch: (action: A) => void,
  actionCreators: T
): T {
  // Base object, don't mutate the input parameter
  const updatedActionCreators: T = {
    ...actionCreators,
  }
  // Reduce across the action creators
  return Object.entries(actionCreators).reduce((acc, entry) => {
    const [key, value] = entry
    // If the the item is a function, we're going to wrap the function
    if (typeof value === "function") {
      // Simply replace the function in the map with a wrapper around it
      acc[key] = loadingDetectionWrapper(key, value, dispatch)
    } else {
      // Leave other value types alone
      acc[key] = value
    }
    return acc
  }, updatedActionCreators)
}

/**
 * Wraps a given function such that when the function executes, if it returns a Promise, the state
 * of it will be marked as loading, and when the promise resolves, it will be marked as not loading
 * @param key The identifier to use for this function, typically the name of the function in the action creator map
 * @param fn The function itself. Can have any signature and return type
 * @param dispatch A reducer dispatch function
 */
const loadingDetectionWrapper = (key: string, fn: Function, dispatch: (action: FSA) => void) => {
  // Since we're wrapping a function, we need to return our own function. Consumes unknown numbers of args to
  // pass through to the wrapped function
  return (...args: unknown[]) => {
    // Run the wrapped function and capture the result
    const result = fn(...args)

    // If the result is a Promise then we're now waiting asynchrnously for it to return
    if (result instanceof Promise) {
      // Update the reducer with the loading state of this function set to true
      // Function arguments are used to key the loading state so that multiple instances of this
      // function can be tracked simultaneously
      // TODO: If the same function with the same arguments is run multiple times,
      // we should actually return the promise for that while it's loading
      dispatch({
        type: UPDATE_LOADING_STATE_ACTION_TYPE,
        payload: { key, args: JSON.stringify(args), value: true },
      })
      // We don't want any other function to get the result of this promise before us, so we
      // return our .then, ensuring nothing else runs sooner
      return result.then((promiseValue: unknown) => {
        // Update the reducer with the loading state of this function set to false
        dispatch({
          type: UPDATE_LOADING_STATE_ACTION_TYPE,
          payload: { key, args: JSON.stringify(args), value: false },
        })

        // Return the original resulting value of the promise
        return promiseValue
      })
    }
    // In the case that the return value was not a promise, simply return that value
    return result
  }
}

type UpdateLoadingStateAction = FSA<
  UPDATE_LOADING_STATE_TYPE,
  { key: string; args: string; value: boolean }
>

/**
 * Wrap this around reducer objects to inject the corresponding loading states to the action creators.
 * That state type must extend GetGotContextLoadingType and the action types must extend FSA
 * @param reducer
 */
export const loadifyReducer = <StateType extends LoadifyStateType<unknown>, ActionType extends FSA>(
  reducer: (state: StateType, action: ActionType) => StateType
) => {
  // We're wrapping a reducer, so we need to return a reducer function signature
  return (state: StateType, action: ActionType | UpdateLoadingStateAction) => {
    // The only actions we want to intercept are UpdateLoadingStateAction, so check for those
    if (isActionUpdateLoadingStateAction(action)) {
      const { key, args, value } = action.payload
      // Update the loading state for the given key and args
      return {
        ...state,
        loading: {
          ...state.loading,
          [key]: {
            ...state.loading[key],
            [args]: value,
          },
        },
      }
    } else {
      // If we didn't find a UpdateLoadingStateAction, then just return the result from the wrapped reducer
      return reducer(state, action)
    }
  }
}

/**
 * Determine and guard if a particular action is a specific UpdateLoadingStateAction
 * @param action
 */
const isActionUpdateLoadingStateAction = (action: FSA): action is UpdateLoadingStateAction => {
  // No other action should be using this specific constant for its type
  return action.type === UPDATE_LOADING_STATE_ACTION_TYPE
}
