import { Lifecycle, Component } from './interfaces'

export enum ErrorReason {
  missingComponent = 'missing-component',
  nullComponent = 'null-component',
  componentThrewException = 'component-threw-exception'
}

export interface SystemErrorParams {
  message: string
  systemKey: string
  system: Lifecycle
}

interface SystemError {
  message: string
  system: Lifecycle
  systemKey: string
  reason: ErrorReason
}

export class MissingComponentError extends Error implements SystemError {
  system: Lifecycle
  systemKey: string
  reason: ErrorReason
  component?: Component
  dependencyKey?: string

  constructor(params: SystemErrorParams & {component?: Component, dependencyKey?: string}) {
    super(params.message)
    this.system = params.system
    this.systemKey = params.systemKey
    this.reason = ErrorReason.missingComponent
    this.component = params.component
    this.dependencyKey = params.dependencyKey
  }
}

export class NullComponentError extends Error implements SystemError {
  system: Lifecycle
  systemKey: string
  reason: ErrorReason

  constructor(params: SystemErrorParams) {
    super(params.message)
    this.system = params.system
    this.systemKey = params.systemKey
    this.reason = ErrorReason.nullComponent
  }
}

export class ComponentMethodError extends Error implements SystemError {
  system: Lifecycle
  systemKey: string
  reason: ErrorReason
  function: Function
  component: Component

  constructor(params: SystemErrorParams & { function: Function, component: Component }) {
    super(params.message)
    this.system = params.system
    this.systemKey = params.systemKey
    this.reason = ErrorReason.nullComponent
    this.function = params.function
    this.component = params.component
  }
}