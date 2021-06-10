import * as Reach from "@reach/router"
import { tryCatch } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import * as iots from "io-ts"
import { reporter } from "io-ts-reporters"
import JSON5 from "json5"
import { groupBy, sortBy } from "lodash/fp"
import { None, Some } from "../../data/Option"
import * as Store from "../store.types"
import {
  Effects,
  NavigationGroup,
  NavigationGroupAutomaticChildType,
  NavigationGroupCodec,
  NavigationGroupWithChildren,
  NavigationItem,
  NavigationItemCodec,
  Reducers,
  RoutesMap,
  Selectors,
  State,
} from "./types"
import { routes } from "./routes"

export const navigation: Store.AppModel<State<RoutesMap>, Reducers, Effects, Selectors> = {
  state: { routes },

  reducers: {},

  effects: () => ({
    // TODO: FIXME Remove the casting and correct the types for each of the Some cases
    goToDashboard: (opts, { navigation: { routes } }) =>
      opts.foldL(
        None(() => Reach.navigate(routes.dashboard.abs)),
        // eslint-disable-next-line @typescript-eslint/ban-types
        Some((opts) => Reach.navigate(routes.dashboard.abs, opts as Reach.NavigateOptions<{}>))
      ),

    showGlobalConfigById: ({ id, navOpts }, { navigation: { routes } }) => {
      Reach.navigate(`${routes.dashboard.subroutes["global-config"].abs}/${id}`, navOpts)
    },

    goToGlobalConfigs: (opts, { navigation: { routes } }) =>
      opts.foldL(
        None(() => Reach.navigate(routes.dashboard.subroutes["global-config"].abs)),
        Some((opts) =>
          Reach.navigate(
            routes.dashboard.subroutes["global-config"].abs,
            // eslint-disable-next-line @typescript-eslint/ban-types
            opts as Reach.NavigateOptions<{}>
          )
        )
      ),

    goToLanding: (opts, { navigation: { routes } }) =>
      opts.foldL(
        None(() => Reach.navigate(routes.login.abs)),
        // eslint-disable-next-line @typescript-eslint/ban-types
        Some((opts) => Reach.navigate(routes.login.abs, opts as Reach.NavigateOptions<{}>))
      ),

    navigate(path, rootState, navOptions) {
      // eslint-disable-next-line @typescript-eslint/ban-types
      return Reach.navigate(String(path), navOptions as Reach.NavigateOptions<{}>)
    },
  }),

  selectors: (slice, createSelector) => ({
    // navigationGroups
    primaryNavigation(select) {
      return createSelector(
        (state) => select.globalConfig.configsByType(state),
        (state) => select.globalConfig.configsById(state),
        (configsByType, configsById) => {
          const groupedItems = groupBy(
            "group",
            findAndMergeValidConfigs("Navigation.Item", configsByType, NavigationItemCodec)
          )
          const groupedGroups = groupBy(
            "group",
            findAndMergeValidConfigs("Navigation.Group", configsByType, NavigationGroupCodec)
          )

          const topLevelNavigation = sortBy(
            ["ordinal", "name"],
            [...(groupedItems.undefined || []), ...(groupedGroups.undefined || [])]
          )

          const automaticChildTypeToNavigationItem = (
            automaticChildType: NavigationGroupAutomaticChildType
          ): NavigationItem[] => {
            const childTypeRecords = record.lookup(automaticChildType.type, configsByType).foldL(
              () =>
                record
                  .lookup(automaticChildType.type, configsById)
                  .chain((entityTypeConfig) => record.lookup(entityTypeConfig.name, configsByType))
                  .getOrElse([]),
              (result) => result
            )

            return childTypeRecords.map((record) => ({
              active: true,
              description: "",
              group: undefined,
              icon: automaticChildType.icon,
              id: record.id,
              name: record.name,
              ordinal: automaticChildType.ordinal,
              type: "Navigation.Item",
              url: automaticChildType.path
                ? automaticChildType.path.includes("{id}")
                  ? automaticChildType.path.replace("{id}", record.id)
                  : automaticChildType.path.endsWith("/")
                  ? `${automaticChildType.path}${record.id}`
                  : `${automaticChildType.path}/${record.id}`
                : record.id,
            }))
          }

          const resolveNavigationGroupChildren = (navigationGroup: NavigationGroup): NavigationGroupWithChildren => {
            return {
              ...navigationGroup,
              children: sortBy(
                ["ordinal", "name"],
                [
                  ...(groupedItems[navigationGroup.id] || []),
                  ...(groupedGroups[navigationGroup.id] || []).map(resolveNavigationGroupChildren),
                  ...(navigationGroup.automaticChildTypes || []).flatMap(automaticChildTypeToNavigationItem),
                ]
              ),
            }
          }

          const returnMap = topLevelNavigation.map((navEntry) =>
            navEntry.type === "Navigation.Item" ? navEntry : resolveNavigationGroupChildren(navEntry)
          )

          return returnMap
        }
      )
    },
    routes(select) {
      return () => routes
    },
  }),
}

const findAndMergeValidConfigs = <T>(
  type: string,
  configsByType: ReturnType<Store.AppSelectors["globalConfig"]["configsByType"]>,
  Codec: iots.Type<T, any, unknown>
) =>
  record
    .lookup(type, configsByType)
    .fold([], (foundRecords) =>
      foundRecords.map((foundRecord) => {
        const decodedRecord = Codec.decode({
          ...foundRecord,
          ...tryCatch(() => JSON5.parse(foundRecord.config.getOrElse("{}"))).getOrElse({}),
        })
        return decodedRecord.fold(
          () => {
            console.warn(
              "navigation.findAndMergeValidConfigs",
              `Failed to parse ${type}`,
              foundRecord,
              reporter(decodedRecord)
            )
            return null
          },
          (dr) => dr
        )
      })
    )
    .reduce((acc, navEntry) => {
      if (navEntry) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        delete navEntry.config
        acc.push(navEntry)
      }
      return acc
    }, [] as T[])
