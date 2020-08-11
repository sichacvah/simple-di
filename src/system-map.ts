import * as dependency from './dependency'
import { Lifecycle, Component } from './interfaces'
import {
  NullComponentError,
  MissingComponentError,
  ComponentMethodError
} from './errors'

const initComponent = (
  lifecycle: Lifecycle,
  dependencies: Record<string, string> = {}
): Component => ({
  ...lifecycle,
  __dependencies: dependencies,
})


const getDependency = (
  system: Lifecycle,
  systemKey: string,
  component: Lifecycle,
  dependencyKey: string
) => {
  const dependency = system[dependencyKey]
  if (dependency === undefined || dependency === null) {
    const message = `Missing dependency ${dependencyKey} of ${typeof component} expected in system at ${systemKey}`
    if (new Set(getComponentKeys(system)).has(dependencyKey)) {
      throw new NullComponentError({
        systemKey,
        system,
        message
      })
    } else {
      throw new MissingComponentError({
        systemKey,
        system,
        message,
        dependencyKey,
        component
      })
    }
  }
  return dependency
}

const getComponent = (system: Lifecycle, key: string) => {
  const component = system[key]
  if (component === undefined || component === null) {
    if (new Set(getComponentKeys(system)).has(key)) {
      throw new NullComponentError({
        systemKey: key,
        system,
        message: `Component ${key} was null or undefined in system; maybe it returned null or undefined from start or stop`
      })
    } else {
      throw new MissingComponentError({
        systemKey: key,
        system,
        message: `Component ${key} was null or undefined in system; maybe it returned null or undefined from start or stop`,
      })
    }
  }
  return component
}

const tryAction = async (
  component: Lifecycle,
  system: Lifecycle,
  func: (lifecycle: Lifecycle) => Lifecycle,
  key: string
) => {
  try {
    return func(component)
  } catch (e) {
    throw new ComponentMethodError({
      message: `Error in component ${key} in system ${typeof system} calling ${func}`,
      component,
      system,
      function: func,
      systemKey: key
    })
  }
}

export const component = (lifecycle: Lifecycle): Component => initComponent(lifecycle)

export const using = (
  lifecycle: Lifecycle,
  dependencies: Record<string, string> | string[]
): Component => {
  const __dependencies = Array.isArray(dependencies) ? Object.fromEntries(dependencies.map(i => [i, i])) : dependencies

  return initComponent(lifecycle, __dependencies)
}

const extractDependency = (
  system: Lifecycle,
  systemKey: string,
  component: Lifecycle
) => {
  const dependenciesMap = getDependencies(component)
  return Object.fromEntries(Object.keys(dependenciesMap).map((dependencyKey) => {
    const dependency = getDependency(system, systemKey, component, dependencyKey)
    return [dependencyKey, dependency]
  }))
}

type MaybeComponent = Partial<Component> | null

const getDependencies = (component: Lifecycle): Record<string, any> => {
  return (component as MaybeComponent)?.__dependencies || {}
}

const getComponentKeys = (component: Record<string, any>) => {
  return Object.keys(component).filter(key => key !== '__dependencies' && key !== 'start' && key !== 'stop')
}

const asyncReduceComponents = async (
  system: Lifecycle,
  componentsKeys: string[],
  method: keyof Lifecycle
): Promise<Lifecycle> => {
  const [key, ...rest] = componentsKeys
  if (!key) return system
  const componentBeforeUpdate = getComponent(system, key)
  const component = {
    ...componentBeforeUpdate,
    ...extractDependency(system, key, componentBeforeUpdate)
  }
  const updatedComponent = await tryAction(component, system, component[method], key)
  const next = {
    ...system,
    [key]: updatedComponent
  }
  return asyncReduceComponents(next, rest, method)
}

const updateSystem = (
  system: Lifecycle,
  method: keyof Lifecycle,
  reverse: boolean
): Promise<Lifecycle> => {
  const keys = getComponentKeys(system)
  const graph = keys.reduce((graph, key) => {
    const component = system[key] as Partial<Component> | null
    const depsNames = Object.values(component?.__dependencies || {})
    return depsNames.reduce((g, dep) => {
      return g.depend(key, dep)
    }, graph)
  }, dependency.graph())

  let components = keys.sort(dependency.topoComparator(graph))

  if (reverse) {
    components = components.reverse()
  }

  return asyncReduceComponents(system, components, method)
}

export const systemMap = (map: Record<string, Component>): Component => {
  const system = {
    ...map,
    start: (system: Lifecycle) => {
      return updateSystem(system, 'start', false)
    },
    stop: (system: Lifecycle) => {
      return updateSystem(system, 'stop', true)
    }
  }

  return component(system)
}

export const start = (lifecycle: Lifecycle) => {
  return lifecycle.start(lifecycle)
}

export const stop = (lifecycle: Lifecycle) => {
  return lifecycle.stop(lifecycle)
}
