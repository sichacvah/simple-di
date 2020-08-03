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

const compC = using(component(initC), ['a', 'b'])


describe('systemMap', () => {
  it('start with deps', () => {
    const map = systemMap({
      a: compA,
      b: compB,
      c: compC
    })

    map.init()

    expect(initC).toBeCalledWith({
      a: named('A'),
      b: named('B')
    })

  })
})

