import { component, using, systemMap, Lifecycle, start } from '../src'

const lifecycleA = {
  start: (a: Lifecycle) => {
    console.log('startA')
    return a
  },
  stop: (a: Lifecycle) => {
    console.log('stopA')
    return a
  }
}

const lifecycleB = {
  start: (b: Lifecycle) => {
    const nextB = {
      ...b,
      config: { 'c': 'f' }
    }
    return nextB
  },
  stop: (b: Lifecycle) => {
    const nextB = {
      ...b,
      config: { 'c': 'f' }
    }
    return nextB
  }
}

const compA = component(lifecycleA)

const compB = component(lifecycleB)

const initC = jest.fn().mockImplementation((a) => {
  console.log('c - component', JSON.stringify(a))
  return Promise.resolve(a)
})

const lifecycleC = {
  start: initC,
  stop: async (c: Lifecycle) => {
    return c
  }
}

const compC = component(lifecycleC)

describe('systemMap', () => {
  it('start with deps', async () => {
    const map = systemMap({
      a: compA,
      b: compB,
      c: using(compC, ['a', 'b']),
      d: component({
        start: async (d) => d,
        stop: async (d) => d
      })
    })

    await start(map)

    expect(initC).toBeCalledWith({
      a: component(lifecycleA),
      b: {
        ...component(lifecycleB),
        config: { 'c': 'f' }
      },
      ...using(compC, ['a', 'b'])
    })

  })
})

