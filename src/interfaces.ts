export interface Lifecycle extends Record<string, any> {
  start: (lifecycle: Lifecycle) => Lifecycle
  stop: (lifecycle: Lifecycle) => Lifecycle
}

export interface Component extends Lifecycle {
  __dependencies: Record<string, string>
}