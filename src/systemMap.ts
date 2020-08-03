import * as dependency from './dependency'

type Component<T = any> = {
  init: (deps?: Record<string, any>) => T,
  stop?: () => void
  deps: string[]
}


export const component = <T>(init: (deps?: Record<string, any>) => T, stop?: () => void): Component<T> => ({
  init,
  stop,
  deps: []
})

export const using = <T>(component: Component<T>, deps: string[]) => ({
  ...component,
  deps
})

const noop = () => {}

export const systemMap = <UT = any>(params: Record<string, Component<UT>>): Component => {

  const keys = Object.keys(params)
  const graph = keys.reduce((graph, key) => {
    const component = params[key]
    return component.deps.reduce((g, dep) => {
      return g.depend(key, dep)
    }, graph)
  }, dependency.graph())

  let resolvedDeps = {} as Record<string, any>

  console.log('depsName', dependency.topoSort(graph))
  const uniqDeps = Array.from(new Set(dependency.topoSort(graph)).values())
  return {
    init: () => uniqDeps.forEach((key) => {
      const depsSet = new Set(params[key].deps)
      const depsObject = Object.fromEntries(
        Object.entries(resolvedDeps).filter(([k]) => depsSet.has(k))
      ) 
      resolvedDeps[key] = params[key].init(depsObject)
    }),
    stop: () => uniqDeps.reverse().forEach((key) => {
      const stop = params[key].stop || noop
      delete resolvedDeps[key]
      stop()
    }),
    deps: []
  }
}