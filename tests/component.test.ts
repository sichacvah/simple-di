import { component, using, systemMap,  } from '../src/systemMap'

type Named = {
  name: string
}

const named = (name: string): Named => ({
  name
})
const compA = component(() => { console.log('startA'); return named('A') }, () => { console.log('stopA') })

type BDeps = {
  a: Named
}
const compB = using(component((deps?: BDeps) => { console.log('start B with ', deps); return named('B') }), ['a'])

const initC = jest.fn()

const compC = using(component<jest.Mock, { a: Named, b: Named }>(initC), ['a', 'b'])

type DDeps = {
  a: Named,
  b: Named,
  c: jest.Mock,
  d: Named
}

const compD = using(
  component((deps?: DDeps) => { return named('D') }),
  ['a', 'b']
)

describe('systemMap', () => {
  it('start with deps', () => {
    const map = systemMap<DDeps[keyof DDeps], DDeps>({
      a: compA,
      b: compB,
      c: compC,
      d: compD
    })

    map.init()

    expect(initC).toBeCalledWith({
      a: named('A'),
      b: named('B')
    })

  })
})

