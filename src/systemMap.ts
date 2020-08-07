import * as dependency from './dependency'

type Component<T, Deps = Record<string, any>> = {
  init: (deps?: Deps) => T,
  stop?: () => void
  deps: (keyof Deps)[] 
}


export const component = <T, Deps = Record<string, any>>(init: (deps?: Deps) => T, stop?: () => void): Component<T, Deps> => ({
  init,
  stop,
  deps: []
})

export const using = <T, Deps = Record<string, any>>(component: Component<T, Deps>, deps: (keyof Deps)[]) => ({
  ...component,
  deps
})

const noop = () => {}

export const systemMap = <UT = any, Deps = Record<string, any>>(params: Record<string, Component<UT, Deps>>): Component<void> => {

  const keys = Object.keys(params)
  const graph = keys.reduce((graph, key) => {
    const component = params[key]
    return component.deps.reduce((g, dep) => {
      return g.depend(key, dep.toString())
    }, graph)
  }, dependency.graph())

  let resolvedDeps = {} as Record<string, any>

  const uniqDeps = Array.from(new Set(dependency.topoSort(graph)).values())
  return {
    init: () => uniqDeps.forEach((key) => {
      const depsSet = new Set(params[key].deps as string[])
      const depsObject = Object.fromEntries(
        Object.entries(resolvedDeps).filter(([k]) => depsSet.has(k))
      ) 
      resolvedDeps[key] = params[key].init(depsObject as Deps)
      return resolvedDeps
    }),
    stop: () => uniqDeps.reverse().forEach((key) => {
      const stop = params[key].stop || noop
      delete resolvedDeps[key]
      stop()
    }),
    deps: []
  }
}