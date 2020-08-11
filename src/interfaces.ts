export interface Lifecycle<Dependencies = any> extends Record<string, any> {
  start: (dependencies: Dependencies) => (Promise<Lifecycle> | Lifecycle)
  stop: (dependencies: Dependencies) => (Promise<Lifecycle> | Lifecycle)
}

export interface Component {
  lifecycle: Lifecycle
  __dependencies: Record<string, string>
}