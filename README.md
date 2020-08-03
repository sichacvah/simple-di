# simple-di

Usage:

```typescript
// composition root file

import { component, systemMap, using } from 'simple-di'
import { loggerComponent } from '@logger'
import { messagingComponent } from '@messaging'

const componentMap = {
  logger: loggerComponent,
  messaging: using(
    messagingComponent,
    deps: ['logger']
  )
}
```

```typescript
// @logger
import { FancyLogger } from 'fancy-logger-tool'
import { component } from 'simple-di'

const loggerClient = new FancyLogger()

export const loggerComponent = component(() => loggerClient)
```

```typescript
// @messaging
import { subscribe } from 'fancy-messaging-tool'
import { ILogger } from '@interfaces'
import { component } from 'simple-di'

interface Deps {
  logger: ILogger
}

class MessagingClient {
  unsubscribe?: () => {}

  start: ({ logger }: Deps) => {
    logger.logMessage('Start Listening')
    this.unsubscribe = subscribe()
  }

  stop: () => {
    if (this.unsubscribe) this.unsubscribe()
  }
}

const messagingClient = new MessagingClient()

export const messagingComponent = component(
  messagingClient.start,
  messagingClient.stop
)

```

