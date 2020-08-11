export interface Lifecycle extends Record<string, any> {
  start: (lifecycle: Lifecycle) => Promise<Lifecycle> | Lifecycle
  stop: (lifecycle: Lifecycle) => Promise<Lifecycle> | Lifecycle
}

export interface Component extends Lifecycle {
  __dependencies: Record<string, string>
}