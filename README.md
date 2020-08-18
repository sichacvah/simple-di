# explicit-di

Usage:

```typescript
// composition root file

import { component, systemMap, using } from 'explicit-di'
import { LoggerClient } from '@logger'
import { MessagingClient } from '@messaging'

const componentMap = {
  logger: component(new LoggerClient()),
  messaging: using(
    component(new MessagingClient()),
    deps: ['logger']
  )
}



start(systemMap(componentMap))
```

```typescript
// @logger
import { FancyLogger } from 'fancy-logger-tool'
import { Logger } from '@interfaces'
import { component, LifeCycle } from 'explicit-di'

export class LoggerClient implements LifeCycle, ILogger {
  logger: FancyLogger
  
  constructor() {
    this.logger = new FancyLogger()
  }
  
  start = () => this
  stop = () => this
  
  logMessage = (message: string) => {
    this.logger.proccessMessage(message)
  }
}
```

```typescript
// @messaging
import { subscribe } from 'fancy-messaging-tool'
import { ILogger } from '@interfaces'
import { component, LifeCycle } from 'explicit-di'

interface Deps {
  logger: ILogger
}

export class MessagingClient implements LifeCycle<Deps> {
  unsubscribe?: () => {}
  logger!: ILogger

  start: ({ logger }: Deps) => {
    this.logger = logger
    this.logger.logMessage('Start Listening')
    this.unsubscribe = subscribe()
    return this
  }

  stop: () => {
    if (this.unsubscribe) {
      this.logger.logMessage('Stop listening')
      this.unsubscribe()
    }
    return this
  }
}

```

