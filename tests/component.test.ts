import { component, using, systemMap, Lifecycle, start } from '../src'

const lifecycleA = {
  start: () => {
    console.log('startA')
    return lifecycleA
  },
  stop: () => {
    console.log('stopA')
    return lifecycleA
  }
}


const lifecycleB = {
  start: () => {

    return lifecycleB
  },
  stop: () => {
    return lifecycleB
  }
}

const compA = component(lifecycleA)

const compB = component(lifecycleB)

const initC = jest.fn().mockImplementation((a) => {
  console.log(a)
  return Promise.resolve(lifecycleC)
})

const lifecycleC = {
  start: initC,
  stop: async (c: any) => {
    return c
  }
}

const compC = component(lifecycleC)

describe('systemMap', () => {
  it('start with deps', async () => {
    const map = systemMap({
      a: compA,
      b: compB,
      c: using(compC, ['a', 'b'])
    })

    await start(map)

    expect(lifecycleC.start).toBeCalledWith({
      a: lifecycleA,
      b: lifecycleB
    })

  })

  it('start with complext deps', async () => {
    type Config = Lifecycle & { API_ENDPOINT: string, ANALYTICS_API: string } 
    const config: Config = {
      start: () => config,
      stop: () => config,
      API_ENDPOINT: 'https://example.com',
      ANALYTICS_API: 'https://analytics.com'
    }

    interface ErrorLoggingDeps {
      config: Config
    }

    class Analytics implements Lifecycle<{ config: Config}> {
      config?: Config

      start = ({ config }: { config: Config }) => {
        this.config = config
        return this
      }

      stop = (obj: any) => this

      captureEvent = () => {
        console.log('captureEvent')
      }
    }

    class ErrorLogging implements Lifecycle<ErrorLoggingDeps> {
      deps?: ErrorLoggingDeps
      start = (deps: ErrorLoggingDeps) => {
        this.deps = deps
        return this
      }
      stop = (deps: ErrorLoggingDeps) => {
        return this
      }

      captureMessage = (str: string) => {
        console.log('str - ', str)
      }
    }

    type HttpClientDeps = {
      config: Config,
      analytics: Analytics,
      errorLogging: ErrorLogging
    }

    class HttpClient implements Lifecycle<HttpClientDeps> {
      config!: Config
      analytics!: Analytics
      errorLogging!: ErrorLogging

      start = ({ config, analytics, errorLogging }: HttpClientDeps) => {
        this.config = config
        this.analytics = analytics
        this.errorLogging = errorLogging
        console.log(config, analytics, errorLogging)
        return this
      }

      stop = (p: any) => this
    }

    const map = systemMap({
      config: component(config),
      errorLogging: using(component(new ErrorLogging()), ['config']),
      analytics: using(component(new Analytics()), ['config']),
      httpClient: using(component(new HttpClient()), ['config', 'analytics', 'errorLogging'])
    })

    await start(map)
  })
})

