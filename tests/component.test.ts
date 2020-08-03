import { component, using, systemMap,  } from '../src/systemMap'

const named = (name: string) => ({
  name
})
const compA = component(() => { console.log('startA'); return named('A') }, () => { console.log('stopA') })

const compB = using(component((deps) => { console.log('start B with ', deps); return named('B') }), ['a'])

const initC = jest.fn()

const compC = using(component(initC), ['a', 'b'])


describe('systemMap', () => {
  it('start with deps', () => {
    systemMap({
      a: compA,
      b: compB,
      c: compC
    }).init()

    expect(initC).toBeCalledWith({
      a: named('A'),
      b: named('B')
    })

  })
})

