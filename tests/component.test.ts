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
    console.log('start B with ', b)
    return b
  },
  stop: (b: Lifecycle) => {
    return b
  }
}

const compA = component(lifecycleA)

const compB = component(lifecycleB)

const initC = jest.fn().mockImplementation((a) => {
  console.log('a', a)
  return a
})

const lifecycleC = {
  start: initC,
  stop: (c: Lifecycle) => {
    return c
  }
}

const compC = component(lifecycleC)

describe('systemMap', () => {
  it('start with deps', () => {
    const map = systemMap({
      a: compA,
      b: compB,
      c: using(compC, ['a', 'b']),
      d: component({
        start: (d) => d,
        stop: (d) => d
      })
    })

    start(map)

    expect(initC).toBeCalledWith({
      a: component(lifecycleA),
      b: component(lifecycleB),
      ...using(compC, ['a', 'b'])
    })

  })
})

