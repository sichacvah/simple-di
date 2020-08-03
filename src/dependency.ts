interface NodeGraph<T> {
  dependents: Map<T, Set<T>>
  dependencies: Map<T, Set<T>>
}

export interface DependencyGraph<Node extends string = string> {
  /** Returns the set of immediate dependencies of node. */
  immediateDependencies: (node: Node) => Set<Node>
  /** Returns the set of immediate dependents of node. */
  immediateDependents: (node: Node) => Set<Node>
  /** Returns the set of all things which node depends on, directly or transitively. */
  transitiveDependencies: (node: Node) => Set<Node>
  /** Returns the set of all things which any node in node-set depends on, directly or transitively. */
  transitiveDependenciesSet: (node: Set<Node>) => Set<Node>
  /** Returns the set of all things which depend upon node, directly or transitively.  */
  transitiveDependents: (node: Node) => Set<Node>
  /** Returns the set of all things which depend upon any node in node-set, directly or transitively. */
  transitiveDependentsSet: (node: Set<Node>) => Set<Node>
  /** Returns the set of all nodes in graph. */
  nodes: () => Set<Node>
}

export interface DependencyGraphUpdate<Node extends string = string> {
  /** Returns a new graph with a dependency from node to dep (\"node depends on dep\"). Forbids circular dependencies. */
  depend: (node: Node, dependency: Node) => DependencyGraph<Node>

  /** Returns a new graph with the dependency from node to dep removed. */
  removeEdge: (node: Node, dependency: Node) => DependencyGraph<Node>

  /** Returns a new dependency graph with all references to node removed. */
  removeAll: (node: Node) => DependencyGraph<Node>

  /** Removes the node from the dependency graph without removing it as a
    dependency of other nodes. That is, removes all outgoing edges from node. */
  removeNode: (node: Node) => DependencyGraph<Node>
}

const setConjunctive = <T>(entity: T, entities: Set<T> = new Set<T>()) => {
  const arrayEnt = Array.from(entities.values())
  arrayEnt.push(entity)
  return new Set(arrayEnt)
}

const updateIn = <T>(graph: Map<T, Set<T>>, key: T, entity: T): Map<T, Set<T>> => {
  const mapCopy = new Map(graph)
  return mapCopy.set(
    key,
    setConjunctive(
      entity,
      graph.get(key),
    ),
  )
}

const removeFromMap = <T extends string = string>(map: Map<T, Set<T>>, x: T): Map<T, Set<T>> => {
  const clone = new Map(map)
  clone.delete(x)
  return Array.from(clone.entries()).reduce((acc, [key, value]) => {
    return acc.set(key, removeFromSet(x, value))
  }, new Map<T, Set<T>>())
}

/**
 * Recursively expands the set of dependency relationships starting at (get neighbors x), for each x in nodeSet
 */
const transitive = <T>(neighbors: Map<T, Set<T>>, nodeSet: Set<T>) => {
  const initialUnexpanded = Array.from(nodeSet.values()).reduce((unexpanded, value) => {
    const values = neighbors.get(value)?.values() ?? []
    return unexpanded.concat(Array.from(values))
  }, [] as Array<T>)

  const expanded = new Set<T>()

  const recur = (unexpanded: Array<T>, expanded: Set<T>): Set<T> => {
    const [node, ...more] = unexpanded
    if (!node) return expanded
    if (expanded.has(node)) {
      return recur(more, expanded)
    } else {
      const next = Array.from(
        neighbors.get(node)?.values() ?? []
      )
      const clone = new Set(expanded)
      clone.add(node)
      return recur(next.concat(more || []), clone)
    }
  }

  
  return recur(initialUnexpanded, expanded)
}

export const isDepend = <Node extends string = string>(graph: DependencyGraph<Node>, x: Node, y: Node) => {
  return graph.transitiveDependencies(x).has(y)
}

export const isDependency = <Node extends string = string>(graph: DependencyGraph<Node>, x: Node, y: Node) => {
  return graph.transitiveDependents(x).has(y)
}

const removeFromSet = <Node extends string = string>(node: Node, nodesSet: Set<Node> = new Set<Node>()) => {
  const clone = new Set(nodesSet)
  clone.delete(node)
  return clone
}

export const graph = <Node extends string = string>(nodeGraph?: Partial<NodeGraph<Node>>) => {
  const dependencies = nodeGraph?.dependencies ?? new Map<Node, Set<Node>>()
  const dependents = nodeGraph?.dependents  ?? new Map<Node, Set<Node>>()
  return new MapDependencyGraph({ dependencies, dependents })
}

export class MapDependencyGraph<Node extends string = string> implements DependencyGraph<Node>, DependencyGraphUpdate<Node>  {
  _dependencies: NodeGraph<Node>['dependencies']
  _dependents: NodeGraph<Node>['dependents']

  constructor({ dependencies, dependents }: NodeGraph<Node>) {
    this._dependencies = dependencies
    this._dependents = dependents
  }

  immediateDependencies = (node: Node) => {
    return this._dependencies.get(node) || new Set()
  }
  immediateDependents = (node: Node) => {
    return this._dependents.get(node) || new Set()
  }
  transitiveDependencies = (node: Node) => {
    return transitive(this._dependencies, new Set([node]))
  }
  transitiveDependents = (node: Node) => {
    return transitive(this._dependents, new Set([node]))
  }
  transitiveDependenciesSet = (nodeSet: Set<Node>) => {
    return transitive(this._dependencies, nodeSet)
  }
  transitiveDependentsSet = (nodeSet: Set<Node>) => {
    return transitive(this._dependents, nodeSet)
  }
  nodes = () => {
    return new Set(
      Array.from(this._dependents.keys()).concat(
        Array.from(this._dependencies.keys())
      )
    )
  }
  depend = (node: Node, dependency: Node) => {
    if (node === dependency || isDepend(this, dependency, node)) {
      throw new Error(`Circular dependency between ${node} and ${dependency}`)
    }
    const dependencies = this.getDependencies()
    const dependents = this.getDependents()
    return new MapDependencyGraph({
      dependencies: dependencies.set(node, setConjunctive(dependency, dependencies.get(node))),
      dependents: dependents.set(dependency, setConjunctive(node, dependents.get(dependency)))
    })
  }

  getDependencies = () => new Map(this._dependencies.entries())
  getDependents = () => new Map(this._dependents.entries())
  removeEdge = (node: Node, dependency: Node) => {
    const dependencies = this.getDependencies()
    const dependents = this.getDependents()

    return new MapDependencyGraph({
      dependencies: dependencies.set(node, 
        removeFromSet(dependency, dependencies.get(node))
      ),
      dependents: dependents.set(dependency, 
        removeFromSet(node, dependents.get(dependency))
      )
    })
  }
  removeAll = (node: Node) => {
    const dependencies = this.getDependencies()
    const dependents = this.getDependents()
  
    return new MapDependencyGraph({
      dependencies: removeFromMap(dependencies, node),
      dependents: removeFromMap(dependents, node)
    })
  }
  removeNode = (node: Node) => {
    const dependencies = this.getDependencies()
    dependencies.delete(node)
    return new MapDependencyGraph({
      dependencies,
      dependents: this._dependents
    })
  } 
}

const topoSortHelper = <Node extends string = string>(todo: Set<Node>, graph: MapDependencyGraph<Node>, sorted: Array<Node> = []): Array<Node> => {
  if (todo.size === 0) {
    return sorted
  }

  const [node, ...more] = Array.from(todo.values())
  const deps = graph.immediateDependencies(node)
  const [add, resultGraph] = Array.from(deps.values()).reduce(([add, g], dep) => {
    const restGraph = g.removeEdge(node, dep) as MapDependencyGraph<Node>
    const nextAdd = g.immediateDependents(node).size === 0 ? add.add(dep) : add
    return [nextAdd, restGraph]
  }, [new Set<Node>(), graph])

  return topoSortHelper(
    new Set(
      more.concat(Array.from(add))
    ),
    resultGraph.removeNode(node),
    [node].concat(sorted)
  )
}

const maxNumber = Number.MAX_VALUE

export const topoSort = <Node extends string = string>(
  graph: MapDependencyGraph<Node>
) => {
  const nodes = Array.from(graph.nodes())
  const todo = new Set(
    nodes.filter(node => graph.immediateDependents(node).size === 0)
  )
  
  return topoSortHelper(todo, graph)
}

export const topoComparator = <Node extends string = string>(graph: MapDependencyGraph<Node>) => {
  const sorted = topoSort(graph)

  return (a: Node, b: Node) => {
    let indexA = sorted.findIndex(v => v === a)
    if (indexA === -1) {
      indexA = maxNumber
    }
    let indexB = sorted.findIndex(v => v === b)
    if (indexB === -1) {
      indexB = maxNumber
    }
    return (indexA - indexB)
  }
}